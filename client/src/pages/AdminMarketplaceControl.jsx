import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";
import { RefreshCcw, ShieldCheck, Trash2 } from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export default function AdminMarketplaceControl() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerTypeFilter, setSellerTypeFilter] = useState("all");

  const fetchControlData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const productParams = {};
      if (search.trim()) productParams.search = search.trim();
      if (statusFilter !== "all") productParams.status = statusFilter;
      if (sellerTypeFilter !== "all") productParams.sellerType = sellerTypeFilter;

      const [productsRes, ordersRes] = await Promise.all([
        api.get("/api/admin/marketplace/products", { params: productParams }),
        api.get("/api/admin/marketplace/orders"),
      ]);

      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to load marketplace control data.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sellerTypeFilter]);

  useEffect(() => {
    fetchControlData();
  }, [fetchControlData]);

  const handleToggleStock = async (product) => {
    try {
      const { data } = await api.patch(
        `/api/admin/marketplace/products/${product._id}/stock`,
        {
          isOutOfStock: !product.isOutOfStock,
        },
      );

      setProducts((prev) =>
        prev.map((item) =>
          item._id === product._id ? { ...item, isOutOfStock: data.isOutOfStock } : item,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to update product stock status.",
      );
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/api/admin/marketplace/products/${productId}`);
      setProducts((prev) => prev.filter((item) => item._id !== productId));
    } catch (err) {
      setError(err.response?.data?.error || "Unable to remove product listing.");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const { data } = await api.patch(
        `/api/admin/marketplace/orders/${orderId}/status`,
        { status },
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: data.status } : order,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update order status.");
    }
  };

  const handleUpdatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const { data } = await api.patch(
        `/api/admin/marketplace/orders/${orderId}/payment`,
        { paymentStatus },
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, paymentStatus: data.paymentStatus }
            : order,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update payment status.");
    }
  };

  const controlsSummary = useMemo(() => {
    const activeListings = products.filter((p) => !p.isOutOfStock).length;
    const flaggedOrders = orders.filter((order) => order.status === "cancelled").length;
    const unpaidOrders = orders.filter((order) => order.paymentStatus !== "paid").length;

    return { activeListings, flaggedOrders, unpaidOrders };
  }, [products, orders]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Admin Control
          </Badge>
          <h1 className="mt-2 text-3xl font-bold">Marketplace Control Panel</h1>
          <p className="text-muted-foreground">
            Control what is sold in the system, moderate listings, and supervise
            marketplace orders.
          </p>
        </div>
        <Button onClick={fetchControlData} className="gap-2" disabled={loading}>
          <RefreshCcw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Listings</p>
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {controlsSummary.activeListings} active listings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {controlsSummary.unpaidOrders} unpaid / pending payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Cancelled Orders</p>
            <p className="text-2xl font-bold">{controlsSummary.flaggedOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Requires operational follow-up
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Filters</CardTitle>
          <CardDescription>
            Search and narrow down products before taking control actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Search by name/category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Listing status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sellerTypeFilter} onValueChange={setSellerTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Seller type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sellers</SelectItem>
              <SelectItem value="farmer">Farmer</SelectItem>
              <SelectItem value="agripreneur">Agripreneur</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchControlData}>Apply Filters</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Product Listing Control
          </CardTitle>
          <CardDescription>
            Set product availability or remove problematic listings.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Seller</th>
                <th className="py-3 pr-4">Seller Type</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Stock</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b">
                  <td className="py-3 pr-4 font-medium">{product.name}</td>
                  <td className="py-3 pr-4">{product.seller?.name || "Unknown"}</td>
                  <td className="py-3 pr-4 capitalize">{product.sellerType}</td>
                  <td className="py-3 pr-4">{formatCurrency(product.price)}</td>
                  <td className="py-3 pr-4">
                    {product.stockQuantity} {product.unit}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={product.isOutOfStock ? "secondary" : "default"}>
                      {product.isOutOfStock ? "Out of stock" : "Active"}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStock(product)}
                      >
                        {product.isOutOfStock ? "Set Active" : "Set Out"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Control</CardTitle>
          <CardDescription>
            Supervise marketplace order flow and payment states.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Buyer</th>
                <th className="py-3 pr-4">Seller</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Order Status</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="py-3 pr-4 font-mono text-xs">{order._id.slice(-8)}</td>
                  <td className="py-3 pr-4">{order.buyer?.name || order.buyerName || "—"}</td>
                  <td className="py-3 pr-4">{order.seller?.name || "—"}</td>
                  <td className="py-3 pr-4">{formatCurrency(order.totalAmount)}</td>
                  <td className="py-3 pr-4 capitalize">{order.status}</td>
                  <td className="py-3 pr-4 capitalize">{order.paymentStatus}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleUpdateOrderStatus(order._id, value)}
                      >
                        <SelectTrigger className="w-[145px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="confirmed">confirmed</SelectItem>
                          <SelectItem value="shipped">shipped</SelectItem>
                          <SelectItem value="delivered">delivered</SelectItem>
                          <SelectItem value="completed">completed</SelectItem>
                          <SelectItem value="cancelled">cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={order.paymentStatus}
                        onValueChange={(value) =>
                          handleUpdatePaymentStatus(order._id, value)
                        }
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="paid">paid</SelectItem>
                          <SelectItem value="failed">failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}