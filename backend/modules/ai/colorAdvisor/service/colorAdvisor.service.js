const storageService = require('../../../../services/storageService');
const visionAnalysisEngine = require('../engines/visionAnalysisEngine');
const recommendationEngine = require('../engines/recommendationEngine');
const repository = require('../repository/colorAdvisor.repository');
const { toPaletteItems, clamp } = require('../utils/colorAdvisorToolkit');

class ColorAdvisorService {
  async uploadAndAnalyze({ file, userId, roomType, stylePreference, budgetRange }) {
    // Fix: pass full multer file object with correct folder and options
    const uploaded = await storageService.uploadImage(
      file,
      'rooms/color-advisor',
      { baseName: file.originalname || 'room-image', viewType: 'room' }
    );

    const analysis = await visionAnalysisEngine.analyze({ file, roomType, stylePreference });
    const recommendations = await recommendationEngine.recommend({
      roomType: analysis.roomType || roomType || 'Living Room',
      budgetRange,
      stylePreference: stylePreference || analysis.interiorStyle,
      analysis
    });

    const palette = analysis.palette?.length
      ? analysis.palette
      : toPaletteItems([...(analysis.wallColors || []), ...(analysis.accentColors || [])]);

    const woodFinishes = [
      { name: analysis.flooringMaterial || 'Natural Oak', color: '#D2B48C' },
      { name: 'Matte Walnut', color: '#5C4033' }
    ];

    const confidenceValues = Object.values(analysis.confidenceScores || {});
    const overallConfidence = confidenceValues.length
      ? clamp(Math.round(confidenceValues.reduce((sum, value) => sum + Number(value || 0), 0) / confidenceValues.length), 90, 95)
      : 90;

    const pipeline = {
      roomType: analysis.roomType || roomType || 'Living Room',
      stylePreference: stylePreference || analysis.interiorStyle || 'Modern',
      wallColors: analysis.wallColors || [],
      accentColors: analysis.accentColors || [],
      flooringMaterial: analysis.flooringMaterial,
      interiorStyle: analysis.interiorStyle,
      roomMood: analysis.roomMood,
      lightingConditions: analysis.lightingConditions,
      dominantTextures: analysis.dominantTextures || [],
      confidenceScores: analysis.confidenceScores || {},
      overallConfidence,
      palette,
      woodFinishes,
      decorRecommendations: analysis.decorRecommendations || {},
      colorsToAvoid: analysis.colorsToAvoid || [],
      existingFurniture: analysis.existingFurniture || [],
      emptyFloorSpace: analysis.emptyFloorSpace || '',
      windows: analysis.windows || [],
      doors: analysis.doors || [],
      perspective: analysis.perspective || {},
      ...recommendations,
      geminiResponse: {
        source: analysis.source,
        error: analysis.error || null
      }
    };

    const saved = await repository.create({
      userId,
      sourceImageName: file.originalname,
      imageUrl: uploaded.url,
      roomType: pipeline.roomType,
      stylePreference: pipeline.stylePreference,
      detectedWallColors: pipeline.wallColors,
      accentColors: pipeline.accentColors,
      flooringMaterial: pipeline.flooringMaterial,
      interiorStyle: pipeline.interiorStyle,
      roomMood: pipeline.roomMood,
      lightingConditions: pipeline.lightingConditions,
      dominantTextures: pipeline.dominantTextures,
      confidenceScores: pipeline.confidenceScores,
      palette: pipeline.palette,
      woodFinishes: pipeline.woodFinishes,
      decorRecommendations: pipeline.decorRecommendations,
      colorsToAvoid: pipeline.colorsToAvoid,
      materialRecommendations: pipeline.materialRecommendations,
      compatibilityScores: pipeline.compatibilityScores,
      recommendedProducts: (pipeline.recommendedProducts || [])
        .filter((p) => p && p._id)
        .map((product) => product._id),
      recommendationBundles: pipeline.recommendationBundles,
      shoppingList: pipeline.shoppingList,
      estimatedTotalCost: pipeline.estimatedTotalCost,
      geminiResponse: pipeline.geminiResponse,
      existingFurniture: pipeline.existingFurniture,
      emptyFloorSpace: pipeline.emptyFloorSpace,
      windows: pipeline.windows,
      doors: pipeline.doors,
      perspective: pipeline.perspective,
      layouts: pipeline.layouts || {},
      activeLayout: pipeline.stylePreference
    });

    return { saved, pipeline };
  }

  async getHistory(userId) {
    if (userId === 'guest') {
      return repository.findLatestGuest(20);
    }
    return repository.findHistoryByUser(userId, 30);
  }

  async deleteHistoryItem(id, userId) {
    return repository.removeById(id, userId);
  }

  async saveDesignLayout({ id, userId, layouts, activeLayout }) {
    return repository.updateLayout(id, userId, { layouts, activeLayout });
  }
}

module.exports = new ColorAdvisorService();
