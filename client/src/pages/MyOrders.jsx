import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import marketplaceApi from "@/services/MarketplaceService";
import { toast } from "sonner";

const formatMoney = (n) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(n || 0);

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await marketplaceApi.getMyOrders("buyer");
        setOrders(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const payWithMpesa = async (orderId) => {
    setPayingId(orderId);
    try {
      await marketplaceApi.initiatePayment(orderId, true);
      toast.success("Payment confirmed");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, paymentStatus: "paid" } : o
        )
      );
    } catch (e) {
      toast.error(e.response?.data?.error || "Payment failed");
    } finally {
      setPayingId(null);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Please log in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2 text-foreground">My Orders</h1>
      <p className="text-muted-foreground mb-6">
        Orders you placed. Pay via M-Pesa for unpaid orders.
      </p>

      {loading ? (
        <p className="text-muted-foreground">Loading orders...</p>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You have no orders yet. Browse the marketplace to place an order.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o._id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    Order · {formatMoney(o.totalAmount)}
                  </CardTitle>
                  <CardDescription>
                    {new Date(o.createdAt).toLocaleString()} · Seller:{" "}
                    {o.seller?.name || "—"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{o.status}</Badge>
                  <Badge
                    variant={o.paymentStatus === "paid" ? "default" : "outline"}
                  >
                    {o.paymentStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {o.items?.map((i, idx) => (
                    <li key={idx}>
                      {i.productName || i.product?.name} × {i.quantity}{" "}
                      {i.product?.unit || ""} @ {formatMoney(i.unitPrice)}
                    </li>
                  ))}
                </ul>
                {o.paymentStatus !== "paid" && (
                  <Button
                    className="mt-3"
                    onClick={() => payWithMpesa(o._id)}
                    disabled={payingId === o._id}
                  >
                    {payingId === o._id ? "Processing..." : "Pay with M-Pesa"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
