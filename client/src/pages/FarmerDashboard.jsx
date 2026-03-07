import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sprout,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Package,
  ShoppingCart,
  Bell,
  Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ConsultationRoom from "@/components/ConsultationRoom";
import marketplaceApi from "@/services/MarketplaceService";
import { toast } from "sonner";

const MOCK_MY_LISTINGS = [
  { _id: "m1", name: "Fresh Tomatoes", stockQuantity: 50, isOutOfStock: false },
  { _id: "m2", name: "Dry Maize", stockQuantity: 0, isOutOfStock: true },
  { _id: "m3", name: "Fresh Milk", stockQuantity: 30, isOutOfStock: false },
];

export default function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [showConsultation, setShowConsultation] = useState(false);
  const [loadingListings, setLoadingListings] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [myListings, setMyListings] = useState([]);

  useEffect(() => {
    const run = async () => {
      if (String(user?.role || "").toLowerCase() !== "farmer") return;
      setLoadingListings(true);
      try {
        const { data } = await marketplaceApi.getMyProducts();
        setMyListings(Array.isArray(data) ? data : []);
        setUseMock(false);
      } catch (e) {
        setMyListings(MOCK_MY_LISTINGS);
        setUseMock(true);
        toast.message("Using mock listings (debugging)");
      } finally {
        setLoadingListings(false);
      }
    };
    run();
  }, [user?.role]);

  const listingStats = useMemo(() => {
    const total = myListings.length;
    const active = myListings.filter((p) => !p.isOutOfStock && Number(p.stockQuantity) > 0)
      .length;
    const sold = total - active;
    return { total, active, sold };
  }, [myListings]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Farmer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "Farmer"}! Manage your farm activities
            and sell produce.
          </p>
          {useMock && (
            <Badge variant="secondary" className="mt-2">
              Using mock data for easy debugging
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/notifications")} className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button onClick={() => navigate("/sell-produce")} className="gap-2">
            <Store className="h-4 w-4" />
            Sell Produce
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
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
            <div className="text-2xl font-bold">
              {loadingListings ? "—" : listingStats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {loadingListings ? "Loading..." : `${listingStats.active} active, ${listingStats.sold} sold`}
            </p>
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

      {/* Produce management CTA */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle>Sell Produce</CardTitle>
            <CardDescription>
              Upload photos, add descriptions, mark as sold, and manage your
              listings in a dedicated page.
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate("/marketplace")} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Browse Marketplace
            </Button>
            <Button onClick={() => navigate("/sell-produce")} className="gap-2">
              <Store className="h-4 w-4" />
              Manage Listings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active listings
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {loadingListings ? "—" : listingStats.active}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sold / Out of stock
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {loadingListings ? "—" : listingStats.sold}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quick tip
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Add clear photos + quality notes to increase buyer trust.
              </CardContent>
            </Card>
          </div>
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
            Knowledge Base
          </Button>
          <Button variant="outline" onClick={() => navigate("/sell-produce")} className="gap-2">
            <Store className="h-4 w-4" />
            Sell Produce
          </Button>
          <Button variant="outline" onClick={() => navigate("/my-orders")} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            My Orders
          </Button>
        </CardContent>
      </Card>

      {showConsultation && (
        <ConsultationRoom
          userProfile={user}
          onClose={() => setShowConsultation(false)}
        />
      )}
    </div>
  );
}

