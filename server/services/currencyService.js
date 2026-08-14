const axios = require("axios");

const CURRENCY_API_URL = "https://open.er-api.com/v6/latest/USD";
const FALLBACK_USD_TO_KES = 150;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
let cachedRate = null;
let cachedAt = 0;

const getCachedRate = () => {
  if (cachedRate && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedRate;
  }
  return null;
};

const fetchRateFromApi = async () => {
  const response = await axios.get(CURRENCY_API_URL, { timeout: 7000 });
  const data = response.data;
  const rate = Number(data?.rates?.KES);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Exchange API did not return a valid KES rate");
  }

  return rate;
};

// Fetch current USD → KES exchange rate with timeout + cache + fallback
const getUSDtoKESRate = async () => {
  const cached = getCachedRate();
  if (cached) return cached;

  try {
    const rate = await fetchRateFromApi();
    cachedRate = rate;
    cachedAt = Date.now();
    return rate;
  } catch (error) {
    const fallbackRate = cachedRate || FALLBACK_USD_TO_KES;
    console.warn(
      `Currency API unavailable, using fallback rate ${fallbackRate} KES/USD.`,
    );
    return fallbackRate;
  }
};

module.exports = {
  getUSDtoKESRate,
};
