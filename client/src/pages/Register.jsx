import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tractor, Mail, Lock, Phone, User, MapPin, Wheat, Settings, Eye, EyeOff, ShieldCheck, BarChart3, Leaf, ArrowLeft} from "lucide-react";
import { toast } from "sonner";

const farmersCollabImage = "/images/farmers collaborating.jpeg";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    location: "",
    phone: "",
    farmSize: "",
    crops: "",
    equipment: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { registerUser, user } = useAuth();

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

  if (user) {
    return <Navigate to={roleHomePath(user?.role)} replace />;
  }

  const isFormValid = () => {
    const basicFieldsFilled =
      formData.name &&
      formData.email &&
      formData.password &&
      formData.role &&
      formData.location &&
      formData.phone;

    if (formData.role === "farmer") {
      const cropsArr = formData.crops
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      const equipmentArr = formData.equipment
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      return (
        basicFieldsFilled &&
        formData.farmSize &&
        cropsArr.length > 0 &&
        equipmentArr.length > 0
      );
    }
    return basicFieldsFilled;
  };

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsLoading(true);

    try {
      const farmDetails =
        formData.role === "farmer"
          ? {
              farmSize: formData.farmSize,
              crops: formData.crops
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean),
              equipment: formData.equipment
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean),
            }
          : undefined;

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role.trim().toLowerCase(),
        location: formData.location.trim(),
        phone: formData.phone.trim(),
        farmDetails,
      };

      await registerUser(userData);
      setError("");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error?.response?.data?.error || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background p-4 lg:p-8 gap-6">
      {/* Left Info Panel with Image */}
      <div className="hidden lg:flex flex-col justify-center rounded-3xl p-10 relative overflow-hidden shadow-2xl">
        <img 
          src={farmersCollabImage} 
          alt="Farmers collaborating" 
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
                <h2 className="font-semibold text-lg font-heading text-white">Join Our Community</h2>
                <p className="text-white/80 text-sm font-body">
                  Connect with thousands of farmers, agripreneurs, and agricultural experts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BarChart3 className="h-6 w-6 mt-1" />
              <div>
                <h2 className="font-semibold text-lg font-heading text-white">Grow Your Business</h2>
                <p className="text-white/80 text-sm font-body">
                  Access real-time market prices, weather insights, and expert consultations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Leaf className="h-6 w-6 mt-1" />
              <div>
                <h2 className="font-semibold text-lg font-heading text-white">Smart Farming</h2>
                <p className="text-white/80 text-sm font-body">
                  Leverage AI-powered disease detection and smart farming tools.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-white/70 text-sm font-body">
              Join SmartFarm today and transform your agricultural journey.
            </p>
          </div>
        </div>
      </div>

      {/* Right Registration Card */}
      <div className="flex items-center justify-center">
        <div className="animated-border">
          <div className="card-inner">
            <Card className="w-full max-w-lg shadow-2xl border-0 bg-card backdrop-blur-sm">
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
              Join SmartFarm
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base font-body">
              Create your account to get started
            </CardDescription>
          </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-foreground font-medium font-heading"
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="pl-12 h-12 bg-background/80 border-input focus:border-primary"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-foreground font-medium font-heading"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="pl-12 h-12 bg-background/80 border-input focus:border-primary"
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="pl-12 h-12 bg-background/80 border-input focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  aria-label={showPassword ? "Hide Password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-foreground font-medium font-heading"
              >
                Role
              </Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full h-12 rounded-lg border-2 border-input bg-background px-3 text-foreground focus:border-primary focus:ring-0 focus:outline-none font-body"
              >
                <option value="">Select Role</option>
                <option value="farmer">Farmer</option>
                <option value="agripreneur">Agripreneur</option>
                <option value="officer">Agricultural Officer</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-foreground font-medium font-heading"
              >
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  autoComplete="address-level1"
                  className="pl-12 h-12 bg-background/80 border-input focus:border-primary"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-foreground font-medium font-heading"
              >
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="^\+?[- 0-9 ()]{7,}$"
                  title="Please enter a valid phone number"
                  autoComplete="tel"
                  className="pl-12 h-12 bg-background/80 border-input focus:border-primary"
                />
              </div>
            </div>

            {/* Farmer-specific fields */}
            {formData.role === "farmer" && (
              <div className="space-y-5 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-primary font-semibold font-heading">
                  <Wheat className="h-5 w-5" />
                  <span>Farm Details</span>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="farmSize"
                    className="text-foreground font-medium font-heading"
                  >
                    Farm Size
                  </Label>
                  <Input
                    id="farmSize"
                    name="farmSize"
                    type="text"
                    placeholder="e.g., 10 acres"
                    value={formData.farmSize}
                    onChange={handleChange}
                    required
                    className="h-12 bg-background/80 border-input focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="crops"
                    className="text-foreground font-medium font-heading"
                  >
                    Crops (comma-separated)
                  </Label>
                  <Textarea
                    id="crops"
                    name="crops"
                    placeholder="e.g., Rice, Wheat, Corn"
                    value={formData.crops}
                    onChange={handleChange}
                    rows={3}
                    required
                    className="bg-background/80 border-input focus:border-primary resize-none font-body"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="equipment"
                    className="text-foreground font-medium font-heading"
                  >
                    Equipment (comma-separated)
                  </Label>
                  <div className="relative">
                    <Settings className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Textarea
                      id="equipment"
                      name="equipment"
                      placeholder="e.g., Tractor, Harvester, Irrigation system"
                      value={formData.equipment}
                      onChange={handleChange}
                      rows={3}
                      required
                      className="pl-12 bg-background/80 border-input focus:border-primary resize-none font-body"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-accent hover:bg-accent-hover text-white font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 mt-6 font-heading"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-border">
            <p className="text-muted-foreground font-body">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary font-semibold hover:underline transition-colors"
              >
                Sign in
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

export default Register;
