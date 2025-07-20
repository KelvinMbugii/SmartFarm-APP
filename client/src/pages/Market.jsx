import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,} from "recharts";
import { Search, TrendingUp, TrendingDown, Bell, Minus } from "lucide-react";

const Market = () => {
  const [prices, setPrices] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");

  useEffect(() => {
    fetchMarketPrices();
    fetchCommodities();
  }, []);

  useEffect(() => {
    if (selectedCommodity) {
      fetchPriceTrends();
    }
  }, [selectedCommodity]);

  const fetchMarketPrices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCommodity) params.append("commodity", selectedCommodity);

      const response = await fetch(`/api/market/prices?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setPrices(data);
      }
    } catch (error) {
      console.error("Error fetching market prices:", error);
      // Mock data for development
      setPrices([
        {
          id: "1",
          commodity: "Rice",
          variety: "Basmati",
          market: "New York Commodity Exchange",
          price: 1250,
          unit: "per ton",
          date: new Date().toISOString(),
          trend: "up",
          change: 5.2,
        },
        {
          id: "2",
          commodity: "Wheat",
          variety: "Hard Red Winter",
          market: "Chicago Board of Trade",
          price: 780,
          unit: "per ton",
          date: new Date().toISOString(),
          trend: "down",
          change: -2.1,
        },
        {
          id: "3",
          commodity: "Corn",
          variety: "Yellow #2",
          market: "Chicago Board of Trade",
          price: 320,
          unit: "per bushel",
          date: new Date().toISOString(),
          trend: "stable",
          change: 0.3,
        },
        {
          id: "4",
          commodity: "Soybeans",
          variety: "#1 Yellow",
          market: "Chicago Board of Trade",
          price: 1450,
          unit: "per bushel",
          date: new Date().toISOString(),
          trend: "up",
          change: 3.8,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommodities = async () => {
    try {
      const response = await fetch("/api/market/commodities");

      if (response.ok) {
        const data = await response.json();
        setCommodities(data);
      }
    } catch (error) {
      console.error("Error fetching commodities:", error);
      setCommodities(["Rice", "Wheat", "Corn", "Soybeans", "Cotton", "Sugar"]);
    }
  };

  const fetchPriceTrends = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCommodity) params.append("commodity", selectedCommodity);

      const response = await fetch(`/api/market/trends?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setTrends(
          data.map((item) => ({
            date: item._id.date,
            price: item.avgPrice,
            commodity: item._id.commodity,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching price trends:", error);
      // Mock trend data
      const mockTrends = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        price: 1000 + Math.random() * 500,
        commodity: selectedCommodity || "Rice",
      })).reverse();
      setTrends(mockTrends);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const filteredPrices = prices.filter(
    (price) =>
      price.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.market.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Market Prices</h1>
          <p className="text-muted-foreground mt-2">
            Real-time commodity prices and market trends
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Bell className="w-4 h-4 mr-2" />
          Set Price Alert
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search commodities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedCommodity}
              onValueChange={setSelectedCommodity}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Commodities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Commodities</SelectItem>
                {commodities.map((commodity) => (
                  <SelectItem key={commodity} value={commodity}>
                    {commodity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSelectedCommodity("");
                setSearchTerm("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Price Chart */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Price Trend - {selectedCommodity || "All Commodities"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value) => [formatPrice(value), "Price"]}
                    labelFormatter={(label) =>
                      `Date: ${new Date(label).toLocaleDateString()}`
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Market Prices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No price data available for the selected filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrices.map((price) => (
                <div
                  key={price.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">
                          {price.commodity} - {price.variety}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(price.trend)}
                          <span
                            className={`text-sm font-medium ${getTrendColor(
                              price.trend
                            )}`}
                          >
                            {price.change > 0 ? "+" : ""}
                            {price.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {price.market}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(price.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {price.unit}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      Last updated: {new Date(price.date).toLocaleDateString()}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Set Alert
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Market;
