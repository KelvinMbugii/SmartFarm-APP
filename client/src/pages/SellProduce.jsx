import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import marketplaceApi from "@/services/MarketplaceService";

const formatMoney = (n) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(n || 0);

const PRODUCE_CATEGORIES = ["maize", "vegetables", "fruits", "milk", "other"];

const MOCK_LISTINGS = [
  {
    _id: "mock-1",
    name: "Fresh Tomatoes",
    category: "vegetables",
    description: "Grade A tomatoes, harvested this morning. Ready for pickup.",
    price: 80,
    stockQuantity: 120,
    unit: "kg",
    location: "Kiambu",
    isOutOfStock: false,
    images: ["https://via.placeholder.com/300x200?text=Tomatoes"],
  },
  {
    _id: "mock-2",
    name: "Dry Maize",
    category: "maize",
    description: "Well dried, suitable for storage. Bulk available.",
    price: 55,
    stockQuantity: 500,
    unit: "kg",
    location: "Nakuru",
    isOutOfStock: false,
    images: ["https://via.placeholder.com/300x200?text=Maize"],
  },
  {
    _id: "mock-3",
    name: "Fresh Milk",
    category: "milk",
    description: "Morning milk, clean and chilled. Delivery possible.",
    price: 60,
    stockQuantity: 0,
    unit: "litre",
    location: "Nyeri",
    isOutOfStock: true,
    images: ["https://via.placeholder.com/300x200?text=Milk"],
  },
];

export default function SellProduce() {
  const { user } = useAuth();
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [listings, setListings] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stockQuantity: "",
    unit: "kg",
    location: user?.location || "",
    images: [],
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      category: "",
      description: "",
      price: "",
      stockQuantity: "",
      unit: "kg",
      location: user?.location || "",
      images: [],
    });
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name || "",
      category: p.category || "",
      description: p.description || "",
      price: String(p.price ?? ""),
      stockQuantity: String(p.stockQuantity ?? ""),
      unit: p.unit || "kg",
      location: p.location || user?.location || "",
      images: Array.isArray(p.images) ? p.images : [],
    });
    setModalOpen(true);
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const { data } = await marketplaceApi.getMyProducts();
      setListings(Array.isArray(data) ? data : []);
      setUseMock(false);
    } catch (e) {
      setListings(MOCK_LISTINGS);
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const readers = files.slice(0, 3).map(
      (f) =>
        new Promise((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result || ""));
          r.readAsDataURL(f);
        })
    );

    Promise.all(readers).then((urls) => {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls].slice(0, 5) }));
      e.target.value = "";
    });
  };

  const removeImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const save = async () => {
    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price) || 0,
      stockQuantity: Math.max(0, Number(form.stockQuantity) || 0),
      unit: form.unit.trim() || "kg",
      location: form.location.trim() || user?.location,
      isOutOfStock: (Number(form.stockQuantity) || 0) <= 0,
      images: Array.isArray(form.images) ? form.images.filter(Boolean) : [],
    };

    if (!payload.name || !payload.category || !payload.location) {
      toast.error("Name, category and location are required");
      return;
    }

    // Mock mode: local state update only
    if (useMock) {
      setListings((prev) => {
        if (!editingId) {
          return [{ ...payload, _id: `mock-${Date.now()}` }, ...prev];
        }
        return prev.map((p) => (p._id === editingId ? { ...p, ...payload } : p));
      });
      toast.success(editingId ? "Listing updated (mock)" : "Listing added (mock)");
      setModalOpen(false);
      return;
    }

    try {
      if (!editingId) {
        await marketplaceApi.createProduct(payload);
        toast.success("Listing added");
      } else {
        await marketplaceApi.updateProduct(editingId, payload);
        toast.success("Listing updated");
      }
      setModalOpen(false);
      await loadListings();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to save listing");
    }
  };

  const markSold = async (id) => {
    if (useMock) {
      setListings((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, isOutOfStock: true, stockQuantity: 0 } : p
        )
      );
      toast.success("Marked as sold (mock)");
      return;
    }
    try {
      await marketplaceApi.updateProduct(id, { isOutOfStock: true, stockQuantity: 0 });
      toast.success("Marked as sold");
      await loadListings();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to mark as sold");
    }
  };

  const removeListing = async (id) => {
    if (!confirm("Delete this listing?")) return;
    if (useMock) {
      setListings((prev) => prev.filter((p) => p._id !== id));
      toast.success("Listing deleted (mock)");
      return;
    }
    try {
      await marketplaceApi.deleteProduct(id);
      toast.success("Listing deleted");
      await loadListings();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to delete listing");
    }
  };

  const listingStats = useMemo(() => {
    const total = listings.length;
    const active = listings.filter((p) => !p.isOutOfStock && Number(p.stockQuantity) > 0).length;
    const sold = listings.filter((p) => p.isOutOfStock || Number(p.stockQuantity) <= 0).length;
    return { total, active, sold };
  }, [listings]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sell Produce</h1>
          <p className="text-muted-foreground mt-1">
            Upload product photos, describe quality, and manage your listings.
          </p>
          {useMock && (
            <Badge variant="secondary" className="mt-2">
              Using mock data (easy debugging)
            </Badge>
          )}
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Listing
        </Button>
      </div>

      {/* quick stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Listings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{listingStats.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{listingStats.active}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sold / Out of stock
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{listingStats.sold}</CardContent>
        </Card>
      </div>

      {/* listings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Produce Listings</CardTitle>
          <CardDescription>
            Use cards for quick actions: edit, delete, or mark as sold.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading listings...</p>
          ) : listings.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No listings yet.</p>
              <Button variant="link" onClick={openAdd}>
                Add your first listing
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {listings.map((p) => {
                const sold = p.isOutOfStock || Number(p.stockQuantity) <= 0;
                const cover =
                  p.images?.[0] ||
                  "https://via.placeholder.com/300x200?text=No+Image";
                return (
                  <Card key={p._id} className="overflow-hidden">
                    <div className="aspect-[3/2] bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{p.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {p.description || "—"}
                          </p>
                        </div>
                        <Badge variant={sold ? "secondary" : "default"}>
                          {sold ? "Sold" : "Active"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="outline" className="capitalize">
                          {p.category}
                        </Badge>
                        <Badge variant="outline">{p.location}</Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {formatMoney(p.price)}
                        </span>{" "}
                        / {p.unit} · Stock: {p.stockQuantity}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => markSold(p._id)}
                          disabled={sold}
                        >
                          <CheckCircle className="h-4 w-4" /> Sold
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeListing(p._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{editingId ? "Edit listing" : "Add listing"}</CardTitle>
                <CardDescription>
                  Upload photos of your produce and add a clear description.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Product name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Fresh Maize, Tomatoes"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description (quality, harvest date, delivery)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  placeholder="Example: Grade A, harvested today, no pests, delivery available..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Price (KES)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.stockQuantity}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, stockQuantity: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={form.unit}
                    onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                    placeholder="kg, crate, litre"
                  />
                </div>
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Kiambu"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Photos</Label>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={onPickFiles}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Upload photos
                  </Button>
                </div>

                {form.images.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No photos yet. Add at least 1 for better sales.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {form.images.map((src, idx) => (
                      <div key={idx} className="relative rounded-md overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded px-2 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={save} className="flex-1">
                  {editingId ? "Save changes" : "Add listing"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

