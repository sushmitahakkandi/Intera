const formatCurrency = (value) => Number(value || 0);

const mapProduct = (item) => ({
  _id: item._id,
  name: item.name,
  // Use the resolved image URL passed from the engine
  image: item.image || item.thumbnailUrl || item.thumbnail || '',
  category: item.category?.name || item.category || 'General',
  categoryGroup: item.categoryGroup || item.category?.name || 'Furniture',
  price: item.price,
  rating: item.rating || 4.5,
  material: item.material?.name || item.material || '',
  color: item.color?.name || item.color || '',
  recommendationScore: item.recommendationScore || 90,
  explanation: item.explanation || '',
  fitReasons: item.fitReasons || []
});

const mapHistory = (item) => ({
  id: item._id,
  imageUrl: item.imageUrl,
  roomType: item.roomType,
  stylePreference: item.stylePreference,
  interiorStyle: item.interiorStyle,
  roomMood: item.roomMood,
  wallColors: item.detectedWallColors || [],
  palette: item.palette || [],
  estimatedTotalCost: item.estimatedTotalCost || 0,
  createdAt: item.createdAt,
  confidence: item.confidenceScores || {},
  layouts: item.layouts || {},
  savedLayouts: item.savedLayouts || {},
  activeLayout: item.activeLayout || 'Modern',
  existingFurniture: item.existingFurniture || [],
  emptyFloorSpace: item.emptyFloorSpace || '',
  windows: item.windows || [],
  doors: item.doors || [],
  perspective: item.perspective || {}
});

class ColorAdvisorDTO {
  uploadResponse(saved, pipeline) {
    return {
      success: true,
      message: 'Room Design Advisor analysis complete',
      analysisId: saved._id,
      imageUrl: saved.imageUrl,
      // Core analysis
      roomType: pipeline.roomType,
      stylePreference: pipeline.stylePreference,
      interiorStyle: pipeline.interiorStyle,
      roomMood: pipeline.roomMood,
      lightingConditions: pipeline.lightingConditions,
      dominantTextures: pipeline.dominantTextures || [],
      confidence: pipeline.overallConfidence,
      confidenceScores: pipeline.confidenceScores || {},
      // Color data
      wallColor: {
        name: pipeline.wallColors?.[0] || 'Neutral',
        hex: pipeline.palette?.[0]?.hex || '#D9D9D9'
      },
      palette: pipeline.palette || [],
      accentColors: pipeline.accentColors || [],
      colorsToAvoid: pipeline.colorsToAvoid || [],
      // Material & finish
      woodFinishes: pipeline.woodFinishes || [],
      materialRecommendations: pipeline.materialRecommendations || [],
      // Decor recommendations
      decorRecommendations: pipeline.decorRecommendations || {},
      // Compatibility
      compatibilityScores: pipeline.compatibilityScores || {},
      // Product recommendation bundles
      recommendations: {
        primary: (pipeline.recommendationBundles?.primary || []).map(mapProduct),
        budgetOptions: (pipeline.recommendationBundles?.budgetOptions || []).map(mapProduct),
        premiumAlternatives: (pipeline.recommendationBundles?.premiumAlternatives || []).map(mapProduct),
        alternatives: (pipeline.recommendationBundles?.alternatives || []).map(mapProduct)
      },
      // Shopping list
      shoppingList: (pipeline.shoppingList || []).map((item) => ({
        productId: item.productId,
        name: item.name,
        category: item.category,
        categoryGroup: item.categoryGroup,
        price: formatCurrency(item.price),
        score: item.score,
        image: item.image || ''
      })),
      estimatedTotalCost: formatCurrency(pipeline.estimatedTotalCost),
      budgetLabel: pipeline.budgetLabel || 'value',
      // Explainability
      explainability: {
        interiorStyle: pipeline.interiorStyle,
        roomMood: pipeline.roomMood,
        lightingConditions: pipeline.lightingConditions,
        dominantTextures: pipeline.dominantTextures,
        confidenceScores: pipeline.confidenceScores || {}
      },
      // AI source metadata
      source: pipeline.geminiResponse?.source || 'fallback',
      
      // Interactive Room Layout properties
      layouts: pipeline.layouts || saved.layouts || {},
      savedLayouts: pipeline.savedLayouts || saved.savedLayouts || {},
      activeLayout: pipeline.activeLayout || saved.activeLayout || 'Modern',
      existingFurniture: pipeline.existingFurniture || saved.existingFurniture || [],
      emptyFloorSpace: pipeline.emptyFloorSpace || saved.emptyFloorSpace || '',
      windows: pipeline.windows || saved.windows || [],
      doors: pipeline.doors || saved.doors || [],
      perspective: pipeline.perspective || saved.perspective || {}
    };
  }

  historyResponse(items) {
    return {
      success: true,
      count: items.length,
      history: items.map(mapHistory)
    };
  }
}

module.exports = new ColorAdvisorDTO();
