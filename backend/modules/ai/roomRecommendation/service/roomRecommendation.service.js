const storageService = require('../../../../services/storageService');
const roomRecommendationRepository = require('../repository/roomRecommendation.repository');
const visionAnalysisEngine = require('../engines/visionAnalysisEngine');
const spatialAnalysisEngine = require('../engines/spatialAnalysisEngine');
const interiorStyleDetectionEngine = require('../engines/interiorStyleDetectionEngine');
const colorHarmonyEngine = require('../engines/colorHarmonyEngine');
const materialDetectionEngine = require('../engines/materialDetectionEngine');
const productRecommendationEngine = require('../engines/productRecommendationEngine');
const layoutOptimizationEngine = require('../engines/layoutOptimizationEngine');
const explanationEngine = require('../engines/recommendationExplanationEngine');
const confidenceScoringEngine = require('../engines/confidenceScoringEngine');

class RoomRecommendationService {
  async processAndAnalyze(file, userId, userSelectedRoomType, userPreferences = {}) {
    const uploadResult = await storageService.uploadImage(file, 'room-analysis', {
      baseName: 'room-upload',
      viewType: 'analysis',
      resizeWidth: 1200
    });

    const roomImageUrl = uploadResult.url;
    const roomImageName = uploadResult.fileName;

    const visionAnalysis = await visionAnalysisEngine.analyze({
      file,
      roomTypeHint: userSelectedRoomType,
      userPreferences
    });

    const spatialAnalysis = spatialAnalysisEngine.analyze(visionAnalysis, userPreferences);
    const styleAnalysis = interiorStyleDetectionEngine.analyze(visionAnalysis, userPreferences);
    const colorAnalysis = colorHarmonyEngine.analyze(visionAnalysis, spatialAnalysis);
    const materialAnalysis = materialDetectionEngine.analyze(visionAnalysis, spatialAnalysis);

    const recommendationPack = await productRecommendationEngine.recommend({
      visionAnalysis,
      spatialAnalysis,
      styleAnalysis,
      colorAnalysis,
      materialAnalysis,
      userPreferences
    });

    const layoutOptimization = layoutOptimizationEngine.optimize({
      visionAnalysis,
      spatialAnalysis,
      recommendationPack,
      userPreferences
    });

    const confidence = confidenceScoringEngine.score({
      visionAnalysis,
      spatialAnalysis,
      styleAnalysis,
      colorAnalysis,
      materialAnalysis,
      recommendationPack
    });

    const overallAnalysis = {
      visionAnalysis,
      spatialAnalysis,
      styleAnalysis,
      colorAnalysis,
      materialAnalysis,
      recommendationPack,
      layoutOptimization,
      confidence,
      generatedAt: new Date().toISOString(),
      pipelineVersion: 'v2'
    };

    const topRecommendations = recommendationPack.topRecommendations || [];
    const recommendedProductIds = topRecommendations.map((item) => item.product?._id || item.id).filter(Boolean);

    const savedRecord = await roomRecommendationRepository.create({
      userId: userId || '65f123456789abcdef012345',
      roomImage: roomImageName,
      awsUrl: roomImageUrl,
      roomType: visionAnalysis.roomType || 'Living Room',
      detectedStyle: styleAnalysis.style || visionAnalysis.style || 'Modern',
      detectedColors: (colorAnalysis.dominantColors || visionAnalysis.colors || []).slice(0, 6),
      detectedMaterials: (materialAnalysis.materials || []).map((item) => item.name),
      roomSize: spatialAnalysis.roomSize || visionAnalysis.roomSize || 'Standard',
      recommendedCategories: visionAnalysis.recommendedCategories || [],
      recommendedProducts: recommendedProductIds,
      overallConfidence: confidence.overallConfidence,
      confidenceBreakdown: confidence.confidenceBreakdown,
      roomFeatures: {
        windows: visionAnalysis.windows,
        doors: visionAnalysis.doors,
        lighting: visionAnalysis.lighting,
        furniturePresent: visionAnalysis.furniturePresent,
        freeSpace: visionAnalysis.freeSpace,
        dimensionsEstimate: visionAnalysis.dimensionsEstimate,
        flooring: visionAnalysis.flooring
      },
      detectedPalette: colorAnalysis.palette,
      layoutPlan: layoutOptimization.recommendedFurnitureLayout,
      spaceOptimizationTips: layoutOptimization.spaceOptimizationTips,
      improvementScoreBefore: layoutOptimization.improvementScoreBefore,
      improvementScoreAfter: layoutOptimization.improvementScoreAfter,
      budgetOptions: recommendationPack.budgetOptions,
      premiumOptions: recommendationPack.premiumOptions,
      alternativeProducts: recommendationPack.alternativeProducts,
      missingFurnitureSuggestions: layoutOptimization.missingFurnitureSuggestions,
      userPreferences: userPreferences,
      analysisPipeline: overallAnalysis,
      geminiResponse: overallAnalysis
    });

    return {
      savedRecord,
      matchedProducts: topRecommendations.map((item) => item.product),
      recommendationPack,
      overallAnalysis
    };
  }

  async getHistory(userId) {
    return await roomRecommendationRepository.findByUserId(userId);
  }

  async deleteHistoryItem(id) {
    const analysis = await roomRecommendationRepository.findById(id);
    if (!analysis) {
      throw new Error('Analysis record not found');
    }

    // Clean up file in S3/Local storage
    try {
      await storageService.deleteFile(analysis.awsUrl);
    } catch (err) {
      console.error('Failed to delete file from storage:', err.message);
    }

    return await roomRecommendationRepository.delete(id);
  }
}

module.exports = new RoomRecommendationService();
