// const express = require("express");
// const MarketPrice = require("../models/MarketPrice");
// const { getMarketPrices } = require("../services/ujuzikilimoService");

// const router = express.Router();

// // Health check endpoint
// router.get("/health", async (req, res) => {
//   try {
//     const count = await MarketPrice.countDocuments();
//     res.json({
//       status: "OK",
//       message: "Market API is working",
//       databaseConnected: true,
//       marketDataCount: count
//     });
//   } catch (error) {
//     res.json({
//       status: "ERROR",
//       message: "Database connection issue",
//       error: error.message
//     });
//   }
// });

// // Get market prices
// router.get("/prices", async (req, res) => {
//   try {
//     console.log("Market prices request received");
//     const { commodity, market, days = 30 } = req.query;

//     const query = {};
//     if (commodity) query.commodity = commodity;
//     if (market) query.market = market;

//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - days);
//     query.date = { $gte: startDate };

//     console.log("Querying database with:", query);
//     const prices = await MarketPrice.find(query).sort({ date: -1 }).limit(100);
//     console.log("Found prices:", prices.length);

//     // If no data found, return mock data
//     if (prices.length === 0) {
//       console.log("No data found, returning mock data");
//       const mockPrices = [
//         {
//           commodity: "Rice",
//           variety: "Basmati",
//           market: "Delhi",
//           price: 2500,
//           unit: "per quintal",
//           date: new Date(),
//         },
//         {
//           commodity: "Wheat",
//           variety: "Standard",
//           market: "Mumbai",
//           price: 1800,
//           unit: "per quintal",
//           date: new Date(),
//         },
//         {
//           commodity: "Corn",
//           variety: "Yellow",
//           market: "Kolkata",
//           price: 1200,
//           unit: "per quintal",
//           date: new Date(),
//         },
//       ];
//       return res.json(mockPrices);
//     }

//     res.json(prices);
//   } catch (error) {
//     console.error("Market prices error:", error);
//     console.error("Error stack:", error.stack);

//     // Return mock data on error to prevent 500
//     const mockPrices = [
//       {
//         commodity: "Rice",
//         variety: "Basmati",
//         market: "Delhi",
//         price: 2500,
//         unit: "per quintal",
//         date: new Date(),
//       },
//       {
//         commodity: "Wheat",
//         variety: "Standard",
//         market: "Mumbai",
//         price: 1800,
//         unit: "per quintal",
//         date: new Date(),
//       },
//     ];

//     res.json(mockPrices);
//   }
// });

// // Get price trends
// router.get("/trends", async (req, res) => {
//   try {
//     const { commodity } = req.query;

//     const pipeline = [
//       {
//         $match: commodity ? { commodity } : {},
//       },
//       {
//         $group: {
//           _id: {
//             commodity: "$commodity",
//             date: {
//               $dateToString: {
//                 format: "%Y-%m-%d",
//                 date: "$date",
//               },
//             },
//           },
//           avgPrice: { $avg: "$price" },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $sort: { "_id.date": -1 },
//       },
//       {
//         $limit: 30,
//       },
//     ];

//     const trends = await MarketPrice.aggregate(pipeline);
//     res.json(trends);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get commodities list
// router.get("/commodities", async (req, res) => {
//   try {
//     const commodities = await MarketPrice.distinct("commodity");

//     // If no commodities found, return mock data
//     if (commodities.length === 0) {
//       const mockCommodities = ["Rice", "Wheat", "Corn", "Soybeans", "Cotton", "Sugar"];
//       return res.json(mockCommodities);
//     }

//     res.json(commodities);
//   } catch (error) {
//     console.error("Commodities error:", error);
//     console.error("Error stack:", error.stack);

//     // Return mock data on error to prevent 500
//     const mockCommodities = ["Rice", "Wheat", "Corn", "Soybeans", "Cotton", "Sugar"];
//     res.json(mockCommodities);
//   }
// });

// // live market data
// router.get("/live-prices", async (req, res) => {
//   try{
//     const data = await getMarketPrices();

//     res.json({
//       source: "UjuziKilimo",
//       data,
//     });
//   } catch (error){
//     console.error("Live Market API error:", error);
//     res.status(500).json({
//       error: "Failed to fetch live market data",
//     });
//   }
// });

