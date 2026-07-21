const { clamp, parseBudgetPreference, parseProductSize, roomTypeToCategories } = require('../utils/roomAnalysisToolkit');

const CATEGORY_SIZE_WEIGHTS = {
  Compact: { Sofa: 0.5, Bed: 0.55, Dining: 0.45, Chair: 0.9, Tables: 0.82, Storage: 0.95 },
  Standard: { Sofa: 0.82, Bed: 0.8, Dining: 0.76, Chair: 0.86, Tables: 0.84, Storage: 0.82 },
  Spacious: { Sofa: 0.95, Bed: 0.94, Dining: 0.92, Chair: 0.9, Tables: 0.88, Storage: 0.8 }
};

class FurnitureCompatibilityEngine {
  scoreProduct(product, context) {
    const { visionAnalysis, spatialAnalysis, styleAnalysis, colorAnalysis, materialAnalysis, userPreferences = {} } = context;
    const roomSize = spatialAnalysis.roomSize || visionAnalysis.roomSize || 'Standard';
    const roomType = visionAnalysis.roomType || 'Living Room';
    const budget = parseBudgetPreference(userPreferences.budgetRange || userPreferences.budget || visionAnalysis.budgetPreference?.target);
    const categoryName = product.category?.name || product.category?.slug || 'Sofa';
    const productMaterial = product.material?.name || '';
    const productColor = product.color?.name || '';
    const roomCategories = roomTypeToCategories(roomType);
    const isCategoryRelevant = roomCategories.some((category) => categoryName.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(categoryName.toLowerCase()));
    const categoryIndex = roomCategories.findIndex((category) => categoryName.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(categoryName.toLowerCase()));
    const categoryPriorityBoost = categoryIndex >= 0 ? (roomCategories.length - categoryIndex) * 7 : 0;

    const roomFit = (CATEGORY_SIZE_WEIGHTS[roomSize]?.[categoryName] || 0.6) * 20 + categoryPriorityBoost;
    const styleFit = this.scoreStyleFit(product, styleAnalysis) * 18;
    const colorFit = this.scoreColorFit(productColor, colorAnalysis) * 15;
    const materialFit = this.scoreMaterialFit(productMaterial, materialAnalysis) * 15;
    const budgetFit = this.scoreBudgetFit(product.price || 0, budget) * 15;
    const ratingFit = clamp(((Number(product.rating || 0) / 5) || 0) * 10, 0, 10);
    const stockFit = (Number(product.stock || 0) > 0 ? 4 : 0);
    const preferenceFit = this.scorePreferenceFit(product, userPreferences, roomType) * 3;

    const rawScore = roomFit + styleFit + colorFit + materialFit + budgetFit + ratingFit + stockFit + preferenceFit + (isCategoryRelevant ? 8 : 0);
    const score = clamp(Math.round(rawScore), 0, 100);

    const breakdown = {
      roomFit: Math.round(roomFit),
      styleFit: Math.round(styleFit),
      colorFit: Math.round(colorFit),
      materialFit: Math.round(materialFit),
      budgetFit: Math.round(budgetFit),
      ratingFit: Math.round(ratingFit),
      stockFit: Math.round(stockFit),
      preferenceFit: Math.round(preferenceFit)
    };

    const fitReasons = this.buildReasons({ score, breakdown, product, roomType, styleAnalysis, colorAnalysis, materialAnalysis, budget });

    return {
      score,
      breakdown,
      fitReasons,
      budgetBand: budget,
      categoryRelevant: isCategoryRelevant,
      categoryPriorityIndex: categoryIndex >= 0 ? categoryIndex : 999,
      sizeFit: CATEGORY_SIZE_WEIGHTS[roomSize]?.[categoryName] || 0.6,
      budgetTier: budget?.label || 'Unspecified'
    };
  }

  scoreStyleFit(product, styleAnalysis) {
    const style = (styleAnalysis.style || '').toLowerCase();
    const content = `${product.name || ''} ${product.description || ''} ${product.category?.name || ''}`.toLowerCase();
    if (!style) return 0.55;

    const styleKeywords = {
      modern: ['modern', 'sleek', 'minimal', 'clean'],
      luxury: ['luxury', 'velvet', 'premium', 'elegant'],
      minimal: ['minimal', 'simple', 'compact', 'clean'],
      classic: ['classic', 'carved', 'traditional', 'timeless'],
      industrial: ['industrial', 'steel', 'metal', 'raw'],
      scandinavian: ['scandinavian', 'light wood', 'airy', 'functional']
    };

    const keywords = styleKeywords[style] || [style];
    const matchCount = keywords.reduce((count, keyword) => count + (content.includes(keyword) ? 1 : 0), 0);
    return clamp(0.4 + matchCount * 0.18, 0.35, 1);
  }

  scoreColorFit(productColor, colorAnalysis) {
    const palette = colorAnalysis.palette || [];
    if (!palette.length) return 0.55;
    const content = String(productColor || '').toLowerCase();
    const matched = palette.some((color) => content.includes(color.name.toLowerCase()));
    if (matched) return 1;

    if (/brown|wood|oak|beige|grey|gray|white|black|charcoal/.test(content)) {
      return 0.8;
    }

    return 0.5;
  }

  scoreMaterialFit(productMaterial, materialAnalysis) {
    const content = String(productMaterial || '').toLowerCase();
    const materials = materialAnalysis.materials || [];
    if (!materials.length) return 0.6;

    const matched = materials.some((material) => content.includes(material.name.toLowerCase()) || material.name.toLowerCase().includes(content));
    return matched ? 1 : 0.55;
  }

  scoreBudgetFit(price, budget) {
    if (!budget) return 0.7;
    if (price <= budget.max && price >= budget.min) return 1;
    if (price < budget.min) return 0.84;
    if (price <= budget.max * 1.2) return 0.72;
    return 0.35;
  }

  scorePreferenceFit(product, userPreferences, roomType) {
    const stylePreference = String(userPreferences.stylePreference || '').toLowerCase();
    const roomTypePreference = String(userPreferences.roomType || roomType || '').toLowerCase();
    const content = `${product.name || ''} ${product.description || ''} ${product.category?.name || ''}`.toLowerCase();
    let score = 0.45;
    if (stylePreference && content.includes(stylePreference)) score += 0.35;
    if (roomTypePreference && content.includes(roomTypePreference)) score += 0.15;
    return clamp(score, 0.25, 1);
  }

  buildReasons({ score, breakdown, product, roomType, styleAnalysis, colorAnalysis, materialAnalysis, budget }) {
    const reasons = [];
    if (breakdown.roomFit >= 12) reasons.push(`Fits the ${roomType} layout well.`);
    if (breakdown.styleFit >= 10) reasons.push(`Matches the ${styleAnalysis.style} design language.`);
    if (breakdown.colorFit >= 8) reasons.push(`Coordinates with the detected room palette.`);
    if (breakdown.materialFit >= 8) reasons.push(`Uses materials aligned with the room surfaces.`);
    if (breakdown.budgetFit >= 10) reasons.push(budget ? `Fits the ${budget.label} budget band.` : 'Price remains competitive for the catalog match.');
    if (Number(product.rating || 0) >= 4.6) reasons.push(`Strong catalog rating (${product.rating}).`);
    if (Number(product.stock || 0) > 0) reasons.push('Available for immediate fulfillment.');
    if (reasons.length === 0) reasons.push('Provides a balanced recommendation across room fit and catalog quality.');
    return reasons.slice(0, 4);
  }
}

module.exports = new FurnitureCompatibilityEngine();