class RoomRecommendationDTO {
  getProductFallbackImage(categoryName = 'Sofa') {
    const fallbacks = {
      Sofa: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp',
      Chair: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/chair/img-0.webp',
      Bed: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/bed/img-0.webp',
      Dining: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/dining/img-0.webp',
      Tables: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/tables/img-0.webp',
      Storage: 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/storage/img-0.webp'
    };

    return fallbacks[categoryName] || fallbacks.Sofa;
  }

  formatRecommendation(recommendation) {
    const product = recommendation.product || recommendation;
    const origPrice = product.price || recommendation.originalPrice || 0;
    const discPrice = product.discountPrice || recommendation.price || origPrice;
    const discountPct = origPrice > 0 ? Math.round(((origPrice - discPrice) / origPrice) * 100) : 0;
    const categoryName = recommendation.category || product.category?.name || 'Sofa';
    const imageUrl = recommendation.image || product.thumbnailUrl || this.getProductFallbackImage(categoryName);

    return {
      id: recommendation.id || product._id,
      name: product.name,
      price: discPrice,
      originalPrice: origPrice,
      discount: recommendation.discount ?? discountPct,
      category: categoryName,
      image: imageUrl,
      rating: recommendation.rating || product.rating || 5.0,
      reviewCount: recommendation.reviewCount || product.reviewCount || 0,
      material: recommendation.material || product.material?.name || 'Wood',
      color: recommendation.color || product.color?.name || 'Brown',
      recommendationScore: recommendation.recommendationScore || recommendation.score || 0,
      scoreBreakdown: recommendation.scoreBreakdown || recommendation.breakdown || {},
      fitReasons: recommendation.fitReasons || [],
      explanation: recommendation.explanation || '',
      highlightPoints: recommendation.highlightPoints || [],
      budgetTier: recommendation.budgetTier || 'Unspecified'
    };
  }

  formatHistoryItem(item) {
    const dateStr = item.createdAt 
      ? new Date(item.createdAt).toISOString().replace('T', ' ').substring(0, 16)
      : new Date().toISOString().replace('T', ' ').substring(0, 16);

    return {
      id: item._id,
      fileName: item.roomImage,
      date: dateStr,
      image: item.awsUrl,
      roomType: item.roomType,
      detectedStyle: item.detectedStyle,
      detectedColors: item.detectedColors,
      detectedMaterials: item.detectedMaterials,
      recommendedCategories: item.recommendedCategories,
      overallConfidence: item.overallConfidence || item.geminiResponse?.confidence?.overallConfidence || 0,
      confidenceBreakdown: item.confidenceBreakdown || item.geminiResponse?.confidence?.confidenceBreakdown || {},
      detectedPalette: item.detectedPalette || item.geminiResponse?.colorAnalysis?.palette || [],
      roomFeatures: item.roomFeatures || item.geminiResponse?.visionAnalysis || {},
      layoutPlan: item.layoutPlan || item.geminiResponse?.layoutOptimization?.recommendedFurnitureLayout || {},
      spaceOptimizationTips: item.spaceOptimizationTips || item.geminiResponse?.layoutOptimization?.spaceOptimizationTips || [],
      improvementScoreBefore: item.improvementScoreBefore || item.geminiResponse?.layoutOptimization?.improvementScoreBefore || 0,
      improvementScoreAfter: item.improvementScoreAfter || item.geminiResponse?.layoutOptimization?.improvementScoreAfter || 0,
      budgetOptions: (item.budgetOptions || item.geminiResponse?.recommendationPack?.budgetOptions || []).map((p) => this.formatRecommendation(p)),
      premiumOptions: (item.premiumOptions || item.geminiResponse?.recommendationPack?.premiumOptions || []).map((p) => this.formatRecommendation(p)),
      alternativeProducts: (item.alternativeProducts || item.geminiResponse?.recommendationPack?.alternativeProducts || []).map((p) => this.formatRecommendation(p)),
      missingFurnitureSuggestions: item.missingFurnitureSuggestions || item.geminiResponse?.layoutOptimization?.missingFurnitureSuggestions || [],
      layoutSuggestion: item.analysisPipeline?.layoutOptimization?.layoutSuggestion || item.geminiResponse?.layoutOptimization?.layoutSuggestion || item.geminiResponse?.layoutSuggestion || '',
      products: (item.analysisPipeline?.recommendationPack?.topRecommendations || item.geminiResponse?.recommendationPack?.topRecommendations || item.recommendedProducts || []).map(p => this.formatRecommendation(p))
    };
  }

  formatHistoryList(list) {
    return list.map(item => this.formatHistoryItem(item));
  }

  formatProduct(product) {
    const origPrice = product.price || 0;
    const discPrice = product.discountPrice || origPrice;
    const discountPct = origPrice > 0 ? Math.round(((origPrice - discPrice) / origPrice) * 100) : 0;
    const categoryName = product.category?.name || 'Sofa';

    return {
      id: product._id,
      name: product.name,
      price: discPrice,
      originalPrice: origPrice,
      discount: discountPct,
      category: categoryName,
      image: product.thumbnailUrl || this.getProductFallbackImage(categoryName),
      rating: product.rating || 5.0,
      reviewCount: product.reviewCount || 0,
      material: product.material?.name || 'Wood',
      color: product.color?.name || 'Brown'
    };
  }

  formatUploadResult(analysis, products) {
    const pipeline = analysis.analysisPipeline || analysis.geminiResponse || {};
    return {
      id: analysis._id,
      image: analysis.awsUrl,
      roomType: analysis.roomType,
      detectedStyle: analysis.detectedStyle,
      detectedColors: analysis.detectedColors,
      detectedMaterials: analysis.detectedMaterials,
      recommendedCategories: analysis.recommendedCategories,
      overallConfidence: analysis.overallConfidence || pipeline.confidence?.overallConfidence || 0,
      confidenceBreakdown: analysis.confidenceBreakdown || pipeline.confidence?.confidenceBreakdown || {},
      detectedPalette: analysis.detectedPalette || pipeline.colorAnalysis?.palette || [],
      roomFeatures: analysis.roomFeatures || pipeline.visionAnalysis || {},
      layoutPlan: analysis.layoutPlan || pipeline.layoutOptimization?.recommendedFurnitureLayout || {},
      spaceOptimizationTips: analysis.spaceOptimizationTips || pipeline.layoutOptimization?.spaceOptimizationTips || [],
      improvementScoreBefore: analysis.improvementScoreBefore || pipeline.layoutOptimization?.improvementScoreBefore || 0,
      improvementScoreAfter: analysis.improvementScoreAfter || pipeline.layoutOptimization?.improvementScoreAfter || 0,
      budgetOptions: (analysis.budgetOptions || pipeline.recommendationPack?.budgetOptions || []).map((p) => this.formatRecommendation(p)),
      premiumOptions: (analysis.premiumOptions || pipeline.recommendationPack?.premiumOptions || []).map((p) => this.formatRecommendation(p)),
      alternativeProducts: (analysis.alternativeProducts || pipeline.recommendationPack?.alternativeProducts || []).map((p) => this.formatRecommendation(p)),
      missingFurnitureSuggestions: analysis.missingFurnitureSuggestions || pipeline.layoutOptimization?.missingFurnitureSuggestions || [],
      layoutSuggestion: pipeline.layoutOptimization?.layoutSuggestion || '',
      products: (products || []).map(p => this.formatRecommendation(p))
    };
  }
}

module.exports = new RoomRecommendationDTO();
