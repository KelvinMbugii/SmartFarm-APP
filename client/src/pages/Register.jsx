import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tractor, Mail, Lock, Phone, User, MapPin, Wheat, Settings,} from "lucide-react";
import { toast } from "sonner";

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

  const { registerUser, user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
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
        role: formData.role,
        location: formData.location.trim(),
        phone: formData.phone.trim(),
        farmDetails,
      };

      await registerUser(userData);
      setError("");
      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error?.message || "Registration failed");
      toast.error(error?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-agricultural-50 to-agricultural-100 p-6">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-gradient-to-b from-white to-agricultural-50/30 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="bg-agricultural-100 rounded-full p-4 shadow-lg">
              <Tractor className="h-10 w-10 text-agricultural-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-2 text-agricultural-900 tracking-tight">
            Join SmartFarm
          </CardTitle>
          <CardDescription className="text-agricultural-600 text-base">
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
                className="text-agricultural-700 font-medium"
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-agricultural-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="pl-12 h-12 bg-white/80 border-agricultural-200 focus:border-agricultural-400 focus:ring-agricultural-400"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-agricultural-700 font-medium"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-agricultural-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="pl-12 h-12 bg-white/80 border-agricultural-200 focus:border-agricultural-400 focus:ring-agricultural-400"
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-agricultural-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="pl-12 h-12 bg-white/80 border-agricultural-200 focus:border-agricultural-400 focus:ring-agricultural-400"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-agricultural-700 font-medium"
              >
                Role
              </Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full h-12 rounded-md border border-agricultural-200 bg-white/80 px-3 text-agricultural-900 focus:border-agricultural-400 focus:ring-2 focus:ring-agricultural-400 focus:outline-none"
              >
                <option value="">Select Role</option>
                <option value="farmer">Farmer</option>
                <option value="officer">Agricultural Officer</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-agricultural-700 font-medium"
              >
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-agricultural-400" />
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  autoComplete="address-level1"
                  className="pl-12 h-12 bg-white/80 border-agricultural-200 focus:border-agricultural-400 focus:ring-agricultural-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-agricultural-700 font-medium"
              >
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-agricultural-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="^\+?[0-9 ()-]{7,}$"
                  title="Please enter a valid phone number"
                  autoComplete="tel"
                  className="pl-12 h-12 bg-white/80 border-agricultural-200 focus:border-agricultural-400 focus:ring-agricultural-400"
                />
              </div>
            </div>

            {/* Farmer-specific fields */}
            {formData.role === "farmer" && (
              <div className="space-y-5 pt-4 border-t border-agricultural-200">
                <div className="flex items-center gap-2 text-agricultural-700 font-semibold">
                  <Wheat className="h-5 w-5" />
                  <span>Farm Details</span>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="farmSize"
                    className="text-agricultural-700 font-medium"
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
                    className="h-12 bg-white/80 border-agricultural-200 focus:border-agricultural-400 focus:ring-agricultural-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="crops"
                    className="text-agricultural-700 font-medium"
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
                    className="bg-white/80 border-agricultural-200 focus:border-agricultural-400 focus:ring-agricultural-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="equipment"
                    className="text-agricultural-700 font-medium"
                  >
                    Equipment (comma-separated)
                  </Label>
                  <div className="relative">
                    <Settings className="absolute left-3 top-3 h-5 w-5 text-agricultural-400" />
                    <Textarea
                      id="equipment"
                      name="equipment"
                      placeholder="e.g., Tractor, Harvester, Irrigation system"
                      value={formData.equipment}
                      onChange={handleChange}
                      rows={3}
                      required
                      className="pl-12 bg-white/80 border-agricultural-200 focus:border-agricultural-400 focus:ring-agricultural-400 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-agricultural-600 hover:bg-agricultural-700 text-black font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl mt-6"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-agricultural-200">
            <p className="text-agricultural-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-agricultural-700 hover:text-agricultural-800 font-semibold hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
