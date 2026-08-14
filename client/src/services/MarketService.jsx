import api from "./api";

class MarketService {
  // Fetch stored market prices
  async getMarketPrices(commodity = "", market = "", days = 30) {
    try {
      const response = await api.get("/api/market/prices", {
        params: {
          commodity: commodity || "all", // fetch all if empty
          market: market || undefined,
          days,
        },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Market API error:", error);
      return this.getMockMarketData();
    }
  }

  // Fetch live market prices
  async getLiveMarketPrices(commodity = "", market = "", days = 30) {
    try {
      const response = await api.get("/api/market/prices", {
        params: {
          commodity: commodity || "all",
          market: market || undefined,
          days,
          live: true,
        },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if ( error?.response?.status === 502){
        console.warn("Live market API unavailable; using mock market data.");
      } else {
        console.error("Live market API error:", error);
      }
      return this.getMockMarketData();
    }
  }

  // Fetch list of commodities
  async getCommodities() {
    try {
      const response = await api.get("/api/market/commodities");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Market commodities error:", error);
      // Default fallback list
      return [
        "Rice",
        "Wheat",
        "Corn",
        "Soybeans",
        "Sugar",
        "Coffee",
        "Tea",
        "Cotton",
        "Sorghum",
      ];
    }
  }

  async getPriceTrends(commodity = ""){
    try{
      const response = await api.get("/api/market/trends", {
        params: {commodity: commodity || undefined },
      });

      return Array.isArray(response.data)
        ? response.data.map((item) => ({
          date: item?._id?.date,
          commodity: item?._id?.commodity,
          price: Number(item?.avgPrice || 0),
          sampleSize: Number(item?.count || 0),
        }))
      : [];
    } catch(error) {
      console.error("Market trends API error:", error);
      return [];
    }
  }

  async createPriceAlert(commodity, targetPrice, condition, options = {}) {
    const payload = {
      commodity,
      targetPrice,
      condition,
      email: options.email || "",
      sms: Boolean(options.sms),
      phone: options.phone || "",
    };

    const response = await api.post("/api/market/alerts", payload);
    return response.data;
  }

  async getPriceAlerts() {
    const response = await api.get("/api/market/alerts");
    return Array.isArray(response.data) ? response.data : [];
  }

  // Mock data for frontend demo/fallback
  getMockMarketData() {
    const commodities = [
      "Rice",
      "Wheat",
      "Corn",
      "Soybeans",
      "Sugar",
      "Coffee",
      "Tea",
      "Cotton",
      "Sorghum",
    ];
    const markets = [
      "Nairobi",
      "Mombasa",
      "Kisumu",
      "Eldoret",
      "Kisii",
      "Nyeri",
    ];
    return commodities.map((c, i) => ({
      id: i + 1,
      commodity: c,
      variety: "Premium",
      market: markets[i % markets.length],
      price: 2000 + Math.random() * 2000, // random price
      unit: "per quintal",
      date: new Date().toISOString(),
      trend: Math.random() > 0.5 ? "up" : "down",
      change: parseFloat((Math.random() * 10 - 5).toFixed(1)),
    }));
  }
}

export default new MarketService();