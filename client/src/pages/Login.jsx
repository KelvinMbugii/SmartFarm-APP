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
  Bot,
  ArrowLeft,
} from "lucide-react";

const aiAssistedImage = "/images/Ai assisted farming.png";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user, loading } = useAuth();

  const roleHomePath = (role) => {
    switch (String(role || "").toLowerCase()) {
      case "farmer":
        return "/farmer-dashboard";
      case "agripreneur":
        return "/agripreneur-dashboard";
      case "officer":
        return "/officer-dashboard";
      case "admin":
        return "/IT-dashboard";
      default:
        return "/dashboard";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={roleHomePath(user?.role)} replace />;
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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background p-4 lg:p-8 gap-6">
      {/* Left Info Panel with Image */}
      <div className="hidden lg:flex flex-col justify-center rounded-3xl p-10 relative overflow-hidden shadow-2xl">
        <img 
          src={aiAssistedImage} 
          alt="AI Assisted Farming" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white/15 rounded-full p-3">
              <Tractor className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading text-white">SmartFarm Hub</h1>
              <p className="text-secondary/80">
                Agri-Clinic style connected farming platform
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 mt-1" />
              <div>
                <h2 className="font-semibold text-lg font-heading text-white">Secure farmer identity</h2>
                <p className="text-white/80 text-sm font-body">
                  One trusted sign-in for consultations, market trends, and
                  advisory records.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BarChart3 className="h-6 w-6 mt-1" />
              <div>
                <h2 className="font-semibold text-lg font-heading text-white">Live agri insights</h2>
                <p className="text-white/80 text-sm font-body">
                  Real-time dashboard access to crop activity, weather, and
                  support interactions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Bot className="h-6 w-6 mt-1" />
              <div>
                <h2 className="font-semibold text-lg font-heading text-white">AI-Powered Assistance</h2>
                <p className="text-white/80 text-sm font-body">
                  Get instant disease detection, crop recommendations, and smart farming advice.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/70 text-sm font-body">
              Welcome back! Sign in to continue your smart farming journey.
            </p>
          </div>
        </div>
      </div>

      {/* Right Login Card */}
      <div className="flex items-center justify-center">
        <div className="animated-border">
          <div className="card-inner">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-card backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-start mb-2">
                  <Link
                    to="/"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Back to Home</span>
                  </Link>
                </div>

                <div className="flex justify-center mb-6">
                  <div className="bg-secondary/20 rounded-full p-4 shadow-lg lg:hidden">
                    <Tractor className="h-10 w-10 text-primary" />
                  </div>
                </div>

                <CardTitle className="text-3xl font-bold mb-2 font-heading text-foreground tracking-tight">
                  Welcome Back
                </CardTitle>

                <CardDescription className="text-muted-foreground text-base font-body">
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
                  className="text-foreground font-medium font-heading"
                >
                  Email Address
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-12 h-12 bg-background/80 border-input focus:border-primary"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-foreground font-medium font-heading"
                >
                  Password
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-12 pr-12 h-12 bg-background/80 border-input focus:border-primary"
                    required
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
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
                    className="text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-accent hover:bg-accent-hover text-white font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 font-heading"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-border">
              <p className="text-muted-foreground font-body">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:text-primary font-semibold hover:underline transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
