import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import marketplaceApi from "@/services/MarketplaceService";
import { ORDER_STATUSES } from "@/services/MarketplaceService";
import { toast } from "sonner";

const formatMoney = (n) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(n || 0);

const MOCK_PLACED = [
  {
    _id: "p1",
    totalAmount: 2500,
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString(),
    seller: { name: "Agri Inputs Shop" },
    items: [{ productName: "Hybrid Seeds", quantity: 2, unitPrice: 1250, product: { unit: "bag" } }],
  },
];

const MOCK_RECEIVED = [
  {
    _id: "r1",
    totalAmount: 4200,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: new Date().toISOString(),
    buyer: { name: "Buyer Alice", Phone: "+254700000000" },
    items: [{ productName: "Fresh Tomatoes", quantity: 60, unitPrice: 70, product: { unit: "kg" } }],
  },
  {
    _id: "r2",
    totalAmount: 6600,
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    buyer: { name: "Buyer Brian", Phone: "+254711111111" },
    items: [{ productName: "Dry Maize", quantity: 120, unitPrice: 55, product: { unit: "kg" } }],
  },
];

function OrderCard({ kind, order, onPay, paying }) {
  const created = order.createdAt ? new Date(order.createdAt).toLocaleString() : "—";
  const who =
    kind === "received"
      ? order.buyer?.name || "Buyer"
      : order.seller?.name || "Seller";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base truncate">
            Order · {formatMoney(order.totalAmount)}
          </CardTitle>
          <CardDescription className="truncate">
            {created} · {kind === "received" ? "Buyer" : "Seller"}: {who}
          </CardDescription>
          {kind === "received" && (
            <p className="text-xs text-muted-foreground mt-1">
              Contact: {order.buyer?.Phone || order.buyerPhone || "—"}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Badge variant="secondary">{order.status}</Badge>
          <Badge
            variant={order.paymentStatus === "paid" ? "default" : "outline"}
          >
            {order.paymentStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-muted-foreground space-y-1">
          {(order.items || []).map((i, idx) => (
            <li key={idx}>
              {i.productName || i.product?.name} × {i.quantity}{" "}
              {i.product?.unit || ""} @ {formatMoney(i.unitPrice)}
            </li>
          ))}
        </ul>

        {kind === "placed" && order.paymentStatus !== "paid" && (
          <Button
            className="mt-3"
            onClick={() => onPay?.(order._id)}
            disabled={paying}
          >
            {paying ? "Processing..." : "Pay with M-Pesa"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function MyOrders() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const canReceive = role === "farmer" || role === "agripreneur";

  const [tab, setTab] = useState(canReceive ? "received" : "placed");
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  const [placed, setPlaced] = useState([]);
  const [received, setReceived] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [placedRes, receivedRes] = await Promise.all([
        marketplaceApi.getMyOrders("buyer"),
        canReceive ? marketplaceApi.getMyOrders("seller") : Promise.resolve({ data: [] }),
      ]);
      setPlaced(Array.isArray(placedRes.data) ? placedRes.data : []);
      setReceived(Array.isArray(receivedRes.data) ? receivedRes.data : []);
      setUseMock(false);
    } catch (e) {
      setPlaced(MOCK_PLACED);
      setReceived(canReceive ? MOCK_RECEIVED : []);
      setUseMock(true);
      toast.message("Using mock orders (debugging)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const payWithMpesa = async (orderId) => {
    setPayingId(orderId);
    try {
      await marketplaceApi.initiatePayment(orderId, true);
      toast.success("Payment confirmed");
      setPlaced((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, paymentStatus: "paid" } : o))
      );
    } catch (e) {
      toast.error(e.response?.data?.error || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  const nextStatusActions = (status) => {
    switch (status) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["shipped", "cancelled"];
      case "shipped":
        return ["delivered"];
      case "delivered":
        return ["completed"];
      default:
        return [];
    }
  };

  const updateReceivedStatus = async (orderId, status) => {
    if (!status || !ORDER_STATUSES.includes(status)) {
      toast.error("Invalid status");
      return;
    }
    setUpdatingId(orderId);
    try {
      if (useMock) {
        setReceived((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status } : o))
        );
        toast.success("Order status updated (mock)");
        return;
      }
      const { data } = await marketplaceApi.updateOrderStatus(orderId, status);
      setReceived((prev) => prev.map((o) => (o._id === orderId ? data : o)));
      toast.success("Order status updated");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = useMemo(() => {
    const all = tab === "received" ? received : placed;
    const pending = all.filter((o) => o.status === "pending").length;
    const paid = all.filter((o) => o.paymentStatus === "paid").length;
    return { count: all.length, pending, paid };
  }, [tab, placed, received]);

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Please log in to view orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
          <p className="text-muted-foreground">
            {canReceive
              ? "View orders you placed, and orders received on your produce listings."
              : "View orders you placed. Pay via M-Pesa for unpaid orders."}
          </p>
          {useMock && (
            <Badge variant="secondary" className="mt-2">
              Using mock data for debugging
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">Total: {stats.count}</Badge>
          <Badge variant="outline">Pending: {stats.pending}</Badge>
          <Badge variant="outline">Paid: {stats.paid}</Badge>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {canReceive && <TabsTrigger value="received">Orders Received</TabsTrigger>}
          <TabsTrigger value="placed">Orders I Placed</TabsTrigger>
        </TabsList>

        {canReceive && (
          <TabsContent value="received" className="mt-4">
            {loading ? (
              <p className="text-muted-foreground">Loading received orders...</p>
            ) : received.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No orders have been made to you yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {received.map((o) => {
                  const actions = nextStatusActions(o.status);
                  return (
                    <Card key={o._id}>
                      <OrderCard kind="received" order={o} />
                      <CardContent className="pt-0">
                        {actions.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {actions.map((s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant="outline"
                                onClick={() => updateReceivedStatus(o._id, s)}
                                disabled={updatingId === o._id}
                              >
                                Mark {s}
                              </Button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="placed" className="mt-4">
          {loading ? (
            <p className="text-muted-foreground">Loading placed orders...</p>
          ) : placed.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                You have no orders yet. Browse the marketplace to place an order.
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {placed.map((o) => (
                <OrderCard
                  key={o._id}
                  kind="placed"
                  order={o}
                  onPay={payWithMpesa}
                  paying={payingId === o._id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

