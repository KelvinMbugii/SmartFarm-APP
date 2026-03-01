import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tractor,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Leaf,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-agricultural-50 to-agricultural-100">
        <div className="text-agricultural-600">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || "Failed to login. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-agricultural-50 to-agricultural-100 p-4 lg:p-8 gap-6">
      {/* Left Info Panel */}
      <div className="hidden lg:flex flex-col justify-center rounded-3xl p-10 bg-agricultural-700 text-white shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-white/15 rounded-full p-3">
            <Tractor className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">SmartFarm Hub</h1>
            <p className="text-agricultural-100">
              Agri-Clinic style connected farming platform
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 mt-1" />
            <div>
              <h2 className="font-semibold text-lg">Secure farmer identity</h2>
              <p className="text-agricultural-100 text-sm">
                One trusted sign-in for consultations, market trends, and
                advisory records.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BarChart3 className="h-6 w-6 mt-1" />
            <div>
              <h2 className="font-semibold text-lg">Live agri insights</h2>
              <p className="text-agricultural-100 text-sm">
                Real-time dashboard access to crop activity, weather, and
                support interactions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Leaf className="h-6 w-6 mt-1" />
            <div>
              <h2 className="font-semibold text-lg">Farmer-first workflow</h2>
              <p className="text-agricultural-100 text-sm">
                Unified client-server communication through shared authenticated
                API requests.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Card */}
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-b from-white to-agricultural-50/30 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="bg-agricultural-100 rounded-full p-4 shadow-lg">
                <Tractor className="h-10 w-10 text-agricultural-600" />
              </div>
            </div>

            <CardTitle className="text-3xl font-bold mb-2 text-agricultural-900 tracking-tight">
              Welcome Back
            </CardTitle>

            <CardDescription className="text-agricultural-600 text-base">
              Sign in to your SmartFarm account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {errorMessage && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-agricultural-700 font-medium"
                >
                  Email Address
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-agricultural-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-12 h-12 bg-white/80 border-agricultural-200 focus:border-agricultural-400 focus:ring-agricultural-400"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-agricultural-700 font-medium"
                >
                  Password
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-agricultural-400" />

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-12 pr-12 h-12 bg-white/80 border-agricultural-200 focus:border-agricultural-400 focus:ring-agricultural-400"
                    required
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-agricultural-500 hover:text-agricultural-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <p className="text-right text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-agricultural-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-agricultural-600 hover:bg-agricultural-700 text-black font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-agricultural-200">
              <p className="text-agricultural-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-agricultural-700 hover:text-agricultural-800 font-semibold hover:underline transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
