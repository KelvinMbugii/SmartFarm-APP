import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tractor, Mail, Lock, Phone, User } from "lucide-react"; 
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

  // Validate required fields based on role
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
    } catch (error) {
      console.error("Registration error:", error);
      setError(error?.message || "Registration failed");
      toast.error(error?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-6">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-700 rounded-full p-3">
              <Tractor className="h-8 w-8 text-blue-500 dark:text-blue-200" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold mb-1">
            Join SmartFarm
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Create your account to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="block w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              >
                <option value="">Select your role</option>
                <option value="farmer">Farmer</option>
                <option value="officer">Agricultural Officer</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="Enter your location"
                value={formData.location}
                onChange={handleChange}
                required
                autoComplete="address-level1"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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
                  className="pl-10"
                />
              </div>
            </div>

            {/* Farmer-specific fields */}
            {formData.role === "farmer" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="farmSize">Farm Size</Label>
                  <Input
                    id="farmSize"
                    name="farmSize"
                    type="text"
                    placeholder="e.g., 10 acres"
                    value={formData.farmSize}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="crops">Crops (comma-separated)</Label>
                  <Textarea
                    id="crops"
                    name="crops"
                    placeholder="e.g., Rice, Wheat, Corn"
                    value={formData.crops}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="equipment">Equipment (comma-separated)</Label>
                  <Textarea
                    id="equipment"
                    name="equipment"
                    placeholder="e.g., Tractor, Harvester, Irrigation system"
                    value={formData.equipment}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium dark:text-blue-400"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
