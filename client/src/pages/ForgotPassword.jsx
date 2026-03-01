import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Tractor } from "lucide-react";
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

function ForgotPassword(){
    const { forgotPassword } = useAuth();
    const [ email, setEmail] = useState("");
    const [ msg, setMsg] = useState("");
    const [ isLoading, setIsLoading] = useState(false);
    const [ error, setError ] = useState("");

    async function handleSubmit(e) {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      setMsg("");  
      
    try {
      const data = await forgotPassword(email.trim());
      setMsg(data.message || "Check your email, a reset link has been sent.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset link.");
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
              <Tractor className="h-10 w-10 text-agricultural-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-agricultural-900">Forgot Password</CardTitle>
          <CardDescription className="text-agricultural-600">Enter your account email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-agricultural-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="pl-12 h-12"
                />
              </div>
            </div>
            {msg && <p className="text-sm text-green-700 bg-green-100 rounded-md p-3">{msg}</p>}
            {error && <p className="text-sm text-red-700 bg-red-100 rounded-md p-3">{error}</p>}

             <Button type="submit" className="w-full h-12 bg-agricultural-600 hover:bg-agricultural-700 text-black" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
          <p className="text-center text-sm mt-5 text-agricultural-700">
            Back to <Link to="/login" className="font-semibold hover:underline">Login</Link>
          </p>

           </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPassword;