import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Droplets,
  Wind,
  Sun,
  Cloud,
  Bell,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import AnimatedCard from "../components/AnimatedCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ChatModal from "../components/ChatModal";
import PriceAlertModal from "../components/PriceAlertModal";
import weatherService from "../services/weatherService";
import marketService from "../services/marketService";
import DashboardOverview from "../components/DashboardOverview";

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [priceAlertModalOpen, setPriceAlertModalOpen] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState("Rice");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [weather, prices] = await Promise.all([
        weatherService.getCurrentWeather("Nairobi"),
        marketService.getMarketPrices(),
      ]);
      setWeatherData(weather);
      setMarketPrices(prices.slice(0, 4));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div className="space-y-8 p-6">
      {/* Dashboard Overview Section */}
      <DashboardOverview />

      {/* Weather Section */}
      <AnimatedCard delay={0.4}>
        <div className="card-header flex justify-between items-center">
          <h2 className="card-title">Today's Weather</h2>
          {weatherData?.condition?.includes("cloud") ? (
            <Cloud className="w-6 h-6 text-accent" />
          ) : (
            <Sun className="w-6 h-6 text-accent" />
          )}
        </div>

        {weatherData ? (
          <div className="weather-content mt-3">
            <p className="text-3xl font-bold">{weatherData.temperature}°C</p>
            <p className="text-sm">{weatherData.condition}</p>
            <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
              <span>
                <Droplets className="inline-block w-4 h-4 mr-1" />
                {weatherData.humidity}%
              </span>
              <span>
                <Wind className="inline-block w-4 h-4 mr-1" />
                {weatherData.windSpeed} m/s
              </span>
            </div>
          </div>
        ) : (
          <LoadingSpinner />
        )}
      </AnimatedCard>

      {/* Market Prices Section */}
      <AnimatedCard delay={0.6}>
        <div className="card-header flex justify-between items-center">
          <h2 className="card-title">Market Prices</h2>
          <TrendingUp className="w-6 h-6 text-green-500" />
        </div>

        <div className="space-y-3 mt-3">
          {marketPrices.map((price) => (
            <div
              key={price.id}
              className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div>
                <p className="font-medium">{price.commodity}</p>
                <p className="text-xs text-muted-foreground">{price.market}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">₹{price.price}</p>
                <p className="text-xs text-muted-foreground">per quintal</p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedCard>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <motion.button
          className="action-btn secondary"
          whileHover={{ scale: 1.05 }}
          onClick={handleRefresh}
        >
          <RefreshCw
            className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </motion.button>

        <motion.button
          className="action-btn primary"
          whileHover={{ scale: 1.05 }}
          onClick={() => setChatModalOpen(true)}
        >
          <MessageCircle className="w-5 h-5" />
          Contact Expert
        </motion.button>

        <motion.button
          className="action-btn primary"
          whileHover={{ scale: 1.05 }}
          onClick={() => setPriceAlertModalOpen(true)}
        >
          <Bell className="w-5 h-5" />
          Price Alerts
        </motion.button>
      </div>

      {/* Modals */}
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        expertName="Dr. Rajesh Kumar"
      />
      <PriceAlertModal
        isOpen={priceAlertModalOpen}
        onClose={() => setPriceAlertModalOpen(false)}
        commodity={selectedCommodity}
      />
    </motion.div>
  );
};

export default Dashboard;
