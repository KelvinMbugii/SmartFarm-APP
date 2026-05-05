import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
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
import weatherService from "../services/WeatherService";
import marketService from "../services/MarketService";
import DashboardOverview from "../components/DashboardOverview";
import { Button } from "@/components/ui/button";

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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <DashboardOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatedCard delay={0.4}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold font-heading text-primary">Today Weather</h2>
            {weatherData?.condition?.includes("cloud") ? (
              <Cloud className="w-8 h-8 text-secondary" />
            ) : (
              <Sun className="w-8 h-8 text-accent" />
            )}
          </div>

          {weatherData ? (
            <div className="space-y-3">
              <p className="text-4xl font-bold font-heading">{weatherData.temperature}C</p>
              <p className="text-muted-foreground">{weatherData.condition}</p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  {weatherData.humidity}%
                </span>
                <span className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-primary" />
                  {weatherData.windSpeed} m/s
                </span>
              </div>
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </AnimatedCard>

        <AnimatedCard delay={0.6}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold font-heading text-primary">Market Prices</h2>
            <TrendingUp className="w-8 h-8 text-secondary" />
          </div>

          <div className="space-y-3">
            {marketPrices.map((price) => (
              <div
                key={price.id}
                className="flex justify-between p-4 rounded-lg bg-muted/50 transition-colors hover:bg-muted"
              >
                <div>
                  <p className="font-semibold font-heading">{price.commodity}</p>
                  <p className="text-xs text-muted-foreground">{price.market}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">${price.price}</p>
                  <p className="text-xs text-muted-foreground">per quintal</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      <div className="flex flex-wrap justify-end gap-4">
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>

        <Button
          onClick={() => setChatModalOpen(true)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Contact Expert
        </Button>

        <Button
          variant="secondary"
          onClick={() => setPriceAlertModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Bell className="w-5 h-5" />
          Price Alerts
        </Button>
      </div>

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
