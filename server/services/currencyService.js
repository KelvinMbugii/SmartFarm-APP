const fetch = require("node-fetch");

// Fetch current USD → KES exchange rate dynamically
const getUSDtoKESRate = async () => {
  try {
    const res = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=KES",
    );
    const data = await res.json();
    return data.rates?.KES || 150; // fallback
  } catch (error) {
    console.error("Currency API error:", error);
    return 150; // fallback
  }
};

module.exports = { getUSDtoKESRate };
