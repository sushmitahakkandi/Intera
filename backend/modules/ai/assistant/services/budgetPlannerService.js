const Product = require('../../../../models/Product/Product.model');
const storageService = require('../../../../services/storageService');

const ROOM_PLAN_CATEGORIES = {
  'Living Room': ['Sofa', 'Chair', 'Tables'],
  'Bedroom': ['Bed', 'Storage', 'Chair'],
  'Dining Room': ['Dining', 'Chair', 'Tables'],
  'Office': ['Tables', 'Chair', 'Storage']
};

class BudgetPlannerService {
  async planBudget(targetBudget, roomType = 'Living Room') {
    const categories = ROOM_PLAN_CATEGORIES[roomType] || ['Sofa', 'Tables', 'Chair'];
    
    // Fetch active products in stock
    const products = await Product.find({
      availability: 'In Stock',
      stock: { $gt: 0 }
    })
    .populate('category', 'name')
    .populate('material', 'name')
    .populate('color', 'name')
    .lean({ virtuals: true });

    // Group products by their matched category category name
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = [];
    });

    products.forEach(prod => {
      const catName = prod.category?.name || '';
      for (const targetCat of categories) {
        if (catName.toLowerCase().includes(targetCat.toLowerCase())) {
          grouped[targetCat].push(prod);
          break;
        }
      }
    });

    // Greedily build 2 packages: Eco Package (lowest price) and Balanced Package (middle price)
    const buildPackage = (strategy) => {
      const selectedProducts = [];
      let totalCost = 0;

      categories.forEach(cat => {
        const list = grouped[cat] || [];
        if (list.length === 0) return;

        // Sort based on strategy
        let sorted = [];
        if (strategy === 'eco') {
          sorted = [...list].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else {
          // balance: middle price point
          const sortedByPrice = [...list].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
          const midIdx = Math.floor(sortedByPrice.length / 2);
          sorted = [sortedByPrice[midIdx], ...sortedByPrice];
        }

        // Find first item that fits within the targetBudget ceiling
        for (const item of sorted) {
          const price = item.discountPrice || item.price;
          if (totalCost + price <= targetBudget) {
            selectedProducts.push({
              id: item._id,
              name: item.name,
              category: item.category?.name || cat,
              price: price,
              image: item.thumbnail ? storageService.resolveImageUrl(item.thumbnail) : '',
              rating: item.rating || 5.0
            });
            totalCost += price;
            break;
          }
        }
      });

      return {
        items: selectedProducts,
        totalCost,
        remainingBalance: targetBudget - totalCost
      };
    };

    const ecoPackage = buildPackage('eco');
    const balancedPackage = buildPackage('balanced');

    // Choose the best matching package (Balanced if it fits, else Eco)
    const selected = balancedPackage.items.length > 0 && balancedPackage.totalCost <= targetBudget
      ? { name: 'Balanced Package', ...balancedPackage }
      : { name: 'Budget-Saver Package', ...ecoPackage };

    return {
      targetBudget,
      roomType,
      package: {
        packageName: selected.name,
        items: selected.items,
        totalCost: selected.totalCost,
        remainingBalance: selected.remainingBalance
      },
      alternatives: {
        eco: ecoPackage,
        balanced: balancedPackage
      }
    };
  }
}

module.exports = new BudgetPlannerService();
