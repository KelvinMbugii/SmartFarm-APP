import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { Search, Filter, Plus, Eye, MapPin } from "lucide-react";

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

      const response = await fetch(`/api/equipment?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setEquipment(data.equipment);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      // Mock data for development
      setEquipment([
        {
          id: "1",
          name: "John Deere 5055E Tractor",
          description:
            "Reliable 4WD tractor perfect for small to medium farms. Well-maintained with low hours.",
          category: "tractors",
          price: 25000,
          condition: "used",
          seller: {
            name: "Farm Supply Co.",
            location: "California, USA",
            phone: "+1-555-0123",
          },
          images: [
            "https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg",
          ],
          specifications: {
            brand: "John Deere",
            model: "5055E",
            year: 2020,
            features: ["4WD", "Power Steering", "PTO", "Hydraulic Lift"],
          },
          views: 156,
          featured: true,
          location: "California, USA",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Massey Ferguson MF 1840M",
          description:
            "Square baler in excellent condition. Recently serviced and ready for harvest season.",
          category: "harvesters",
          price: 18500,
          condition: "used",
          seller: {
            name: "Green Valley Equipment",
            location: "Texas, USA",
            phone: "+1-555-0456",
          },
          images: [
            "https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg",
          ],
          specifications: {
            brand: "Massey Ferguson",
            model: "MF 1840M",
            year: 2019,
            features: ["Variable Chamber", "Net Wrap", "Hydraulic Pickup"],
          },
          views: 89,
          featured: false,
          location: "Texas, USA",
          createdAt: new Date().toISOString(),
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Equipment Marketplace
          </h1>
          <p className="text-muted-foreground mt-2">
            Buy and sell agricultural equipment
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          List Equipment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCondition}
              onValueChange={setSelectedCondition}
            >
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Conditions</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="refurbished">Refurbished</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Min Price"
              type="number"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, min: e.target.value }))
              }
            />

            <Input
              placeholder="Max Price"
              type="number"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, max: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4"></div>
                <div className="h-6 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <Card
              key={item.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {item.featured && (
                  <Badge className="absolute top-2 left-2 bg-primary">
                    Featured
                  </Badge>
                )}
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{item.views}</span>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg truncate">
                    {item.name}
                  </h3>
                  <Badge className={getConditionColor(item.condition)}>
                    {item.condition}
                  </Badge>
                </div>

                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{item.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(item.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      by {item.seller.name}
                    </p>
                  </div>
                  <Button size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {equipment.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              No equipment found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Marketplace;
