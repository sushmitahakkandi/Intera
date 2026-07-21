const { normalizeStyle, styleKeywords, clamp } = require('../utils/roomAnalysisToolkit');

class InteriorStyleDetectionEngine {
  analyze(visionAnalysis, userPreferences = {}) {
    const style = normalizeStyle(userPreferences.stylePreference || visionAnalysis.style, visionAnalysis.style || 'Modern');
    const keywords = styleKeywords(style);

    return {
      style,
      styleKeywords: keywords,
      styleSignals: {
        roomType: visionAnalysis.roomType,
        furnitureLanguage: keywords.slice(0, 3),
        confidence: clamp(Number(visionAnalysis.styleConfidence || 76), 40, 99)
      },
      styleConfidence: clamp(Number(visionAnalysis.styleConfidence || 76), 40, 99)
    };
  }
}

module.exports = new InteriorStyleDetectionEngine();