import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { toast } from "sonner";

export default function PaymentMethods() {
  const { user } = useAuth();
  const [method, setMethod] = useState("mobile");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setMpesaPhone(user?.mpesaPhone || "");
    const savedBank = JSON.parse(localStorage.getItem("sf_bank_method") || "null");
    if (savedBank) {
      setBankName(savedBank.bankName || "");
      setAccountName(savedBank.accountName || "");
      setAccountNumber(savedBank.accountNumber || "");
    }
  }, [user]);

  const saveMobile = async () => {
    if (!mpesaPhone.trim()) {
      toast.error("Enter an M-Pesa / mobile number");
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/users/profile", { mpesaPhone: mpesaPhone.trim() });
      toast.success("Mobile payment method saved");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to save mobile method");
    } finally {
      setSaving(false);
    }
  };

  const saveBank = () => {
    if (!bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
      toast.error("Fill all bank fields");
      return;
    }
    const payload = {
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
    };
    localStorage.setItem("sf_bank_method", JSON.stringify(payload));
    toast.success("Bank details saved locally");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Methods</h1>
          <p className="text-muted-foreground mt-1">
            Configure how you pay and receive money on SmartFarm.
          </p>
          {user?.role && (
            <Badge variant="secondary" className="mt-2 capitalize">
              {user.role}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose method type</CardTitle>
          <CardDescription>
            For now, we support mobile payments (M-Pesa) and a simple bank record.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={method}
            onValueChange={setMethod}
            className="flex flex-wrap gap-4"
          >
            <Label
              htmlFor="method-mobile"
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
            >
              <RadioGroupItem id="method-mobile" value="mobile" />
              <div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">Mobile (M-Pesa)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended for both farmers and agripreneurs.
                </p>
              </div>
            </Label>
            <Label
              htmlFor="method-bank"
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
            >
              <RadioGroupItem id="method-bank" value="bank" />
              <div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">Bank account</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Stored locally for now (demo only).
                </p>
              </div>
            </Label>
          </RadioGroup>

          {method === "mobile" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mpesa">M-Pesa / Mobile number</Label>
                <Input
                  id="mpesa"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="e.g. 254712345678"
                />
                <p className="text-xs text-muted-foreground">
                  Used when paying for orders and for receiving payouts. Seller will
                  receive a notification when payment is confirmed.
                </p>
              </div>
              <Button onClick={saveMobile} disabled={saving}>
                {saving ? "Saving..." : "Save mobile method"}
              </Button>
            </div>
          )}

          {method === "bank" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank name</Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Equity Bank"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account holder name</Label>
                <Input
                  id="accountName"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Name as it appears on account"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account number</Label>
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                For now, bank details are stored only in your browser for demo purposes.
              </p>
              <Button variant="outline" onClick={saveBank}>
                Save bank details (local)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

