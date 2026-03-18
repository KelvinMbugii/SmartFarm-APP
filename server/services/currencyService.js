// const fetch = require("node-fetch");

// // Fetch current USD → KES exchange rate dynamically
// const getUSDtoKESRate = async () => {
//   try {
//     const res = await fetch(
//       "https://api.exchangerate.host/latest?base=USD&symbols=KES",
//     );
//     const data = await res.json();
//     return data.rates?.KES || 150; // fallback
//   } catch (error) {
//     console.error("Currency API error:", error);
//     return 150; // fallback
//   }
// };

// module.exports = { getUSDtoKESRate };


// currencyService.js

// Fetch current USD → KES exchange rate dynamically
const getUSDtoKESRate = async () => {
  try {
    const res = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=KES"
    );

    // Check if request succeeded
    if (!res.ok) {
      throw new Error(`Exchange API error: ${res.status}`);
    }

    const data = await res.json();

    // Return the exchange rate
    return data?.rates?.KES || 150; // fallback rate if API fails
  } catch (error) {
    console.error("Currency API error:", error);

    // fallback value if API call fails
    return 150;
  }
};

module.exports = {
  getUSDtoKESRate,
};
