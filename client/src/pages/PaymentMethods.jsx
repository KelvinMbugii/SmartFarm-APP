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

const mpesaLogo = "/images/Mpesa payment.png";
const airtelLogo = "/images/airtel payment.jpg";

export default function PaymentMethods() {
  const { user } = useAuth();
  const [method, setMethod] = useState("mobile");
  const [mobileProvider, setMobileProvider] = useState("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [airtelPhone, setAirtelPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setMpesaPhone(user?.mpesaPhone || "");
    setAirtelPhone(user?.airtelPhone || "");
    const savedBank = JSON.parse(localStorage.getItem("sf_bank_method") || "null");
    if (savedBank) {
      setBankName(savedBank.bankName || "");
      setAccountName(savedBank.accountName || "");
      setAccountNumber(savedBank.accountNumber || "");
    }
  }, [user]);

  const saveMobile = async () => {
    const phone = mobileProvider === "mpesa" ? mpesaPhone : airtelPhone;
    if (!phone.trim()) {
      toast.error(`Enter an ${mobileProvider === "mpesa" ? "M-Pesa" : "Airtel Money"} number`);
      return;
    }
    setSaving(true);
    try {
      if (mobileProvider === "mpesa") {
        await api.put("/api/users/profile", { mpesaPhone: phone.trim() });
      } else {
        await api.put("/api/users/profile", { airtelPhone: phone.trim() });
      }
      toast.success(`${mobileProvider === "mpesa" ? "M-Pesa" : "Airtel Money"} saved successfully`);
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
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
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
            We support mobile payments (M-Pesa, Airtel Money) and bank accounts.
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
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200"
            >
              <RadioGroupItem id="method-mobile" value="mobile" />
              <div>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">Mobile Money</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  M-Pesa or Airtel Money
                </p>
              </div>
            </Label>
            <Label
              htmlFor="method-bank"
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200"
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
                <Label>Select Provider</Label>
                <RadioGroup
                  value={mobileProvider}
                  onValueChange={setMobileProvider}
                  className="flex flex-wrap gap-4"
                >
                  <Label
                    htmlFor="provider-mpesa"
                    className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200"
                  >
                    <RadioGroupItem id="provider-mpesa" value="mpesa" />
                    <img
                      src={mpesaLogo}
                      alt="M-Pesa"
                      className="h-8 w-auto object-contain"
                    />
                    <span className="font-medium">M-Pesa</span>
                  </Label>
                  <Label
                    htmlFor="provider-airtel"
                    className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-all duration-200"
                  >
                    <RadioGroupItem id="provider-airtel" value="airtel" />
                    <img
                      src={airtelLogo}
                      alt="Airtel Money"
                      className="h-8 w-auto object-contain"
                    />
                    <span className="font-medium">Airtel Money</span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">
                  {mobileProvider === "mpesa" ? "M-Pesa" : "Airtel Money"} Number
                </Label>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <img
                      src={mobileProvider === "mpesa" ? mpesaLogo : airtelLogo}
                      alt={mobileProvider === "mpesa" ? "M-Pesa" : "Airtel Money"}
                      className="h-12 w-auto object-contain rounded"
                    />
                  </div>
                  <Input
                    id="mobileNumber"
                    value={mobileProvider === "mpesa" ? mpesaPhone : airtelPhone}
                    onChange={(e) =>
                      mobileProvider === "mpesa"
                        ? setMpesaPhone(e.target.value)
                        : setAirtelPhone(e.target.value)
                    }
                    placeholder={
                      mobileProvider === "mpesa"
                        ? "e.g. 254712345678"
                        : "e.g. 254712345678"
                    }
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used when paying for orders and for receiving payouts. Seller will
                  receive a notification when payment is confirmed.
                </p>
              </div>
              <Button onClick={saveMobile} disabled={saving} className="w-full sm:w-auto">
                {saving ? "Saving..." : `Save ${mobileProvider === "mpesa" ? "M-Pesa" : "Airtel Money"}`}
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
