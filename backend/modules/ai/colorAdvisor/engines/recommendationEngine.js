const Product = require('../../../../models/Product/Product.model');
const storageService = require('../../../../services/storageService');
const {
  parseBudget,
  ROOM_CATEGORY_PRIORITY,
  ROOM_ALLOWED_CATEGORIES,
  normalizeText,
  defaultDecorRecommendations
} = require('../utils/colorAdvisorToolkit');

const getZIndexForCategory = (cat) => {
  const c = (cat || '').toLowerCase();
  if (c.includes('rug')) return 1;
  if (c.includes('sofa') || c.includes('couch') || c.includes('bed') || c.includes('dining')) return 5;
  if (c.includes('table') || c.includes('desk') || c.includes('chair')) return 10;
  if (c.includes('lamp') || c.includes('decor')) return 15;
  return 5;
};

const getCoordinateTemplate = (category, layoutStyle, roomType) => {
  const c = (category || '').toLowerCase();
  const isBedroom = (roomType || '').toLowerCase().includes('bed');

  if (c.includes('sofa') || c.includes('couch')) {
    if (layoutStyle === 'Modern') return { xPct: 42, yPct: 56, scale: 1.0, rotation: 0 };
    if (layoutStyle === 'Luxury') return { xPct: 46, yPct: 54, scale: 1.1, rotation: -2 };
    if (layoutStyle === 'Minimal') return { xPct: 50, yPct: 60, scale: 0.95, rotation: 0 };
    return { xPct: 44, yPct: 58, scale: 1.0, rotation: 2 };
  }
  if (c.includes('bed')) {
    if (layoutStyle === 'Modern') return { xPct: 40, yPct: 52, scale: 1.05, rotation: 0 };
    if (layoutStyle === 'Luxury') return { xPct: 42, yPct: 50, scale: 1.15, rotation: -1 };
    return { xPct: 45, yPct: 55, scale: 1.0, rotation: 0 };
  }
  if (c.includes('table') || c.includes('desk')) {
    if (c.includes('coffee')) {
      return { xPct: 48, yPct: 70, scale: 0.8, rotation: 0 };
    }
    return { xPct: 50, yPct: 62, scale: 0.85, rotation: 0 };
  }
  if (c.includes('chair')) {
    if (layoutStyle === 'Modern') return { xPct: 20, yPct: 64, scale: 0.85, rotation: 15 };
    if (layoutStyle === 'Luxury') return { xPct: 78, yPct: 60, scale: 0.9, rotation: -15 };
    return { xPct: 24, yPct: 66, scale: 0.8, rotation: 8 };
  }
  if (c.includes('cabinet') || c.includes('storage') || c.includes('shelf')) {
    return { xPct: 15, yPct: 48, scale: 0.85, rotation: 0 };
  }
  return { xPct: 35, yPct: 52, scale: 0.9, rotation: 0 };
};

// Map category name to its priority index for a given room type
const categoryScore = (categoryName, roomType) => {
  const category = normalizeText(categoryName);
  const order = ROOM_CATEGORY_PRIORITY[roomType] || ROOM_CATEGORY_PRIORITY.Unknown;
  const idx = order.findIndex((entry) => category.toLowerCase().includes(entry.toLowerCase()));
  return idx === -1 ? 0 : Math.max(0, 20 - idx * 3);
};

// Derive a canonical category group from category name
const toCategoryGroup = (categoryName = '') => {
  const name = categoryName.toLowerCase();
  if (name.includes('sofa') || name.includes('couch')) return 'Sofas';
  if (name.includes('chair')) return 'Chairs';
  if (name.includes('bed')) return 'Beds';
  if (name.includes('dining')) return 'Dining';
  if (name.includes('table') || name.includes('desk')) return 'Tables';
  if (name.includes('storage') || name.includes('shelf') || name.includes('cabinet')) return 'Storage';
  return categoryName || 'Furniture';
};

