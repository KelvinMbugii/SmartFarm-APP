// const fetch = require("node-fetch");

// const API_KEY = process.env.UJUZI_API_KEY;

// const generateUjuziToken = async () => {
//     const response = await fetch(
//       "https://farmsuite.ujuzikilimo.com/api/v1/auth/generate-token",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           api_key: API_KEY,
//           device_name: "SmartFarm",
//         }),
//       },
//     );
//     const data = await response.json();
//     return data.token;
// };
//     const getMarketPrices = async () => {
//         const token = await generateUjuziToken();

//         const response = await fetch(
//           "https://farmsuite.ujuzikilimo.com/api/v1/market/prices",
//           {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         return await response.json();
//     }

// module.exports = {
//   generateUjuziToken,
// };

const { getUSDtoKESRate } = require("./currencyService");

const API_KEY = process.env.UJUZI_API_KEY;
const UJUZI_BASE = "https://farmsuite.ujuzikilimo.com/api/v1";

const generateToken = async () => {
  const res = await fetch(`${UJUZI_BASE}/auth/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: API_KEY,
      device_name: "SmartFarm",
    }),
  });

  const data = await res.json();
  return data.token;
};

// Fetch live African market prices with KES conversion
const getMarketPrices = async (countryCode = "KE") => {
  try {
    const token = await generateToken();

    const res = await fetch(`${UJUZI_BASE}/markets?country=${countryCode}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
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
    console.error("Ujuzi API error:", error);
    return [];
  }
};

module.exports = { getMarketPrices };