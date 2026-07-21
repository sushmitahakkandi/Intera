const { clamp, roomTypeToCategories } = require('../utils/roomAnalysisToolkit');

class LayoutOptimizationEngine {
  optimize({ visionAnalysis, spatialAnalysis, recommendationPack, userPreferences = {} }) {
    const roomType = visionAnalysis.roomType || 'Living Room';
    const categories = roomTypeToCategories(roomType);
    const topCategories = [...new Set((recommendationPack.topRecommendations || []).map((item) => item.category))];
    const missingFurniture = categories.filter((category) => !topCategories.some((top) => top.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(top.toLowerCase())));

    const layoutSuggestion = spatialAnalysis.roomLayout?.focalZone
      ? `Place the main ${roomType === 'Bedroom' ? 'bed' : 'anchor furniture'} at the ${spatialAnalysis.roomLayout.focalZone.toLowerCase()}, then keep ${spatialAnalysis.roomLayout.circulationPath.toLowerCase()} ${userPreferences.stylePreference ? `The plan also follows the ${userPreferences.stylePreference} preference.` : ''}`.trim()
      : `Use a balanced ${roomType.toLowerCase()} layout with clear circulation around the main furniture cluster.`;

    const improvementBefore = clamp(Math.round(40 + (spatialAnalysis.freeSpacePercentage / 4) - (roomType === 'Compact' ? 6 : 0)), 28, 72);
    const improvementAfter = clamp(Math.round(improvementBefore + ((recommendationPack.topRecommendations?.[0]?.recommendationScore || recommendationPack.topRecommendations?.[0]?.score || 70) / 2.4)), 45, 96);

    return {
      layoutSuggestion,
      recommendedFurnitureLayout: spatialAnalysis.roomLayout,
      spaceOptimizationTips: spatialAnalysis.spaceOptimizationTips || [],
      missingFurnitureSuggestions: missingFurniture.map((category) => `Consider adding a ${category.toLowerCase()} to complete the room.`),
      improvementScoreBefore: improvementBefore,
      improvementScoreAfter: improvementAfter
    };
  }
}

module.exports = new LayoutOptimizationEngine();