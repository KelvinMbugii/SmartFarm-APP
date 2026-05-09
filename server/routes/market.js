const express = require("express");
const router = express.Router();
const MarketPrice = require("../models/MarketPrice");
const { getMarketPrices } = require("../services/ujuzikilimoService");
const { protect, authorizeRoles } = require("../middlewares/auth");
const PriceAlert = require("../models/PriceAlert");
const { notifyPriceAlerts } = require("../utils/priceAlertNotifications");
const rateLimit = require("express-rate-limit");

const marketLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: "Too many requests from this IP, please try again later." }
});

router.use(marketLimiter);


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
     const { commodity, market, live = "false" } = req.query;
    const parsedDays = Number.parseInt(req.query.days, 10);
    const days = Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : 30;

    if (live === "true") {
      try {
        const livePrices = await getMarketPrices("KE");
        const filteredLivePrices = livePrices
          .filter((priceItem) => !commodity || commodity === "all" || priceItem.commodity === commodity)
          .filter((priceItem) => !market || priceItem.market === market);

        return res.json(filteredLivePrices);
      } catch (error) {
        console.error("Live market prices error:", error.message || error);
        return res.status(502).json({
          error: "Failed to fetch live market prices",
        });
      }
    }

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

    return res.json(prices);
  } catch (error) {
    console.error("Market prices error:", error);
    return res.json([]);
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


// Create market price alert
router.post("/alerts", protect, async (req, res) => {
  try {
    const {
      commodity,
      targetPrice,
      condition = "above",
      email = "",
      sms = false,
      phone = "",
    } = req.body;

    if (!commodity || targetPrice == null) {
      return res
        .status(400)
        .json({ error: "commodity and targetPrice are required" });
    }

    const alert = await PriceAlert.create({
      user: req.user._id,
      commodity,
      targetPrice: Number(targetPrice),
      condition,
      notifyEmail: email || req.user.email || "",
      notifyBySms: Boolean(sms),
      phoneNumber: phone || req.user.Phone || "",
    });

    return res.status(201).json(alert);
  } catch (error) {
    console.error("Create alert error:", error);
    return res.status(500).json({ error: "Failed to create alert" });
  }
});

// List logged-in user alerts
router.get("/alerts", protect, async (req, res) => {
  try {
    const alerts = await PriceAlert.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(alerts);
  } catch (error) {
    console.error("List alert error:", error);
    return res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// Create/update market price and trigger matching alerts
router.post(
  "/prices",
  protect,
  authorizeRoles("agripreneur", "officer", "admin"),
  async (req, res) => {
    try {
      const {
        commodity,
        variety = "Standard",
        market,
        price,
        unit = "per quintal",
        date,
      } = req.body;

      if (!commodity || !market || price == null) {
        return res
          .status(400)
          .json({ error: "commodity, market and price are required" });
      }

      const marketPrice = await MarketPrice.create({
        commodity,
        variety,
        market,
        price: Number(price),
        unit,
        date: date ? new Date(date) : new Date(),
      });

      const notifications = await notifyPriceAlerts({
        commodity: marketPrice.commodity,
        price: Number(marketPrice.price),
        market: marketPrice.market,
      });

      return res.status(201).json({ marketPrice, notifications });
    } catch (error) {
      console.error("Create market price error:", error);
      return res.status(500).json({ error: "Failed to create market price" });
    }
  },
);

module.exports = router;