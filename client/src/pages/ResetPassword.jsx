import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Lock, Tractor, Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

function ResetPassword() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg ] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    setError("");
    setMsg("");


    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try{
      const data = await resetPassword(token, password);
      setMsg(data.message || "Password reset successful.");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-agricultural-50 to-agricultural-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-b from-white to-agricultural-50/30">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-agricultural-100 rounded-full p-4 shadow-lg">
              <Tractor className="h-10 w-10 text-agricultural-600"/>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-agricultural-900">
            Reset Password
          </CardTitle>
          <CardDescription className="text-agricultural-600">
            Create a new secure password for your SmartFarm account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-agricultural-400"/>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-agricultural-500 hover:text-agricultural-700"
                  aria-label={showPassword ? "Hide password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-agricultural-400"/>
                <Input 
                  id="confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="pl-12 pr-12 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-agricultural-500 hover:text-agricultural-700"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                   {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {msg && <p className="text-sm text-green-700 bg-green-100 rounded-md p-3">{msg}</p>}
            {error && <p className="text-sm text-red-700 bg-red-100 rounded-md p-3">{error}</p>}

            <Button type="submit" className="w-full h-12 bg-agricultural-600 hover:bg-agricultural-700 text-black" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
           <p className="text-center text-sm mt-5 text-agricultural-700">
            Go to <Link to="/login" className="font-semibold hover:underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPassword;