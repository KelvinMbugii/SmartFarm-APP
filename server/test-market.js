require('dotenv').config();
const { getMarketPrices } = require('./services/ujuzikilimoService');

(async () => {
  try {
    console.log('Testing UjuziKilimo API...');
    const startTime = Date.now();
    const prices = await getMarketPrices('KE');
    const endTime = Date.now();
    console.log(`API Call took ${endTime - startTime}ms`);
    console.log('Prices:', JSON.stringify(prices, null, 2));
  } catch (error) {
    console.error('Test Failed:', error);
  }
})();
