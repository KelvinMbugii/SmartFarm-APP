import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sprout,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ConsultationRoom from "@/components/ConsultationRoom";
import marketplaceApi, { MARKETPLACE_CATEGORIES } from "@/services/MarketplaceService";
import { toast } from "sonner";

const formatMoney = (n) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(n || 0);

const PRODUCE_CATEGORIES = ["maize", "vegetables", "fruits", "milk", "other"];

export default function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConsultation, setShowConsultation] = useState(false);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productModal, setProductModal] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stockQuantity: "",
    unit: "kg",
    location: "",
    isOutOfStock: false,
    images: [],
  });

  useEffect(() => {
    const run = async () => {
      if (user?.role !== "farmer") return;
      setLoading(true);
      try {
        const { data } = await marketplaceApi.getMyProducts();
        setMyProducts(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load your produce listings");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.role]);

  const openAddProduce = () => {
    setProductForm({
      name: "",
      category: "",
      description: "",
      price: "",
      stockQuantity: "",
      unit: "kg",
      location: user?.location || "",
      isOutOfStock: false,
      images: [],
    });
    setProductModal("add");
  };

  const openEditProduce = (p) => {
    setProductForm({
      name: p.name,
      category: p.category,
      description: p.description || "",
      price: p.price,
      stockQuantity: p.stockQuantity,
      unit: p.unit || "kg",
      location: p.location || user?.location || "",
      isOutOfStock: !!p.isOutOfStock,
      images: p.images || [],
    });
    setProductModal(p._id);
  };

  const saveProduce = async () => {
    const payload = {
      name: productForm.name.trim(),
      category: productForm.category,
      description: productForm.description.trim(),
      price: Number(productForm.price) || 0,
      stockQuantity: Math.max(0, Number(productForm.stockQuantity) || 0),
      unit: productForm.unit.trim() || "kg",
      location: productForm.location.trim() || user?.location,
      isOutOfStock: !!productForm.isOutOfStock,
      images: Array.isArray(productForm.images) ? productForm.images : [],
    };
    if (!payload.name || !payload.category || !payload.location) {
      toast.error("Name, category and location are required");
      return;
    }
    try {
      if (productModal === "add") {
        await marketplaceApi.createProduct(payload);
        toast.success("Produce listing added to marketplace");
      } else {
        await marketplaceApi.updateProduct(productModal, payload);
        toast.success("Listing updated");
      }
      setProductModal(null);
      const { data } = await marketplaceApi.getMyProducts();
      setMyProducts(data);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to save");
    }
  };

  const deleteProduce = async (id) => {
    if (!confirm("Remove this listing from the marketplace?")) return;
    try {
      await marketplaceApi.deleteProduct(id);
      toast.success("Listing removed");
      setProductModal(null);
      setMyProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to delete");
    }
  };

  const displayName = user?.name || "Farmer";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Farmer Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {displayName}! Manage your farming activities and sell your produce.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Active sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produce Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myProducts.length}</div>
            <p className="text-xs text-muted-foreground">In marketplace</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yield Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15%</div>
            <p className="text-xs text-muted-foreground">vs last season</p>
          </CardContent>
        </Card>
      </div>

      {/* Sell Produce Section */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sell Produce</CardTitle>
            <CardDescription>
              List your maize, vegetables, fruits, milk, or other produce in the marketplace. Buyers can order directly.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/marketplace")}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Browse Marketplace
            </Button>
            <Button onClick={openAddProduce} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Listing
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground py-4">Loading your listings...</p>
          ) : myProducts.length === 0 ? (
            <p className="text-muted-foreground py-4">
              You have no produce listings yet. Add your first listing to sell in the marketplace.
            </p>
          ) : (
            <div className="space-y-3">
              {myProducts.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatMoney(p.price)} / {p.unit} · Stock: {p.stockQuantity}
                      {p.isOutOfStock && (
                        <Badge variant="secondary" className="ml-2">Out of stock</Badge>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditProduce(p)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteProduce(p._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access key features</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setShowConsultation(true)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Start Consultation
          </Button>
          <Button variant="outline" onClick={() => navigate("/knowledge")} className="gap-2">
            <BookOpen className="h-4 w-4" />
            View Resources
          </Button>
          <Button variant="outline" onClick={openAddProduce} className="gap-2">
            <Sprout className="h-4 w-4" />
            Sell Produce
          </Button>
          <Button variant="outline" onClick={() => navigate("/marketplace")} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Browse Marketplace
          </Button>
        </CardContent>
      </Card>

      {/* Add/Edit Produce Modal */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{productModal === "add" ? "Sell Produce" : "Edit Listing"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setProductModal(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Product name</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Fresh Maize, Tomatoes, Milk"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(v) => setProductForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (KES)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={productForm.price}
                    onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={0}
                    value={productForm.stockQuantity}
                    onChange={(e) =>
                      setProductForm((f) => ({ ...f, stockQuantity: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={productForm.unit}
                    onChange={(e) => setProductForm((f) => ({ ...f, unit: e.target.value }))}
                    placeholder="kg, litre, crate"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={productForm.location}
                    onChange={(e) => setProductForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="out"
                  checked={productForm.isOutOfStock}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, isOutOfStock: e.target.checked }))
                  }
                />
                <Label htmlFor="out">Mark as out of stock</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveProduce} className="flex-1">
                  {productModal === "add" ? "Add Listing" : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setProductModal(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showConsultation && (
        <ConsultationRoom
          userProfile={user}
          onClose={() => setShowConsultation(false)}
        />
      )}
    </div>
  );
}
