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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="animated-border">
        <div className="card-inner">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-secondary/20 rounded-full p-4 shadow-lg">
                  <Tractor className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold font-heading text-foreground">Forgot Password</CardTitle>
              <CardDescription className="text-muted-foreground font-body">Enter your account email to receive a reset link.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-heading">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="pl-12 h-12 border-input focus:border-primary"
                    />
                  </div>
                </div>
                {msg && <p className="text-sm text-green-700 bg-green-100 rounded-md p-3">{msg}</p>}
                {error && <p className="text-sm text-red-700 bg-red-100 rounded-md p-3">{error}</p>}

                 <Button type="submit" className="w-full h-12 bg-accent hover:bg-accent-hover text-white font-semibold font-heading" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <p className="text-center text-sm mt-5 text-foreground font-body">
                Back to <Link to="/login" className="font-semibold hover:underline text-primary">Login</Link>
              </p>

               </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;