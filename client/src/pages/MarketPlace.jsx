import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Search } from "lucide-react";

const Marketplace = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    "tractors",
    "harvesters",
    "irrigation",
    "tools",
    "seeds",
    "fertilizers",
    "pesticides",
  ];

  useEffect(() => {
    fetchEquipment();
  }, [
    currentPage,
    searchTerm,
    selectedCategory,
    selectedCondition,
    priceRange,
  ]);

  const fetchEquipment = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedCondition) params.append("condition", selectedCondition);
      if (priceRange.min) params.append("minPrice", priceRange.min);
      if (priceRange.max) params.append("maxPrice", priceRange.max);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/product?${params.toString()}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setEquipment(data.products || []);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      // fallback data
      setEquipment([
        {
          id: "1",
          name: "John Deere 5055E Tractor",
          description:
            "Reliable 4WD tractor perfect for small to medium farms.",
          category: "tractors",
          price: 25000,
          condition: "used",
          seller: { name: "Farm Supply Co.", location: "California, USA" },
          images: [
            "https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg",
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "used":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "refurbished":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

 
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Marketplace</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="text-gray-500" />
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>

        <Select onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setSelectedCondition}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="refurbished">Refurbished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Equipment List */}
      {loading ? (
        <p>Loading equipment...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <Card key={item._id || item.id}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={item.images?.[0] || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded"
                />
                <p className="text-sm mt-2">{item.description}</p>
                <Badge className={`${getConditionColor(item.condition)} mt-2`}>
                  {item.condition}
                </Badge>
                <p className="mt-2 font-semibold">{formatPrice(item.price)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Seller: {item.seller?.name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Location: {item.location || "Not specified"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
