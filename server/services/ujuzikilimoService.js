const axios = require("axios");
const { getUSDtoKESRate } = require("./currencyService");

const API_KEY = process.env.UJUZI_API_KEY;
const UJUZI_BASE = "https://farmsuite.ujuzikilimo.com/api/v1";

// Helper function to retry async operations to handle intermittent network issues
const withRetry = async (fn, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`API call attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

const generateToken = async () => {
  const res = await axios.post(`${UJUZI_BASE}/auth/generate-token`, {
    api_key: API_KEY,
    device_name: "SmartFarm",
  }, {
    headers: { "Content-Type": "application/json" },
    timeout: 15000 // Increased timeout from 10s to 15s
  });

  return res.data.token;
};

// Fetch live African market prices with KES conversion
const getMarketPrices = async (countryCode = "KE") => {
  try {
    // Retry token generation up to 3 times
    const token = await withRetry(generateToken, 3, 2000);

    const fetchData = async () => axios.get(`${UJUZI_BASE}/markets?country=${countryCode}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 15000 // Increased timeout from 10s to 15s
    });

    // Retry fetching market data up to 3 times
    const res = await withRetry(fetchData, 3, 2000);

    const data = res.data;
    const usdToKES = await getUSDtoKESRate();

    return (data?.markets || [])
      .filter((m) => ["KE", "UG", "TZ", "NG", "ZA"].includes(m.country_code))
      .map((m) => ({
        commodity: m.commodity,
        variety: m.variety || "Standard",
        market: m.market,
        price: m.price_usd * usdToKES, // convert USD → KES
        unit: m.unit || "per quintal",
        date: new Date(m.date),
        trend: m.change > 0 ? "up" : m.change < 0 ? "down" : "flat",
        change: Number(m.change || 0),
      }));
  } catch (error) {
    console.error("Ujuzi API error after retries:", error.message || error);
    // Returning an empty array prevents the application from crashing
    // You could also return cached data or fallback data here
    return [];
  }
};

module.exports = { getMarketPrices };