class RecommendationEngine {
  async recommend({ roomType, budgetRange, stylePreference, analysis }) {
    const budget = parseBudget(budgetRange);

    const filter = {
      availability: 'In Stock',
      stock: { $gt: 0 },
      price: { $gte: budget.min, $lte: budget.max }
    };

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('material', 'name')
      .populate('color', 'name')
      .sort({ rating: -1, createdAt: -1 })
      .limit(100)
      .lean({ virtuals: true });

    // Determine allowed categories for the selected room type
    const allowedCats = ROOM_ALLOWED_CATEGORIES[roomType] || ROOM_ALLOWED_CATEGORIES.Unknown;

    const scored = products
      .filter((product) => {
        const catName = (product.category?.name || '').toLowerCase();
        return allowedCats.some((allowed) => catName.includes(allowed.toLowerCase()));
      })
      .map((product) => {
        const base = 70;
        const ratingBoost = Number(product.rating || 4.3) * 4;
        const categoryBoost = categoryScore(product.category?.name || '', roomType);
        const styleBoost =
          normalizeText(stylePreference).toLowerCase() ===
            normalizeText(analysis.interiorStyle).toLowerCase()
            ? 6
            : 3;
        const score = Math.round(Math.min(99, base + ratingBoost + categoryBoost + styleBoost));

        const fitReasons = [
          `Aligned with ${analysis.interiorStyle || stylePreference} interior style`,
          `Complements ${analysis.wallColors?.[0] || 'the room'} tone`,
          `Strong fit for ${roomType}`,
          ...(product.material?.name
            ? [`${product.material.name} material enhances texture balance`]
            : [])
        ];

        const categoryGroup = toCategoryGroup(product.category?.name);

        const imageUrl = product.thumbnail
          ? storageService.resolveImageUrl(product.thumbnail)
          : `https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/${(product.category?.name || 'sofa').toLowerCase()}/img-0.webp`;

        return {
          ...product,
          image: imageUrl,
          categoryGroup,
          recommendationScore: score,
          fitReasons,
          explanation: `${categoryGroup} with ${analysis.interiorStyle || stylePreference} style pairing — ${product.color?.name || ''} finish complements detected wall tone with balanced color harmony.`
        };
      }).sort((a, b) => b.recommendationScore - a.recommendationScore);

    const top = scored.slice(0, 8);

    const budgetOptions = scored
      .filter((item) => item.price <= 25000)
      .slice(0, 6);

    const premiumAlternatives = scored
      .filter((item) => item.price >= 50000)
      .slice(0, 6);

    const alternatives = scored.slice(8, 14);

    const shoppingList = top.slice(0, 8).map((item) => ({
      productId: item._id,
      name: item.name,
      category: item.category?.name || 'General',
      categoryGroup: item.categoryGroup,
      price: item.price,
      score: item.recommendationScore,
      image: item.image
    }));

    const estimatedTotalCost = shoppingList.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );

    // Group items by category to build 4 distinct layout presets
    const byCategory = {};
    scored.forEach((prod) => {
      const grp = prod.categoryGroup;
      if (!byCategory[grp]) byCategory[grp] = [];
      byCategory[grp].push(prod);
    });

    const layouts = {};
    const layoutStyles = ['Modern', 'Luxury', 'Minimal', 'Scandinavian'];

    layoutStyles.forEach((style) => {
      const layoutProducts = [];
      Object.keys(byCategory).forEach((grp) => {
        const list = byCategory[grp];
        const styleIdx = { Modern: 0, Luxury: 1, Minimal: 2, Scandinavian: 3 }[style] % list.length;
        const item = list[styleIdx] || list[0];

        if (item) {
          const coords = getCoordinateTemplate(item.category?.name || item.categoryGroup, style, roomType);
          const zIndex = getZIndexForCategory(item.category?.name || item.categoryGroup);

          const altList = list
            .filter((alt) => alt._id.toString() !== item._id.toString())
            .slice(0, 6)
            .map((alt) => ({
              productId: alt._id,
              name: alt.name,
              category: alt.category?.name || 'General',
              categoryGroup: alt.categoryGroup,
              price: alt.price,
              score: alt.recommendationScore,
              image: alt.image,
              description: alt.description,
              material: alt.material?.name || 'Default',
              dimensions: alt.dimensions || 'N/A',
              colorName: alt.color?.name || 'Default'
            }));

          layoutProducts.push({
            productId: item._id,
            name: item.name,
            category: item.category?.name || 'General',
            categoryGroup: item.categoryGroup,
            price: item.price,
            score: item.recommendationScore,
            image: item.image,
            description: item.description,
            material: item.material?.name || 'Default',
            dimensions: item.dimensions || 'N/A',
            colorName: item.color?.name || 'Default',
            xPct: coords.xPct,
            yPct: coords.yPct,
            scale: coords.scale,
            rotation: coords.rotation,
            zIndex: zIndex,
            visible: true,
            alternatives: altList
          });
        }
      });
      layouts[style] = layoutProducts;
    });

    return {
      recommendedProducts: top,
      recommendationBundles: {
        primary: top,
        budgetOptions,
        premiumAlternatives,
        alternatives
      },
      shoppingList,
      estimatedTotalCost,
      budgetLabel: budget.key,
      materialRecommendations:
        analysis.decorRecommendations?.upholsteryMaterials ||
        defaultDecorRecommendations.upholsteryMaterials,
      compatibilityScores: {
        colorHarmony: 92,
        textureBalance: 90,
        styleConsistency: 93,
        roomFit: 91
      },
      layouts
    };
  }
}

module.exports = new RecommendationEngine();
