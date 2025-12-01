import api from "./api";

class MarketService {
  async getMarketPrices(commodity = "", market = "", days = 30) {
    try {
      const response = await api.get("/api/market/prices", {
        params: {
          commodity: commodity || undefined,
          market: market || undefined,
          days,
        },
      });

      return response.data || [];
    } catch (error) {
      console.error("Market API error:", error);
      // Fallback to mock data
      return this.getMockMarketData();
    }
  }

  async getCommodities() {
    try {
      const response = await api.get("/api/market/commodities");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Market commodities error:", error);
      return ["Rice", "Wheat", "Corn", "Soybeans", "Cotton", "Sugar"];
    }
  }

  async getPriceTrends(commodity = "") {
    try {
      const response = await api.get("/api/market/trends", {
        params: { commodity: commodity || undefined },
      });

      return (
        response.data?.map((item) => ({
          date: item._id?.date,
          price: item.avgPrice,
          commodity: item._id?.commodity,
        })) || []
      );
    } catch (error) {
      console.error("Market trends error:", error);
      // Generate mock trend data
      const fallback = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split("T")[0],
          price: 2000 + Math.random() * 800,
          commodity: commodity || "Rice",
        };
      }).reverse();
      return fallback;
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
      change: parseFloat((Math.random() * 10 - 5).toFixed(1)),
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

  async createPriceAlert(commodity, targetPrice, condition, options = {}) {
    try {
      // In a real app, this would save to backend
      const alert = {
        id: Date.now().toString(),
        commodity,
        targetPrice,
        condition, // 'above' or 'below'
        createdAt: new Date().toISOString(),
        active: true,
        notifyEmail: options.email || null,
        notifyBySms: Boolean(options.sms),
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
