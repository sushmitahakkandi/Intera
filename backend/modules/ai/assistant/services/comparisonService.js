const Product = require('../../../../models/Product/Product.model');
const storageService = require('../../../../services/storageService');

class ComparisonService {
  async compareProducts(productIds, userRequirement = '') {
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return { comparisonMatrix: [], recommendation: 'No products selected for comparison.' };
    }

    const products = await Product.find({ _id: { $in: productIds } })
      .populate('category', 'name')
      .populate('material', 'name')
      .populate('color', 'name')
      .lean({ virtuals: true });

    const comparisonMatrix = products.map(prod => {
      const isSofa = prod.name.toLowerCase().includes('sofa') || prod.category?.name?.toLowerCase().includes('sofa');
      const seatingCapacity = isSofa
        ? (prod.name.includes('3') || prod.description.includes('3-seater') ? '3 Seater' : '2 Seater')
        : 'N/A';

      const comfortScore = prod.rating >= 4.8 ? 'Excellent' : (prod.rating >= 4.5 ? 'Very Good' : 'Standard Comfort');

      return {
        id: prod._id,
        name: prod.name,
        image: prod.thumbnail ? storageService.resolveImageUrl(prod.thumbnail) : '',
        price: prod.discountPrice || prod.price,
        originalPrice: prod.price,
        material: prod.material?.name || 'Solid Wood',
        dimensions: prod.dimensions || 'N/A',
        warranty: prod.warranty || '1 Year Warranty',
        comfort: comfortScore,
        seatingCapacity: seatingCapacity,
        colorOptions: prod.color?.name || 'Default Finish',
        maintenance: prod.careInstructions || 'Wipe clean with a damp cloth.',
        rating: prod.rating || 5.0,
        reviewsCount: prod.reviewCount || 0,
        deliveryTime: '3-5 Business Days',
        availability: prod.availability || 'In Stock'
      };
    });

    // Simple heuristic-based recommendation matching user requirement
    let recommendedProduct = comparisonMatrix[0];
    const reqLower = (userRequirement || '').toLowerCase();

    if (comparisonMatrix.length > 1) {
      if (reqLower.includes('cheap') || reqLower.includes('budget') || reqLower.includes('affordable')) {
        recommendedProduct = [...comparisonMatrix].sort((a, b) => a.price - b.price)[0];
      } else if (reqLower.includes('rating') || reqLower.includes('best') || reqLower.includes('quality')) {
        recommendedProduct = [...comparisonMatrix].sort((a, b) => b.rating - a.rating)[0];
      } else if (reqLower.includes('seater') || reqLower.includes('large') || reqLower.includes('size')) {
        recommendedProduct = [...comparisonMatrix].sort((a, b) => {
          const capA = parseInt(a.seatingCapacity) || 0;
          const capB = parseInt(b.seatingCapacity) || 0;
          return capB - capA;
        })[0];
      } else {
        // Fallback: recommend highest rating
        recommendedProduct = [...comparisonMatrix].sort((a, b) => b.rating - a.rating)[0];
      }
    }

    const recommendationText = recommendedProduct
      ? `We recommend the "${recommendedProduct.name}" because it offers the best alignment with your preferences (Rating: ${recommendedProduct.rating}★, Price: ₹${recommendedProduct.price.toLocaleString('en-IN')}, Material: ${recommendedProduct.material}).`
      : 'No recommendations available.';

    return {
      comparisonMatrix,
      recommendation: {
        recommendedProductId: recommendedProduct?.id || null,
        recommendedProductName: recommendedProduct?.name || '',
        text: recommendationText
      }
    };
  }
}

module.exports = new ComparisonService();
