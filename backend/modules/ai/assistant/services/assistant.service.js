const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const Product = require('../../../../models/Product/Product.model');
const Coupon = require('../../../../models/Coupon/Coupon.model');
const Order = require('../../../../models/Order/Order.model');
const Review = require('../../../../models/Review/Review.model');
const RoomAnalysis = require('../../../../models/RoomAnalysis/RoomAnalysis.model');
// Models for AI Assistant session storage and event analytics
const AssistantSession = require('../../../../models/AssistantSession/AssistantSession.model');
const AssistantAnalytics = require('../../../../models/AssistantAnalytics/AssistantAnalytics.model');

const comparisonService = require('./comparisonService');
const budgetPlannerService = require('./budgetPlannerService');
const storageService = require('../../../../services/storageService');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'MOCK_KEY');

class AssistantService {
  async processChat({ message, sessionId, userId, cartItems = [], wishlistItems = [] }) {
    // 1. Fetch User Context
    let userName = 'Customer';
    let previousOrders = [];
    let latestRoomScan = null;

    if (userId) {
      // Find User previous orders
      previousOrders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();
    }

    // Fetch latest room scan for the user
    latestRoomScan = await RoomAnalysis.findOne(userId ? { userId } : {})
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch Active Coupons
    const activeCoupons = await Coupon.find({ status: 'Active' })
      .limit(5)
      .lean();

    // 3. Fetch Active Catalog Products
    const dbProducts = await Product.find({ availability: 'In Stock', stock: { $gt: 0 } })
      .populate('category', 'name')
      .populate('material', 'name')
      .populate('color', 'name')
      .sort({ rating: -1 })
      .limit(40)
      .lean();

    const catalogSummary = dbProducts.map(p => ({
      id: p._id.toString(),
      name: p.name,
      price: p.discountPrice || p.price,
      category: p.category?.name || 'General',
      material: p.material?.name || 'Wood',
      color: p.color?.name || 'Brown',
      dimensions: p.dimensions,
      rating: p.rating,
      stock: p.stock
    }));

    // 4. Check if message matches comparison or budget planning keywords
    const lowerMsg = message.toLowerCase();
    let comparisonResult = null;
    let budgetResult = null;

    if (lowerMsg.includes('compare') || lowerMsg.includes('versus') || lowerMsg.includes(' vs ')) {
      // Extract matches for comparison from the database products
      const matchedProductIds = [];
      dbProducts.forEach(p => {
        if (lowerMsg.includes(p.name.toLowerCase()) || lowerMsg.includes(p.sku?.toLowerCase() || '')) {
          matchedProductIds.push(p._id);
        }
      });

      if (matchedProductIds.length < 2) {
        // Fallback: take top 2 products of the same category if name not found
        const catName = dbProducts[0]?.category?.name;
        const fallbackIds = dbProducts
          .filter(p => p.category?.name === catName)
          .slice(0, 2)
          .map(p => p._id);
        comparisonResult = await comparisonService.compareProducts(fallbackIds, message);
      } else {
        comparisonResult = await comparisonService.compareProducts(matchedProductIds, message);
      }
    }

    if (lowerMsg.includes('budget') || lowerMsg.includes('package') || lowerMsg.includes('plan')) {
      // Extract budget number from query
      const numbers = lowerMsg.match(/\d+/g);
      const targetBudget = numbers ? parseInt(numbers[0]) : 80000;
      const roomType = lowerMsg.includes('bedroom') ? 'Bedroom' : (lowerMsg.includes('dining') ? 'Dining Room' : 'Living Room');
      budgetResult = await budgetPlannerService.planBudget(targetBudget, roomType);
    }

    // 5. Build Dynamic Prompt
    const systemPrompt = `
You are the production-ready "Intelligent Furniture Shopping Decision Assistant" for Mahaveer Smart Furniture Hub.
Answer questions confidently, provide style, color, maintenance advice, or product recommendations using REAL data.

INSTRUCTIONS AND CONSTRAINTS:
1. PRIORITIZE the user's explicit questions and room mentions. For example, if the user asks about their "house", "living room", or general settings, answer generally for homes and do NOT restrict or frame your entire response around the background "Scanned Room" context (e.g. do not assume they want it for an "Office" if they ask about their "house" or "living room").
2. Only focus on the "Scanned Room" context if the user explicitly asks about their scanned room (e.g., "what fits my scanned space?"), or if it fits their query naturally. Do not start sentences with "For your office..." unless they explicitly asked about their office or their scanned room.
3. Compare wood vs metal sofas objectively if asked, and recommend high-quality matching products.

DATABASE CATALOG PRODUCTS AVAILABLE:
${JSON.stringify(catalogSummary)}

ACTIVE COUPONS:
${JSON.stringify(activeCoupons.map(c => ({ code: c.code, value: c.discountValue, minPurchase: c.minPurchase })))}

USER STATE CONTEXT:
- Cart Items: ${JSON.stringify(cartItems)}
- Wishlist Items: ${JSON.stringify(wishlistItems)}
- Previous Orders: ${JSON.stringify(previousOrders.map(o => ({ id: o._id, total: o.totalAmount, status: o.status })))}
- Scanned Room (AI Color Match/Room Recommendation): ${JSON.stringify(latestRoomScan ? { type: latestRoomScan.roomType, style: latestRoomScan.detectedStyle, wallColors: latestRoomScan.detectedColors } : 'None')}

User Message: "${message}"

Return STRICT JSON only adhering to this schema:
{
  "reply": "friendly natural language explanation including style, color, maintenance tips, delivery info, and reasoning...",
  "recommendedProductIds": ["id1", "id2"],
  "explainableAI": {
    "id1": {
      "matchPercentage": 95,
      "reason": "matches wall paint and fits budget",
      "styleCompatibility": "High|Medium|Low",
      "colorCompatibility": "High|Medium|Low",
      "materialCompatibility": "High|Medium|Low",
      "budgetCompatibility": "High|Medium|Low",
      "spaceCompatibility": "High|Medium|Low",
      "availability": "In Stock"
    }
  },
  "intentMatched": "recommendation|comparison|budget|coupon|general"
}
`;

    let aiResponse = {
      reply: 'Hello! I am your Mahaveer Smart Furniture Assistant. How can I help you style or budget today?',
      recommendedProductIds: [],
      explainableAI: {},
      intentMatched: 'general'
    };

    let apiSuccess = false;

    // A. Attempt Gemini Flash first
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'placeholder_secret_key') {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3 }
        });

        const result = await model.generateContent(systemPrompt);
        const parsed = JSON.parse(result.response.text());
        if (parsed && parsed.reply) {
          aiResponse = parsed;
          apiSuccess = true;
        }
      } catch (err) {
        console.error('Gemini call failed in assistantService:', err.message);
      }
    }

    // B. Attempt Groq fallback if Gemini is unconfigured or failed
    if (!apiSuccess && process.env.GROQ_API_KEY) {
      try {
        console.log('Attempting Groq (llama-3.3-70b-versatile) fallback chat call...');
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'user', content: systemPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );

        const content = response.data.choices[0].message.content;
        const parsed = JSON.parse(content);
        if (parsed && parsed.reply) {
          aiResponse = parsed;
          apiSuccess = true;
          console.log('Groq fallback call succeeded!');
        }
      } catch (groqErr) {
        console.error('Groq fallback failed in assistantService:', groqErr.response ? groqErr.response.data : groqErr.message);
      }
    }

    // C. Rigid Local Fallback (if both APIs are offline/unreachable)
    if (!apiSuccess) {
      let categoryKeyword = null;
        if (lowerMsg.includes('sofa') || lowerMsg.includes('couch') || lowerMsg.includes('sectional') || lowerMsg.includes('loveseat')) {
          categoryKeyword = 'Sofa';
        } else if (lowerMsg.includes('chair') || lowerMsg.includes('recliner') || lowerMsg.includes('stool') || lowerMsg.includes('armchair')) {
          categoryKeyword = 'Chair';
        } else if (lowerMsg.includes('bed') || lowerMsg.includes('mattress') || lowerMsg.includes('bedroom')) {
          categoryKeyword = 'Bed';
        } else if (lowerMsg.includes('dining')) {
          categoryKeyword = 'Dining';
        } else if (lowerMsg.includes('table') || lowerMsg.includes('desk') || lowerMsg.includes('coffee table')) {
          categoryKeyword = 'Tables';
        } else if (lowerMsg.includes('cupboard') || lowerMsg.includes('wardrobe') || lowerMsg.includes('cabinet') || lowerMsg.includes('storage') || lowerMsg.includes('drawer')) {
          categoryKeyword = 'Storage';
        }

        let materialKeyword = null;
        if (lowerMsg.includes('leather')) {
          materialKeyword = 'leather';
        } else if (lowerMsg.includes('wood') || lowerMsg.includes('wooden') || lowerMsg.includes('walnut') || lowerMsg.includes('oak')) {
          materialKeyword = 'wood';
        } else if (lowerMsg.includes('metal') || lowerMsg.includes('steel') || lowerMsg.includes('iron')) {
          materialKeyword = 'metal';
        } else if (lowerMsg.includes('fabric') || lowerMsg.includes('velvet') || lowerMsg.includes('upholstered')) {
          materialKeyword = 'fabric';
        }

        let colorKeyword = null;
        if (lowerMsg.includes('brown') || lowerMsg.includes('tan')) {
          colorKeyword = 'brown';
        } else if (lowerMsg.includes('grey') || lowerMsg.includes('gray') || lowerMsg.includes('charcoal')) {
          colorKeyword = 'grey';
        } else if (lowerMsg.includes('black') || lowerMsg.includes('dark')) {
          colorKeyword = 'black';
        } else if (lowerMsg.includes('white') || lowerMsg.includes('beige') || lowerMsg.includes('cream')) {
          colorKeyword = 'white';
        } else if (lowerMsg.includes('yellow') || lowerMsg.includes('gold')) {
          colorKeyword = 'yellow';
        } else if (lowerMsg.includes('green') || lowerMsg.includes('olive')) {
          colorKeyword = 'green';
        }

        let maxBudget = null;
        const budgetMatches = lowerMsg.match(/(?:under|below|less than|budget of|₹|\$)\s*([0-9,]+)/i);
        if (budgetMatches) {
          maxBudget = parseInt(budgetMatches[1].replace(/,/g, ''));
        }

        let filtered = [...dbProducts];
        if (categoryKeyword) {
          filtered = filtered.filter(p => p.category?.name?.toLowerCase() === categoryKeyword.toLowerCase());
        }
        if (materialKeyword) {
          filtered = filtered.filter(p => 
            p.material?.name?.toLowerCase().includes(materialKeyword) ||
            p.name?.toLowerCase().includes(materialKeyword)
          );
        }
        if (colorKeyword) {
          filtered = filtered.filter(p => 
            p.color?.name?.toLowerCase().includes(colorKeyword) ||
            p.name?.toLowerCase().includes(colorKeyword)
          );
        }
        if (maxBudget) {
          filtered = filtered.filter(p => (p.discountPrice || p.price) <= maxBudget);
        }

        if (filtered.length === 0 && categoryKeyword) {
          filtered = dbProducts.filter(p => p.category?.name?.toLowerCase() === categoryKeyword.toLowerCase());
        }

        const finalProducts = filtered.slice(0, 3);

        if (categoryKeyword) {
          let criteriaDesc = `${categoryKeyword.toLowerCase()}s`;
          if (materialKeyword) criteriaDesc = `${materialKeyword} ${criteriaDesc}`;
          if (colorKeyword) criteriaDesc = `${colorKeyword} ${criteriaDesc}`;
          if (maxBudget) criteriaDesc = `${criteriaDesc} under ₹${maxBudget.toLocaleString('en-IN')}`;

          let reply = `Based on your request, I found some beautiful **${criteriaDesc}** from our premium collection. `;
          
          if (categoryKeyword === 'Sofa') {
            if (colorKeyword === 'grey' || lowerMsg.includes('grey') || lowerMsg.includes('gray')) {
              reply += "Grey is an exceptionally versatile choice. A grey sofa pairs beautifully with neutral wall tones, bold mustard accent pillows, and warm wooden coffee tables to create a balanced, modern minimalist ambiance.";
            } else if (materialKeyword === 'leather') {
              reply += "Premium leather sofas provide unmatched durability and develop a beautiful patina over time. Regular dust-wiping and keeping them away from direct sunlight will preserve their luxurious finish for decades.";
            } else {
              reply += "For living rooms, positioning the sofa opposite the main light source helps expand the room visually. Add a soft rug under the front legs to frame the conversation area.";
            }
          } else if (categoryKeyword === 'Bed') {
            reply += "When planning your bedroom layout, try to position the bed against a solid wall with clear walking space on both sides. Using solid wood beds provides excellent structural support and long-lasting stability.";
          } else if (categoryKeyword === 'Tables' || categoryKeyword === 'Dining') {
            reply += "A dining or coffee table forms the centerpiece of the room. Wood tables bring natural warmth and grain patterns, while glass or metal elements introduce a sleek, modern touch.";
          } else {
            reply += "These catalog pieces match your style requirements perfectly. Let me know if you would like to compare them or check dimensions!";
          }

          const explainableAI = {};
          finalProducts.forEach(p => {
            explainableAI[p._id.toString()] = {
              matchPercentage: Math.floor(Math.random() * 15) + 81,
              reason: `matches category: ${categoryKeyword}${materialKeyword ? `, material: ${materialKeyword}` : ''}${colorKeyword ? `, color: ${colorKeyword}` : ''}`,
              styleCompatibility: "High",
              colorCompatibility: colorKeyword ? "High" : "Medium",
              materialCompatibility: materialKeyword ? "High" : "Medium",
              budgetCompatibility: maxBudget ? "High" : "Medium",
              spaceCompatibility: "High",
              availability: "In Stock"
            };
          });

          aiResponse = {
            reply,
            recommendedProductIds: finalProducts.map(p => p._id.toString()),
            explainableAI,
            intentMatched: 'recommendation'
          };

        } else {
          if (lowerMsg.includes('color') || lowerMsg.includes('paint') || lowerMsg.includes('palette') || lowerMsg.includes('match')) {
            aiResponse = {
              reply: "For interior color coordination, we recommend following the 60-30-10 rule: 60% dominant color (usually walls/flooring), 30% secondary color (upholstery, large rugs, furniture), and 10% accent color (cushions, art, lighting). If you have neutral walls (beige or white), earth tones like forest green, rust orange, and deep brown furniture create a warm, inviting feel.",
              recommendedProductIds: [],
              explainableAI: {},
              intentMatched: 'general'
            };
          } else if (lowerMsg.includes('small room') || lowerMsg.includes('space saving') || lowerMsg.includes('studio') || lowerMsg.includes('10x10') || lowerMsg.includes('dimension')) {
            aiResponse = {
              reply: "In smaller spaces, multi-functional furniture is key! Opt for sofas with built-in storage drawers, extendable dining tables, or nesting coffee tables that can be tucked away when not in use. Raising furniture on legs (like our tapered-leg Mid-Century styles) also allows light to pass underneath, making the room feel larger.",
              recommendedProductIds: [],
              explainableAI: {},
              intentMatched: 'general'
            };
          } else if (lowerMsg.includes('clean') || lowerMsg.includes('maintain') || lowerMsg.includes('care') || lowerMsg.includes('polish')) {
            aiResponse = {
              reply: "To keep your furniture pristine:\n1. **Solid Wood**: Dust regularly with a microfiber cloth. Use wood polish once a year, and clean spills immediately to prevent water rings.\n2. **Leather**: Wipe with a damp cloth. Use a leather conditioner every 6–12 months to prevent cracking.\n3. **Upholstery/Fabric**: Vacuum weekly and treat stains instantly with a mild detergent spray.",
              recommendedProductIds: [],
              explainableAI: {},
              intentMatched: 'general'
            };
          } else if (lowerMsg.includes('coupon') || lowerMsg.includes('discount') || lowerMsg.includes('offer') || lowerMsg.includes('promo')) {
            let couponList = activeCoupons && activeCoupons.length > 0
              ? activeCoupons.map(c => `• **${c.code}**: Get ${c.discountValue}% off on purchases above ₹${c.minPurchase.toLocaleString('en-IN')}`).join('\n')
              : "";
            aiResponse = {
              reply: couponList
                ? `Yes, we have active promotional coupons you can apply at checkout!\n\n${couponList}\n\nSimply apply the code during checkout to save!`
                : "We don't have active coupon codes right now, but we offer special direct discounts on our premium bundles! Feel free to ask about our living room or bedroom package options.",
              recommendedProductIds: [],
              explainableAI: {},
              intentMatched: 'coupon'
            };
          } else if (lowerMsg.includes('delivery') || lowerMsg.includes('ship') || lowerMsg.includes('shipping') || lowerMsg.includes('location')) {
            aiResponse = {
              reply: "We offer professional white-glove home delivery and complimentary assembly across major cities. Delivery typically takes 3 to 7 business days depending on your location. Our delivery team will carefully unbox, inspect, and assemble your new furniture in the exact spot you prefer!",
              recommendedProductIds: [],
              explainableAI: {},
              intentMatched: 'general'
            };
          } else if (lowerMsg.includes('warranty') || lowerMsg.includes('guarantee') || lowerMsg.includes('return') || lowerMsg.includes('refund')) {
            aiResponse = {
              reply: "All Mahaveer furniture pieces come with a 1-Year Comprehensive Warranty covering manufacturing defects and structural issues. We also offer a hassle-free 7-day return policy for unused items in their original packaging. Your satisfaction is our absolute priority!",
              recommendedProductIds: [],
              explainableAI: {},
              intentMatched: 'general'
            };
          } else if (lowerMsg.includes('popular') || lowerMsg.includes('best') || lowerMsg.includes('trending') || lowerMsg.includes('top selling')) {
            const trendProds = dbProducts.slice(0, 3);
            const explainableAI = {};
            trendProds.forEach(p => {
              explainableAI[p._id.toString()] = {
                matchPercentage: 96,
                reason: "Top Customer Rated Best-Seller",
                styleCompatibility: "High",
                colorCompatibility: "High",
                materialCompatibility: "High",
                budgetCompatibility: "High",
                spaceCompatibility: "High",
                availability: "In Stock"
              };
            });
            aiResponse = {
              reply: "Here are three of our absolute best-selling, top-rated products loved by our customers. They combine timeless design with durable materials:",
              recommendedProductIds: trendProds.map(p => p._id.toString()),
              explainableAI,
              intentMatched: 'recommendation'
            };
          } else if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey') || lowerMsg.includes('greetings')) {
            aiResponse = {
              reply: "Hello! 👋 I am your Mahaveer Smart Furniture Advisor. How can I help you style your home today? Ask me for product recommendations, budget bundles, side-by-side comparisons, style compatibility tips, or coupon codes!",
              recommendedProductIds: [],
              explainableAI: {},
              intentMatched: 'general'
            };
          } else if (lowerMsg.includes('thank') || lowerMsg.includes('thanks')) {
            aiResponse = {
              reply: "You're very welcome! I'm glad I could help you. Let me know if you need any more suggestions for styling or layout!",
              recommendedProductIds: [],
              explainableAI: {},
              intentMatched: 'general'
            };
          } else {
            aiResponse = {
              reply: "I'm here to help you design, style, and shop for your home! You can ask me questions like:\n\n• *'Recommend leather sofas under ₹80,000'*\n• *'What furniture suits walnut flooring?'*\n• *'How do I clean and maintain a solid wood table?'*\n• *'Create a bedroom budget package for ₹90,000'*\n• *'Do you have any discount coupons?'*\n\nWhat styling topic or catalog category would you like to explore?",
              recommendedProductIds: [],
              explainableAI: {},
              intentMatched: 'general'
            };
          }
        }
      }

    // 6. Populate Recommended Products from MongoDB (with S3 url mapping)
    let populatedProducts = [];
    const recIds = aiResponse.recommendedProductIds || [];
    
    if (recIds.length > 0) {
      const dbRecs = await Product.find({ _id: { $in: recIds } })
        .populate('category', 'name')
        .populate('material', 'name')
        .populate('color', 'name')
        .lean({ virtuals: true });

      populatedProducts = dbRecs.map(prod => {
        const imageUrl = prod.thumbnail
          ? storageService.resolveImageUrl(prod.thumbnail)
          : '';
        return {
          ...prod,
          image: imageUrl
        };
      });
    } else if (aiResponse.intentMatched && aiResponse.intentMatched !== 'general') {
      // Fallback: send top 2 trending products if no products were suggested by Gemini but the user intent was shopping/styling/decor
      const fallbacks = await Product.find({ availability: 'In Stock' })
        .populate('category', 'name')
        .populate('material', 'name')
        .populate('color', 'name')
        .limit(2)
        .lean({ virtuals: true });

      populatedProducts = fallbacks.map(prod => ({
        ...prod,
        image: prod.thumbnail ? storageService.resolveImageUrl(prod.thumbnail) : ''
      }));
    } else {
      populatedProducts = [];
    }

    // 7. Format and Persist Session History
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let session = null;

    if (sessionId) {
      session = await AssistantSession.findById(sessionId);
    }

    if (!session) {
      session = new AssistantSession({
        userId: userId || null,
        title: message.slice(0, 30) + '...',
        messages: []
      });
    }

    // Append User Message
    session.messages.push({
      sender: 'user',
      text: message,
      timestamp
    });

    // Append AI Message
    session.messages.push({
      sender: 'ai',
      text: aiResponse.reply,
      timestamp,
      products: populatedProducts.map(p => p._id),
      confidenceScores: aiResponse.explainableAI || {},
      comparisonTable: comparisonResult,
      budgetPackage: budgetResult
    });

    await session.save();

    // 8. Log Analytics events asynchronously
    await this.logAnalytics(message, populatedProducts, aiResponse.intentMatched);

    return {
      session,
      reply: aiResponse.reply,
      suggestedProducts: populatedProducts,
      explainableAI: aiResponse.explainableAI || {},
      comparisonTable: comparisonResult,
      budgetPackage: budgetResult
    };
  }

  async logAnalytics(message, products, intent) {
    try {
      // 1. FAQ Analytics
      let faqKey = 'general';
      if (message.toLowerCase().includes('sofa')) faqKey = 'sofa match';
      else if (message.toLowerCase().includes('table')) faqKey = 'table match';
      else if (message.toLowerCase().includes('budget')) faqKey = 'budget planning';
      else if (message.toLowerCase().includes('compare')) faqKey = 'product comparison';
      else if (message.toLowerCase().includes('delivery')) faqKey = 'delivery inquiry';

      await AssistantAnalytics.create({
        eventType: 'faq',
        value: faqKey,
        meta: { query: message }
      });

      // 2. Recommended Products
      for (const prod of products) {
        await AssistantAnalytics.create({
          eventType: 'recommendation',
          value: prod.name,
          productId: prod._id
        });
      }

      // 3. Styles & Colors Preference
      if (message.toLowerCase().includes('modern')) {
        await AssistantAnalytics.create({ eventType: 'preference_style', value: 'Modern' });
      }
      if (message.toLowerCase().includes('wood') || message.toLowerCase().includes('walnut')) {
        await AssistantAnalytics.create({ eventType: 'preference_color', value: 'Walnut/Wood' });
      }
    } catch (err) {
      console.error('Error logging assistant analytics:', err);
    }
  }

  async getSessionHistory(userId) {
    const sessions = await AssistantSession.find({ userId })
      .sort({ updatedAt: -1 })
      .populate('messages.products')
      .lean();

    return sessions.map(session => {
      if (session.messages) {
        session.messages = session.messages.map(msg => {
          if (msg.products && msg.products.length > 0) {
            msg.products = msg.products.map(prod => {
              if (prod) {
                return {
                  ...prod,
                  image: prod.thumbnail ? storageService.resolveImageUrl(prod.thumbnail) : ''
                };
              }
              return prod;
            });
          }
          return msg;
        });
      }
      return session;
    });
  }

  async deleteSession(sessionId) {
    return AssistantSession.findByIdAndDelete(sessionId);
  }

  async saveFeedback(sessionId, rating, comment) {
    const session = await AssistantSession.findById(sessionId);
    if (session) {
      session.feedback = { rating, comment };
      await session.save();

      // Log to analytics
      await AssistantAnalytics.create({
        eventType: 'satisfaction',
        value: `rating-${rating}`,
        rating
      });
    }
    return session;
  }

  async logConversion(productId) {
    await AssistantAnalytics.create({
      eventType: 'conversion',
      value: 'add_to_cart',
      productId
    });
    return { success: true };
  }

  async getAdminStats() {
    // 1. Frequently asked questions count
    const faqStats = await AssistantAnalytics.aggregate([
      { $match: { eventType: 'faq' } },
      { $group: { _id: '$value', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 2. Most recommended products count
    const recommendedStats = await AssistantAnalytics.aggregate([
      { $match: { eventType: 'recommendation' } },
      { $group: { _id: '$value', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 3. Conversion Rate calculation
    const conversions = await AssistantAnalytics.countDocuments({ eventType: 'conversion' });
    const totalRecommendations = await AssistantAnalytics.countDocuments({ eventType: 'recommendation' });
    const conversionRate = totalRecommendations > 0 ? ((conversions / totalRecommendations) * 100).toFixed(1) : 0;

    // 4. Popular style preferences count
    const styleStats = await AssistantAnalytics.aggregate([
      { $match: { eventType: 'preference_style' } },
      { $group: { _id: '$value', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 5. Popular color preferences count
    const colorStats = await AssistantAnalytics.aggregate([
      { $match: { eventType: 'preference_color' } },
      { $group: { _id: '$value', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 6. Satisfaction ratings
    const satisfactionStats = await AssistantAnalytics.aggregate([
      { $match: { eventType: 'satisfaction' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    return {
      faqStats,
      recommendedStats,
      conversionRate,
      styleStats,
      colorStats,
      avgSatisfaction: satisfactionStats[0]?.avgRating || 4.7
    };
  }
}

module.exports = new AssistantService();
