import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tractor } from "lucide-react";
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
  const { registerUser, user} = useAuth();

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Validates required fields based on role
  const isFormValid = () => {
    const basicFieldsFilled =
      formData.name &&
      formData.email &&
      formData.password &&
      formData.role &&
      formData.location &&
      formData.phone;

    if (formData.role === "farmer") {
      // For farmers, farm-related fields must also be set and crops/equipment non-empty arrays
      const cropsArr = formData.crops.split(",").map((c) => c.trim()).filter(Boolean);
      const equipmentArr = formData.equipment.split(",").map((e) => e.trim()).filter(Boolean);
      return (
        basicFieldsFilled &&
        formData.farmSize &&
        cropsArr.length > 0 &&
        equipmentArr.length > 0
      );
    }

    return basicFieldsFilled;
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSelectChange = (value) =>
    setFormData((prev) => ({ ...prev, role: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      console.log("Invalid form submission:", formData);
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
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <Tractor className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold mb-1">Join SmartFarm</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Create your account to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Role */}
            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleSelectChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="officer">Agricultural Officer</SelectItem>
                </SelectContent>
              </Select>
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
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="^\\+?[0-9 ()-]{7,}$"
                title="Please enter a valid phone number"
                autoComplete="tel"
              />
            </div>

            {/* Farmer specific fields */}
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
                    required={formData.role === "farmer"}
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
                    required={formData.role === "farmer"}
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
                    required={formData.role === "farmer"}
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
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