// // save live prices to database
// // router.get("/sync-live-prices", async (req, res) => {
// //   try {
// //     const data = await getMarketPrices();

// //     const saved = [];

// //     for (const item of data) {
// //       const price = new MarketPrice({
// //         commodity: item.crop_name,
// //         market: item.market_name,
// //         price: item.price,
// //         unit: item.unit || "kg",
// //         date: new Date(),
// //       });

// //       await price.save();
// //       saved.push(price);
// //     }

// //     res.json({
// //       message: "Live market data synced",
// //       count: saved.length,
// //     });
// //   } catch (error) {
// //     console.error("Sync error:", error);
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// module.exports = router;

// const express = require("express");
// const MarketPrice = require("../models/MarketPrice");
// const { getMarketPrices } = require("../services/ujuzikilimoService");

// const router = express.Router();

// // Health check endpoint
// router.get("/health", async (req, res) => {
//   try {
//     const count = await MarketPrice.countDocuments();
//     res.json({
//       status: "OK",
//       message: "Market API is working",
//       databaseConnected: true,
//       marketDataCount: count,
//     });
//   } catch (error) {
//     res.json({
//       status: "ERROR",
//       message: "Database connection issue",
//       error: error.message,
//     });
//   }
// });

// // Get stored market prices from MongoDB
// router.get("/prices", async (req, res) => {
//   try {
//     const { commodity, market, days = 30 } = req.query;
//     const query = {};
//     if (commodity) query.commodity = commodity;
//     if (market) query.market = market;

//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - days);
//     query.date = { $gte: startDate };

//     const prices = await MarketPrice.find(query).sort({ date: -1 }).limit(100);

//     if (!prices.length) {
//       // Fallback mock data
//       const mockPrices = [
//         {
//           commodity: "Rice",
//           variety: "Basmati",
//           market: "Delhi",
//           price: 2500,
//           unit: "per quintal",
//           date: new Date(),
//           trend: "up",
//           change: 2.5,
//         },
//         {
//           commodity: "Wheat",
//           variety: "Standard",
//           market: "Mumbai",
//           price: 1800,
//           unit: "per quintal",
//           date: new Date(),
//           trend: "down",
//           change: -1.5,
//         },
//       ];
//       return res.json(mockPrices);
//     }

//     // Add trend field if missing
//     const processed = prices.map((p) => ({
//       ...p.toObject(),
//       trend: p.change > 0 ? "up" : p.change < 0 ? "down" : "flat",
//       change: Number(p.change || 0),
//     }));

//     res.json(processed);
//   } catch (error) {
//     console.error("Market prices error:", error);
//     res.json([
//       {
//         commodity: "Rice",
//         variety: "Basmati",
//         market: "Delhi",
//         price: 2500,
//         unit: "per quintal",
//         date: new Date(),
//         trend: "up",
//         change: 2.5,
//       },
//     ]);
//   }
// });

// // Get live market prices from UjuziKilimo
// router.get("/live-prices", async (req, res) => {
//   try {
//     const data = await getMarketPrices();

//     // Normalize live data
//     const normalized = (data || []).map((item) => ({
//       commodity: item.crop_name,
//       variety: item.variety || "Standard",
//       market: item.market_name,
//       price: Number(item.price),
//       unit: item.unit || "kg",
//       date: new Date(item.updated_at || Date.now()),
//       trend: item.change > 0 ? "up" : item.change < 0 ? "down" : "flat",
//       change: Number(item.change || 0),
//     }));

//     res.json(normalized);
//   } catch (error) {
//     console.error("Live market API error:", error);
//     res.status(500).json({ error: "Failed to fetch live market data" });
//   }
// });

// // Get price trends
// router.get("/trends", async (req, res) => {
//   try {
//     const { commodity } = req.query;
//     const pipeline = [
//       { $match: commodity ? { commodity } : {} },
//       {
//         $group: {
//           _id: {
//             commodity: "$commodity",
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//           },
//           avgPrice: { $avg: "$price" },
//           count: { $sum: 1 },
//         },
//       },
//       { $sort: { "_id.date": -1 } },
//       { $limit: 30 },
//     ];

//     const trends = await MarketPrice.aggregate(pipeline);

