const Product = require('../../../../models/Product/Product.model');
const Category = require('../../../../models/Category/Category.model');
const Material = require('../../../../models/Material/Material.model');
const Color = require('../../../../models/Color/Color.model');
const compatibilityEngine = require('./furnitureCompatibilityEngine');
const explanationEngine = require('./recommendationExplanationEngine');
const { roomTypeToCategories, parseBudgetPreference, clamp } = require('../utils/roomAnalysisToolkit');

class ProductRecommendationEngine {
  async recommend({ visionAnalysis, spatialAnalysis, styleAnalysis, colorAnalysis, materialAnalysis, userPreferences = {} }) {
    const budgetPreference = parseBudgetPreference(userPreferences.budgetRange || userPreferences.budget || visionAnalysis.budgetPreference?.target);
    const roomTypeCategories = roomTypeToCategories(visionAnalysis.roomType);

    const [categories, materials, colors] = await Promise.all([
      Category.find({}),
      Material.find({}),
      Color.find({})
    ]);

    const categoryDocs = categories.filter((category) =>
      roomTypeCategories.some((item) => category.name.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(category.name.toLowerCase()))
    );

    const categoryQuery = categoryDocs.length > 0
      ? { category: { $in: categoryDocs.map((item) => item._id) } }
      : {};

    const candidateProducts = await Product.find(categoryQuery)
      .populate('category material color brand')
      .sort({ rating: -1, reviewCount: -1, stock: -1 })
      .limit(250);

    const scoredProducts = candidateProducts.map((product) => {
      const scoreData = compatibilityEngine.scoreProduct(product, {
        visionAnalysis,
        spatialAnalysis,
        styleAnalysis,
        colorAnalysis,
        materialAnalysis,
        userPreferences
      });

      const explanation = explanationEngine.buildRecommendationExplanation({
        recommendation: {
          ...scoreData,
          category: product.category?.name || 'Sofa'
        },
        analysis: {
          visionAnalysis,
          styleAnalysis
        }
      });

      return {
        product,
        id: product._id,
        name: product.name,
        price: product.discountPrice || product.price || 0,
        originalPrice: product.price || 0,
        discount: product.price > 0 ? Math.round(((product.price - (product.discountPrice || product.price)) / product.price) * 100) : 0,
        category: product.category?.name || 'Sofa',
        image: product.thumbnailUrl || '',
        rating: product.rating || 5,
        reviewCount: product.reviewCount || 0,
        material: product.material?.name || 'Wood',
        color: product.color?.name || 'Brown',
        recommendationScore: scoreData.score,
        categoryPriorityIndex: scoreData.categoryPriorityIndex,
        scoreBreakdown: scoreData.breakdown,
        fitReasons: scoreData.fitReasons,
        budgetTier: scoreData.budgetTier,
        explanation: explanation.explanation,
        highlightPoints: explanation.highlightPoints
      };
    });

    scoredProducts.sort((a, b) => {
      const priorityDelta = (a.categoryPriorityIndex ?? 999) - (b.categoryPriorityIndex ?? 999);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      const scoreDelta = (b.recommendationScore || 0) - (a.recommendationScore || 0);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return (b.rating || 0) - (a.rating || 0);
    });

    const uniqueById = new Map();
    scoredProducts.forEach((item) => {
      if (!uniqueById.has(String(item.id))) {
        uniqueById.set(String(item.id), item);
      }
    });

    const uniqueProducts = [...uniqueById.values()];
    const topRecommendations = uniqueProducts.slice(0, 12);

    const budgetOptions = uniqueProducts
      .filter((item) => !budgetPreference || item.price <= budgetPreference.max)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);

    const premiumOptions = uniqueProducts
      .filter((item) => item.price >= (budgetPreference?.min || 50000) || item.recommendationScore >= 88)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);

    const alternativeProducts = uniqueProducts
      .filter((item) => !topRecommendations.some((selected) => selected.id.toString() === item.id.toString()))
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);

    const missingFurnitureSuggestions = roomTypeCategories
      .filter((category) => !topRecommendations.some((item) => item.category.toLowerCase().includes(category.toLowerCase())))
      .map((category) => `Add a ${category.toLowerCase()} to complete the ${visionAnalysis.roomType.toLowerCase()} setup.`);

    const result = {
      topRecommendations,
      recommendedProducts: topRecommendations.map((item) => item.product),
      budgetOptions,
      premiumOptions,
      alternativeProducts,
      missingFurnitureSuggestions,
      candidateCount: uniqueProducts.length,
      catalogStats: {
        categories: categories.length,
        materials: materials.length,
        colors: colors.length
      },
      confidenceHint: clamp(Math.round((topRecommendations[0]?.recommendationScore || 70) * 0.92), 35, 99)
    };

    return result;
  }
}

module.exports = new ProductRecommendationEngine();