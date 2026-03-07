import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Phone, MapPin, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import marketplaceApi, { MARKETPLACE_CATEGORIES } from "@/services/MarketplaceService";
import { toast } from "sonner";

const formatMoney = (n) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(n || 0);

export default function Marketplace() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sellerType, setSellerType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 24 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (sellerType) params.sellerType = sellerType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      const { data } = await marketplaceApi.getProducts(params);
      setProducts(data.products || []);
      setTotal(data.total ?? 0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, sellerType]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const placeOrder = async () => {
    if (!selectedProduct || !user) {
      toast.error("Please log in to place an order");
      return;
    }
    const qty = Math.max(1, parseInt(orderQuantity, 10) || 1);
    if (selectedProduct.stockQuantity < qty) {
      toast.error(`Only ${selectedProduct.stockQuantity} ${selectedProduct.unit} available`);
      return;
    }
    setPlacing(true);
    try {
      const { data } = await marketplaceApi.placeOrder({
        items: [{ productId: selectedProduct._id, quantity: qty }],
        shippingAddress: "",
      });
      setLastPlacedOrderId(data._id);
      toast.success("Order placed. Seller will be notified. You can pay via M-Pesa below.");
      setOrderQuantity(1);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const initiateMpesa = async (orderId) => {
    const id = orderId || lastPlacedOrderId;
    if (!id || !user) {
      toast.info("Place the order first, then click Pay with M-Pesa.");
      return;
    }
    setPaying(true);
    try {
      await marketplaceApi.initiatePayment(id, true);
      toast.success("Payment confirmed");
      setLastPlacedOrderId(null);
    } catch (e) {
      toast.error(e.response?.data?.error || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const totalPages = Math.ceil(total / 24);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-foreground">Marketplace</h1>
      <p className="text-muted-foreground mb-6">
        Buy farm inputs from agripreneurs or produce from farmers. One place for all agricultural trade.
      </p>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {MARKETPLACE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sellerType} onValueChange={(v) => { setSellerType(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seller type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agripreneur">Agripreneur</SelectItem>
            <SelectItem value="farmer">Farmer</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Min price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-28"
        />
        <Input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-28"
        />
        <Button type="submit">Search</Button>
      </form>

      {loading ? (
        <p className="text-muted-foreground py-8">Loading products...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <Card
                key={item._id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setSelectedProduct(item);
                  setOrderQuantity(1);
                }}
              >
                <CardHeader className="p-0">
                  <div className="aspect-[4/3] bg-muted rounded-t-xl overflow-hidden">
                    <img
                      src={item.images?.[0] || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-base truncate">{item.name}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {item.description || "—"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-primary">
                      {formatMoney(item.price)}
                    </span>
                    <Badge variant="secondary">{item.sellerType}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.stockQuantity} {item.unit} · {item.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Seller: {item.seller?.name || "—"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Product detail & order modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{selectedProduct.name}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSelectedProduct(null); setLastPlacedOrderId(null); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={
                    selectedProduct.images?.[0] ||
                    "https://via.placeholder.com/600x340?text=No+Image"
                  }
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-muted-foreground">{selectedProduct.description || "No description."}</p>
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-primary">
                  {formatMoney(selectedProduct.price)} / {selectedProduct.unit}
                </span>
                <span className="text-sm text-muted-foreground">
                  Available: {selectedProduct.stockQuantity} {selectedProduct.unit}
                </span>
              </div>
              <div className="border-t pt-4 space-y-2">
                <p className="font-medium">Seller</p>
                <p>{selectedProduct.seller?.name || "—"}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {selectedProduct.location}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{selectedProduct.seller?.Phone || "Contact via platform"}</span>
                </div>
              </div>
              {user && (
                <div className="space-y-2 border-t pt-4">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedProduct.stockQuantity}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                  />
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={placeOrder}
                        disabled={placing}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {placing ? "Placing..." : "Place Order"}
                      </Button>
                      {lastPlacedOrderId && (
                        <Button
                          variant="outline"
                          onClick={() => initiateMpesa(lastPlacedOrderId)}
                          disabled={paying}
                        >
                          {paying ? "Processing..." : "Pay with M-Pesa"}
                        </Button>
                      )}
                    </div>
                    {lastPlacedOrderId && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Order placed. Click &quot;Pay with M-Pesa&quot; to confirm payment (demo: marks as paid).
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Add your M-Pesa number in Profile for payments.
                    </p>
                  </div>
                </div>
              )}
              {!user && (
                <p className="text-sm text-muted-foreground border-t pt-4">
                  Log in to place an order.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
