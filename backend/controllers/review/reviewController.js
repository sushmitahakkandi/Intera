const Review = require('../../models/Review/Review.model');

/**
 * Call Groq API to analyze sentiment, reasoning, and draft a response.
 */
const analyzeSentimentWithGroq = async (comment, rating) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.warn('Warning: GROQ_API_KEY is not defined in .env. Falling back to rule-based analysis.');
    return {
      sentiment: rating >= 4 ? 'Positive' : rating === 3 ? 'Neutral' : 'Negative',
      reasoning: 'Fallback rule-based sentiment assessment.',
      reply: `Thank you for your ${rating}-star feedback. We appreciate your input.`
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
            content: 'You are an AI reviews assistant for Mahaveer Smart Furniture Hub. Analyze the sentiment of the review comment and draft a polite merchant reply. Return a JSON object with keys: "sentiment" ("Positive" | "Neutral" | "Negative"), "reasoning" (a short sentence explaining why), and "reply" (a drafted professional reply to the customer).'
          },
          {
            role: 'user',
            content: `Rating: ${rating}\nComment: "${comment}"`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned status ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return {
      sentiment: result.sentiment || (rating >= 4 ? 'Positive' : rating === 3 ? 'Neutral' : 'Negative'),
      reasoning: result.reasoning || 'AI analysis completed.',
      reply: result.reply || 'Thank you for your feedback.'
    };
  } catch (error) {
    console.error('Error in Groq analysis:', error);
    return {
      sentiment: rating >= 4 ? 'Positive' : rating === 3 ? 'Neutral' : 'Negative',
      reasoning: 'Error performing AI analysis: ' + error.message,
      reply: `Thank you for your ${rating}-star feedback. We will look into your comments.`
    };
  }
};

/**
 * Get all reviews (Admin only, populated and searchable)
 */
const getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sentiment = req.query.sentiment || '';
    const status = req.query.status || '';

    const filter = {};
    if (sentiment) filter.aiSentiment = sentiment;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('product', 'name thumbnail sku')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter)
    ]);

    res.status(200).json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Moderate a review's approval status (Approved, Rejected)
 */
const moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true })
      .populate('product', 'name thumbnail sku')
      .populate('user', 'name email');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json({ message: 'Review moderation updated successfully', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Submit merchant reply to a review
 */
const postMerchantReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const review = await Review.findByIdAndUpdate(id, { merchantReply: reply }, { new: true })
      .populate('product', 'name thumbnail sku')
      .populate('user', 'name email');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json({ message: 'Merchant reply posted successfully', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Trigger Groq AI analysis on-demand (Refresh Review)
 */
const refreshReviewAI = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const aiResult = await analyzeSentimentWithGroq(review.comment, review.rating);

    review.aiSentiment = aiResult.sentiment;
    review.aiReasoning = aiResult.reasoning;
    review.aiReply = aiResult.reply;

    await review.save();

    const populated = await Review.findById(id)
      .populate('product', 'name thumbnail sku')
      .populate('user', 'name email');

    res.status(200).json({ message: 'AI re-analysis completed successfully', review: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Submit a new review (Customer storefront)
 */
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating, and comment are required.' });
    }

    // Run Groq AI analysis on-the-fly
    const aiResult = await analyzeSentimentWithGroq(comment, rating);

    const review = new Review({
      product: productId,
      user: userId,
      rating: Number(rating),
      comment,
      aiSentiment: aiResult.sentiment,
      aiReasoning: aiResult.reasoning,
      aiReply: aiResult.reply,
      status: 'Pending' // Requires admin approval
    });

    await review.save();

    // Trigger real-time admin sync via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('review_added');
    }

    res.status(201).json({ message: 'Review submitted successfully and is pending moderation.', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get logged-in user's reviews (Customer storefront)
 */
const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviews = await Review.find({ user: userId })
      .populate('product', 'name thumbnailUrl sku')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete review (Customer or Admin)
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    // Authorize owner or admin
    if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await Review.findByIdAndDelete(id);

    // Notify sockets
    const io = req.app.get('io');
    if (io) {
      io.emit('review_added'); // refreshes lists
    }

    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getReviews,
  moderateReview,
  postMerchantReply,
  refreshReviewAI,
  analyzeSentimentWithGroq,
  createReview,
  getMyReviews,
  deleteReview
};