//     const mapped = trends
//       .filter((item) => item?._id?.date && item?.avgPrice != null)
//       .map((item) => ({
//         date: item._id.date,
//         price: Number(item.avgPrice),
//         commodity: item._id.commodity,
//       }));

//     res.json(mapped);
//   } catch (error) {
//     console.error("Trends error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get commodities list
// router.get("/commodities", async (req, res) => {
//   try {
//     const commodities = await MarketPrice.distinct("commodity");
//     if (!commodities.length) {
//       return res.json(["Rice", "Wheat", "Corn", "Soybeans", "Cotton", "Sugar"]);
//     }
//     res.json(commodities);
//   } catch (error) {
//     console.error("Commodities error:", error);
//     res.json(["Rice", "Wheat", "Corn", "Soybeans", "Cotton", "Sugar"]);
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const MarketPrice = require("../models/MarketPrice");
const { getMarketPrices } = require("../services/ujuzikilimoService");

// Health
router.get("/health", async (req, res) => {
  try {
    const count = await MarketPrice.countDocuments();
    res.json({ status: "OK", databaseConnected: true, marketDataCount: count });
  } catch (error) {
    res.json({ status: "ERROR", error: error.message });
  }
});

// Prices (live or DB)
// router.get("/prices", async (req, res) => {
//   try {
//     const { commodity, market, live = false } = req.query;

//     if (live === "true") {
//       const livePrices = await getMarketPrices("KE");
//       const filtered = livePrices
//         .filter((p) => !commodity || p.commodity === commodity)
//         .filter((p) => !market || p.market === market);
//       return res.json(filtered);
//     }

//     // DB fallback
//     const query = {};
//     if (commodity) query.commodity = commodity;
//     if (market) query.market = market;
//     const prices = await MarketPrice.find(query).sort({ date: -1 }).limit(100);
//     res.json(prices.length ? prices : []);
//   } catch (error) {
//     console.error("Market prices error:", error);
//     res.json([]);
//   }
// });

// Get market prices
router.get("/prices", async (req, res) => {
  try {
    const { commodity, market, days = 30 } = req.query;

    const query = {};
    // Only filter if the query param exists
    if (commodity && commodity !== "all") query.commodity = commodity;
    if (market) query.market = market;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    query.date = { $gte: startDate };

    const prices = await MarketPrice.find(query).sort({ date: -1 }).limit(100);

    // Return all prices if nothing is found (fallback mock)
    if (!prices.length) {
      const mockPrices = [
        { commodity: "Rice", variety: "Basmati", market: "Nairobi", price: 2500, unit: "per quintal", date: new Date() },
        { commodity: "Wheat", variety: "Standard", market: "Nairobi", price: 1800, unit: "per quintal", date: new Date() },
        { commodity: "Corn", variety: "Yellow", market: "Nairobi", price: 1200, unit: "per quintal", date: new Date() },
        { commodity: "Soybeans", variety: "Black", market: "Nairobi", price: 3000, unit: "per quintal", date: new Date() },
        { commodity: "Sugar", variety: "Refined", market: "Nairobi", price: 4500, unit: "per quintal", date: new Date() },
        { commodity: "Coffee", variety: "Arabica", market: "Nairobi", price: 500, unit: "per kg", date: new Date() },
      ];
      return res.json(mockPrices);
    }

    res.json(prices);
  } catch (error) {
    console.error("Market prices error:", error);
    res.json([]);
  }
});



// Trends
router.get("/trends", async (req, res) => {
  try {
    const { commodity } = req.query;
    const pipeline = [
      { $match: commodity ? { commodity } : {} },
      {
        $group: {
          _id: {
            commodity: "$commodity",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
          avgPrice: { $avg: "$price" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": -1 } },
      { $limit: 30 },
    ];
    const trends = await MarketPrice.aggregate(pipeline);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Commodities
router.get("/commodities", async (req, res) => {
  try {
    const commodities = await MarketPrice.distinct("commodity");
    res.json(
      commodities.length ? commodities : ["Rice", "Wheat", "Corn", "Soybeans"],
    );
  } catch (error) {
    res.json(["Rice", "Wheat", "Corn", "Soybeans"]);
  }
});

module.exports = router;