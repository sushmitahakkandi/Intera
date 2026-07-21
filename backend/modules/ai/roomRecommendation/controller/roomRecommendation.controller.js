const roomRecommendationService = require('../service/roomRecommendation.service');
const roomRecommendationDTO = require('../dto/roomRecommendation.dto');

class RoomRecommendationController {
  async uploadRoomImage(req, res, next) {
    try {
      const userId = req.user ? req.user._id : '65f123456789abcdef012345';
      const roomType = req.body.roomType;
      const result = await roomRecommendationService.processAndAnalyze(req.file, userId, roomType, {
        budgetRange: req.body.budgetRange,
        budget: req.body.budget,
        stylePreference: req.body.stylePreference,
        roomGoal: req.body.roomGoal
      });
      
      const responseData = roomRecommendationDTO.formatUploadResult(
        result.savedRecord,
        result.recommendationPack?.topRecommendations || result.matchedProducts
      );

      res.status(201).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const userId = req.user ? req.user._id : '65f123456789abcdef012345';
      const historyList = await roomRecommendationService.getHistory(userId);
      const responseData = roomRecommendationDTO.formatHistoryList(historyList);
      
      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  }

  async deleteHistoryItem(req, res, next) {
    try {
      const { id } = req.params;
      await roomRecommendationService.deleteHistoryItem(id);
      
      res.status(200).json({ success: true, message: 'Analysis history entry deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomRecommendationController();
