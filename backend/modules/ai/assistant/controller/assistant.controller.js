const assistantService = require('../services/assistant.service');

exports.chat = async (req, res, next) => {
  try {
    const { message, sessionId, cartItems, wishlistItems } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const result = await assistantService.processChat({
      message,
      sessionId,
      userId,
      cartItems,
      wishlistItems
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = await assistantService.getSessionHistory(userId);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    await assistantService.deleteSession(id);
    res.json({ success: true, message: 'Session deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.feedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const updated = await assistantService.saveFeedback(id, rating, comment);
    res.json({ success: true, updated });
  } catch (error) {
    next(error);
  }
};

exports.conversion = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const result = await assistantService.logConversion(productId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await assistantService.getAdminStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
