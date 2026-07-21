const RoomAnalysis = require('../../../../models/RoomAnalysis/RoomAnalysis.model');

class RoomRecommendationRepository {
  async create(analysisData) {
    const analysis = new RoomAnalysis(analysisData);
    return await analysis.save();
  }

  async findByUserId(userId) {
    return await RoomAnalysis.find({ userId })
      .populate({
        path: 'recommendedProducts',
        populate: ['category', 'material', 'color', 'brand']
      })
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await RoomAnalysis.findById(id)
      .populate({
        path: 'recommendedProducts',
        populate: ['category', 'material', 'color', 'brand']
      });
  }

  async delete(id) {
    return await RoomAnalysis.findByIdAndDelete(id);
  }
}

module.exports = new RoomRecommendationRepository();
