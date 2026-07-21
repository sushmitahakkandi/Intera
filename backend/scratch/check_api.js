const axios = require('axios');

const checkApi = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/products?limit=2500');
    console.log('Response data keys:', Object.keys(res.data));
    const products = res.data.products || res.data.data || res.data;
    console.log(`Fetched ${products.length} products from API.`);

    const targetProduct = products.find(p => p.name === 'Mahaveer Athens Metal L Shape Sofa');
    if (targetProduct) {
      console.log('Target Product Details from API:');
      console.log(JSON.stringify(targetProduct, null, 2));
    } else {
      console.log('Target Product NOT FOUND in API response!');
    }

  } catch (err) {
    console.error('Error fetching API:', err.message);
  }
};

checkApi();
