const ColorDesignAnalysis = require('../../../../models/ColorDesignAnalysis/ColorDesignAnalysis.model');

class ColorAdvisorRepository {
  async create(payload) {
    return ColorDesignAnalysis.create(payload);
  }

  async findHistoryByUser(userId, limit = 20) {
    return ColorDesignAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async findLatestGuest(limit = 20) {
    return ColorDesignAnalysis.find({ userId: 'guest' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async removeById(id, userId) {
    return ColorDesignAnalysis.findOneAndDelete({ _id: id, userId });
  }

  async updateLayout(id, userId, { layouts, activeLayout }) {
    return ColorDesignAnalysis.findOneAndUpdate(
      { _id: id, userId },
      { $set: { savedLayouts: layouts, activeLayout } },
      { new: true }
    );
  }
}

module.exports = new ColorAdvisorRepository();
