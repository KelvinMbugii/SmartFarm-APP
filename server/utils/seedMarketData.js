const MarketPrice = require('../models/MarketPrice');

const seedMarketData = async () => {
  try {
    // Check if data already exists
    const existingData = await MarketPrice.countDocuments();
    if (existingData > 0) {
      console.log('Market data already exists, skipping seed');
      return;
    }

    const marketData = [
      {
        commodity: "Rice",
        variety: "Basmati",
        market: "Delhi",
        price: 2500,
        unit: "per quintal",
        date: new Date()
      },
      {
        commodity: "Rice",
        variety: "Non-Basmati",
        market: "Mumbai",
        price: 2200,
        unit: "per quintal",
        date: new Date()
      },
      {
        commodity: "Wheat",
        variety: "Standard",
        market: "Delhi",
        price: 1800,
        unit: "per quintal",
        date: new Date()
      },
      {
        commodity: "Wheat",
        variety: "Durum",
        market: "Mumbai",
        price: 1900,
        unit: "per quintal",
        date: new Date()
      },
      {
        commodity: "Corn",
        variety: "Yellow",
        market: "Kolkata",
        price: 1200,
        unit: "per quintal",
        date: new Date()
      },
      {
        commodity: "Corn",
        variety: "White",
        market: "Chennai",
        price: 1150,
        unit: "per quintal",
        date: new Date()
      },
      {
        commodity: "Soybeans",
        variety: "Standard",
        market: "Delhi",
        price: 3200,
        unit: "per quintal",
        date: new Date()
      },
      {
        commodity: "Cotton",
        variety: "Medium Staple",
        market: "Mumbai",
        price: 4500,
        unit: "per quintal",
        date: new Date()
      },
      {
        commodity: "Sugar",
        variety: "White",
        market: "Kolkata",
        price: 2800,
        unit: "per quintal",
        date: new Date()
      }
    ];

    await MarketPrice.insertMany(marketData);
    console.log('Market data seeded successfully');
  } catch (error) {
    console.error('Error seeding market data:', error);
  }
};

module.exports = seedMarketData;
