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
import { Tractor } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null); // << Error state here
  const { login, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null); // Clear previous errors

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      // Check if response status is 403 for deactivated account
      if (error.response && error.response.status === 403) {
        setErrorMessage(
          error.response.data.error || "Your account has been deactivated."
        );
      } else {
        setErrorMessage(
          error.response?.data?.error ||
            error.message ||
            "Failed to login. Please try again."
        );
      }
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
   <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-6">
     <Card className="w-full max-w-md shadow-xl">
       <CardHeader className="text-center">
         <div className="flex justify-center mb-4">
           <div className="bg-blue-100 dark:bg-blue-700 rounded-full p-4">
             <Tractor className="h-8 w-8 text-blue-600 dark:text-blue-200" />
           </div>
         </div>
         <CardTitle className="text-2xl font-extrabold mb-2">
           Welcome to SmartFarm
         </CardTitle>
         <CardDescription className="text-gray-600 dark:text-gray-400">
           Sign in to your account to continue
         </CardDescription>
       </CardHeader>

       <CardContent>
         {errorMessage && (
           <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-500 rounded-lg text-sm font-medium">
             {errorMessage}
           </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-1 relative">
             <Label htmlFor="email">Email Address</Label>
             <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
             <Input
               id="email"
               name="email"
               type="email"
               placeholder="Enter your email"
               value={formData.email}
               onChange={handleChange}
               className="pl-10"
               required
               autoComplete="email"
             />
           </div>

           <div className="space-y-1 relative">
             <Label htmlFor="password">Password</Label>
             <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
             <Input
               id="password"
               name="password"
               type="password"
               placeholder="Enter your password"
               value={formData.password}
               onChange={handleChange}
               className="pl-10"
               required
               autoComplete="current-password"
             />
           </div>

           <Button
             type="submit"
             className="w-full"
             size="lg"
             disabled={isLoading}
           >
             {isLoading ? "Signing in..." : "Sign In"}
           </Button>
         </form>

         <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
           Don't have an account?{" "}
           <Link
             to="/register"
             className="text-blue-600 hover:underline font-medium dark:text-blue-400"
           >
             Sign up
           </Link>
         </div>
       </CardContent>
     </Card>
   </div>
 );
};

export default Login;
