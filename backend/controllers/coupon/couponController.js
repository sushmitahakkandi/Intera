const Coupon = require('../../models/Coupon/Coupon.model');

/**
 * Call Groq API to generate an AI marketing coupon.
 */
const generateAICouponPrompt = async (campaignGoal, discountType, additionalContext = '') => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.warn('Warning: GROQ_API_KEY is not defined in .env. Falling back to rule-based coupon generation.');
    return {
      code: `${campaignGoal.substring(0, 4).toUpperCase()}${discountType === 'percentage' ? '25' : '1500'}`,
      discountValue: discountType === 'percentage' ? 25 : 1500,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `Special discount generated for campaign goal: ${campaignGoal}.`
    };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an AI marketing copywriter for Mahaveer Smart Furniture Hub. Generate a strategic, catchy discount coupon code based on the user\'s criteria. Return a JSON object with keys: "code" (uppercase, short, alphanumeric, no spaces, e.g. FESTIVE15, RETENTION500), "discountValue" (a sensible number: between 5 and 30 for percentage, or between 200 and 5000 for flat), "expiryDate" (date string in YYYY-MM-DD format, recommended to be 15 to 45 days from today), and "description" (a friendly marketing description explaining the rules/offer).'
          },
          {
            role: 'user',
            content: `Campaign Goal: ${campaignGoal}\nDiscount Strategy: ${discountType}\nAdditional context/requirements: ${additionalContext}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return {
      code: (result.code || 'AICoupon').toUpperCase().replace(/\s+/g, ''),
      discountValue: Number(result.discountValue) || (discountType === 'percentage' ? 15 : 1000),
      expiryDate: result.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: result.description || `Get ${discountType === 'percentage' ? '15%' : '₹1,000'} off with this code!`
    };
  } catch (error) {
    console.error('Error in Groq coupon generation:', error);
    return {
      code: `AI${campaignGoal.substring(0, 4).toUpperCase()}${discountType === 'percentage' ? '15' : '1000'}`,
      discountValue: discountType === 'percentage' ? 15 : 1000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `AI generated coupon recommendation for ${campaignGoal}.`
    };
  }
};

/**
 * Get all coupons
 */
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new coupon
 */
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minPurchase, expiryDate, description, aiGenerated, aiCampaignGoal } = req.body;

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({ error: 'Code, discount value, and expiry date are required.' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'A coupon with this code already exists.' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      expiryDate,
      description,
      aiGenerated: aiGenerated || false,
      aiCampaignGoal: aiCampaignGoal || ''
    });

    await coupon.save();
    res.status(201).json({ message: 'Coupon created successfully.', coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Toggle a coupon's active/inactive status
 */
const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found.' });
    }

    coupon.status = coupon.status === 'Active' ? 'Inactive' : 'Active';
    await coupon.save();

    res.status(200).json({ message: 'Coupon status toggled successfully.', coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a coupon
 */
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found.' });
    }
    res.status(200).json({ message: 'Coupon deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Validate coupon code during shopping cart checkout
 */
const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code.' });
    }

    if (coupon.status !== 'Active') {
      return res.status(400).json({ error: 'This coupon is inactive.' });
    }

    const now = new Date();
    if (new Date(coupon.expiryDate) < now) {
      return res.status(400).json({ error: 'This coupon has expired.' });
    }

    if (subtotal && subtotal < coupon.minPurchase) {
      return res.status(400).json({ 
        error: `Minimum purchase of ₹${coupon.minPurchase.toLocaleString()} required to use this coupon.` 
      });
    }

    res.status(200).json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      description: coupon.description
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Generate a smart AI Coupon
 */
const generateAICoupon = async (req, res) => {
  try {
    const { campaignGoal, discountType, additionalContext } = req.body;
    if (!campaignGoal || !discountType) {
      return res.status(400).json({ error: 'Campaign goal and discount type are required.' });
    }

    const result = await generateAICouponPrompt(campaignGoal, discountType, additionalContext);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all active coupons (for customer/public storefront)
 */
const getActiveCoupons = async (req, res) => {
  try {
    const activeCoupons = await Coupon.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.status(200).json(activeCoupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
  validateCoupon,
  generateAICoupon,
  getActiveCoupons
};
