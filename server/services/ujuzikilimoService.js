const axios = require("axios");
const { getUSDtoKESRate } = require("./currencyService");
require("dotenv").config();

const UJUZI_EMAIL = process.env.UJUZI_EMAIL;
const UJUZI_PASSWORD = process.env.UJUZI_PASSWORD;
const UJUZI_BASE = process.env.UJUZI_BASE_URL || "https://farmsuite.ujuzikilimo.com/api/v1";

let cachedToken = null;
let memoryCache = { prices: [], timestamp: 0, country: null };
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const withRetry = async (fn, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); } 
    catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

const generateToken = async () => {
  if (cachedToken) return cachedToken;
  const res = await axios.post(`${UJUZI_BASE}/auth/generate-token`, 
    { email: UJUZI_EMAIL, password: UJUZI_PASSWORD, device_name: "SmartFarm" },
    { timeout: 15000 }
  );
  cachedToken = res.data.token;
  return cachedToken;
};

const getMarketPrices = async (countryCode = "KE") => {
  // Return cache if valid
  if (Date.now() - memoryCache.timestamp < CACHE_TTL && memoryCache.prices.length && memoryCache.country === countryCode) {
    return memoryCache.prices;
  }

  try {
    const token = await withRetry(generateToken, 3);
    const res = await withRetry(() => axios.get(`${UJUZI_BASE}/markets?country=${countryCode}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000
    }), 3);

    const usdToKES = await getUSDtoKESRate();
    const prices = (res.data?.markets || []).map(m => ({
      id: m.id,
      commodity: m.commodity,
      market: m.market,
      price: m.price_usd * usdToKES,
      unit: m.unit,
      date: new Date(m.date),
      trend: m.change > 0 ? "up" : m.change < 0 ? "down" : "flat",
      change: Number(m.change || 0)
    }));

    memoryCache = { prices, timestamp: Date.now(), country: countryCode }; // Update Cache
    return prices;
  } catch (error) {
    console.error("API Error:", error.message);
    cachedToken = null; // Invalidate token on error
    if (memoryCache.prices.length && memoryCache.country === countryCode) return memoryCache.prices; // Graceful Fallback
    throw new Error("Unable to fetch market data at this time.");
  }
};

module.exports = { getMarketPrices };