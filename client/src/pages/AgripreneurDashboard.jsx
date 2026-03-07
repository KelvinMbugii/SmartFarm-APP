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
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  X,
  Truck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ConsultationRoom from "@/components/ConsultationRoom";
import marketplaceApi, {
  MARKETPLACE_CATEGORIES,
  ORDER_STATUSES,
} from "@/services/MarketplaceService";
import { toast } from "sonner";

const formatMoney = (n) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(n || 0);

export default function AgripreneurDashboard() {
  const { user } = useAuth();
  const [showConsultation, setShowConsultation] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    ordersReceived: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productModal, setProductModal] = useState(null);
  const [productForm, setProductForm] = useState({
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
  const [orderStatusModal, setOrderStatusModal] = useState(null);

  const loadStats = async () => {
    try {
      const { data } = await marketplaceApi.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load dashboard stats");
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await marketplaceApi.getMyProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load products");
    }
  };

  const loadOrders = async () => {
    try {
      const { data } = await marketplaceApi.getMyOrders("seller");
      setOrders(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadProducts(), loadOrders()]);
      setLoading(false);
    };
    run();
  }, []);

  const openAddProduct = () => {
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

  const openEditProduct = (p) => {
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

  const saveProduct = async () => {
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
        toast.success("Product added");
      } else {
        await marketplaceApi.updateProduct(productModal, payload);
        toast.success("Product updated");
      }
      setProductModal(null);
      loadProducts();
      loadStats();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to save product");
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await marketplaceApi.deleteProduct(id);
      toast.success("Product deleted");
      setProductModal(null);
      loadProducts();
      loadStats();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to delete");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await marketplaceApi.updateOrderStatus(orderId, status);
      toast.success("Order status updated");
      setOrderStatusModal(null);
      loadOrders();
      loadStats();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to update status");
    }
  };

  const displayName = user?.name || "Agripreneur";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Agripreneur Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {displayName}. Manage your products and orders.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Listed in marketplace</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Received</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersReceived}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Delivered / completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Paid orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Products */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Products</CardTitle>
              <CardDescription>Add, edit, or mark out of stock</CardDescription>
            </div>
            <Button onClick={openAddProduct} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-muted-foreground py-4">
                No products yet. Add your first product to appear in the marketplace.
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {products.map((p) => (
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
                        onClick={() => openEditProduct(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteProduct(p._id)}
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

        {/* Orders Received */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Orders Received</CardTitle>
            <CardDescription>Confirm and update order status</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground py-4">No orders yet.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {orders.map((o) => (
                  <div
                    key={o._id}
                    className="p-3 border border-border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {o.buyer?.name || "Buyer"} · {formatMoney(o.totalAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {o.items?.map((i) => `${i.productName || i.product?.name} x ${i.quantity}`).join(", ")}
                        </p>
                        <p className="text-xs">Contact: {o.buyer?.Phone || o.buyerPhone || "—"}</p>
                      </div>
                      <Badge
                        variant={o.status === "pending" ? "secondary" : "default"}
                      >
                        {o.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {ORDER_STATUSES.filter((s) => s !== o.status).map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          onClick={() => updateOrderStatus(o._id, status)}
                        >
                          Mark {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick action */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" onClick={() => setShowConsultation(true)}>
            Start Consultation
          </Button>
          <Button variant="outline" onClick={openAddProduct}>
            Add Product
          </Button>
        </CardContent>
      </Card>

      {/* Add/Edit Product Modal */}
      {productModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{productModal === "add" ? "Add Product" : "Edit Product"}</CardTitle>
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
                  placeholder="e.g. Hybrid Maize Seeds"
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
                    {MARKETPLACE_CATEGORIES.map((c) => (
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
                  <Label>Stock quantity</Label>
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
                    placeholder="kg, bag, litre"
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
                <Button onClick={saveProduct} className="flex-1">
                  {productModal === "add" ? "Add Product" : "Save Changes"}
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
