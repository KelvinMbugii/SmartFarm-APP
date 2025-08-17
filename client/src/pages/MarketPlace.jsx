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
}

 export default Marketplace;
