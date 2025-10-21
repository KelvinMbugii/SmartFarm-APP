import axios from "axios";

const env = typeof import.meta !== "undefined" ? import.meta.env || {} : {};
const MARKET_API_BASE =
  env.VITE_MARKET_API_BASE || "https://api.data.gov.in/resource";
const API_KEY = env.VITE_MARKET_API_KEY || "demo-key";

class MarketService {
  async getMarketPrices(commodity = "", state = "") {
    try {
      // Using India's Open Government Data API as an example
      const response = await axios.get(
        `${MARKET_API_BASE}/9ef84268-d588-465a-a308-a864a43d0070`,
        {
          params: {
            "api-key": API_KEY,
            format: "json",
            limit: 100,
            ...(commodity && { "filters[commodity]": commodity }),
            ...(state && { "filters[state]": state }),
          },
        }
      );

      return (
        response.data.records?.map((record) => ({
          id: record.id || Math.random().toString(36),
          commodity: record.commodity,
          variety: record.variety || "Standard",
          market: record.market,
          price:
            parseFloat(record.modal_price) || parseFloat(record.max_price) || 0,
          unit: "per quintal",
          date: record.arrival_date || new Date().toISOString(),
          state: record.state,
          district: record.district,
        })) || []
      );
    } catch (error) {
      console.error("Market API error:", error);
      // Fallback to mock data
      return this.getMockMarketData();
    }
  }

  getMockMarketData() {
    const commodities = [
      "Rice",
      "Wheat",
      "Corn",
      "Soybeans",
      "Cotton",
      "Sugarcane",
    ];
    const markets = [
      "Delhi",
      "Mumbai",
      "Kolkata",
      "Chennai",
      "Bangalore",
      "Hyderabad",
    ];

    return commodities.map((commodity, index) => ({
      id: (index + 1).toString(),
      commodity,
      variety: "Premium",
      market: markets[index % markets.length],
      price: 2000 + Math.random() * 3000,
      unit: "per quintal",
      date: new Date().toISOString(),
      trend: Math.random() > 0.5 ? "up" : "down",
      change: (Math.random() * 10 - 5).toFixed(1),
    }));
  }

  async getPriceHistory(commodity, days = 30) {
    try {
      // Mock implementation - in real app, this would fetch historical data
      const history = [];
      const basePrice = 2500;

      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        history.push({
          date: date.toISOString().split("T")[0],
          price: basePrice + (Math.random() - 0.5) * 500,
          volume: Math.floor(Math.random() * 1000) + 100,
        });
      }

      return history;
    } catch (error) {
      console.error("Price history error:", error);
      return [];
    }
  }

  async createPriceAlert(commodity, targetPrice, condition) {
    try {
      // In a real app, this would save to backend
      const alert = {
        id: Date.now().toString(),
        commodity,
        targetPrice,
        condition, // 'above' or 'below'
        createdAt: new Date().toISOString(),
        active: true,
      };

      // Store in localStorage for demo
      const alerts = JSON.parse(localStorage.getItem("priceAlerts") || "[]");
      alerts.push(alert);
      localStorage.setItem("priceAlerts", JSON.stringify(alerts));

      return alert;
    } catch (error) {
      console.error("Create alert error:", error);
      throw error;
    }
  }

  getPriceAlerts() {
    try {
      return JSON.parse(localStorage.getItem("priceAlerts") || "[]");
    } catch (error) {
      console.error("Get alerts error:", error);
      return [];
    }
  }
}

export default new MarketService();
