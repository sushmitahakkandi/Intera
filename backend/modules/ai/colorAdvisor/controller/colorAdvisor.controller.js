const colorAdvisorService = require('../service/colorAdvisor.service');
const colorAdvisorDTO = require('../dto/colorAdvisor.dto');

class ColorAdvisorController {
  async uploadRoomImage(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id || 'guest';
      const { roomType, stylePreference, budgetRange } = req.body;

      const { saved, pipeline } = await colorAdvisorService.uploadAndAnalyze({
        file: req.file,
        userId,
        roomType,
        stylePreference,
        budgetRange
      });

      return res.status(200).json(colorAdvisorDTO.uploadResponse(saved, pipeline));
    } catch (error) {
      return next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id || 'guest';
      const items = await colorAdvisorService.getHistory(userId);
      return res.status(200).json(colorAdvisorDTO.historyResponse(items));
    } catch (error) {
      return next(error);
    }
  }

  async deleteHistoryItem(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id || 'guest';
      const removed = await colorAdvisorService.deleteHistoryItem(req.params.id, userId);
      if (!removed) {
        return res.status(404).json({ success: false, error: 'History item not found.' });
      }
      return res.status(200).json({ success: true, message: 'History item removed.' });
    } catch (error) {
      return next(error);
    }
  }

  async saveDesignLayout(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id || 'guest';
      const updated = await colorAdvisorService.saveDesignLayout({
        id: req.params.id,
        userId,
        layouts: req.body.layouts,
        activeLayout: req.body.activeLayout
      });
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Design layout not found or unauthorized' });
      }
      return res.status(200).json({ success: true, data: colorAdvisorDTO.uploadResponse(updated, updated) });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ColorAdvisorController();
