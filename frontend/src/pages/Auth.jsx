import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import logo from "/logo.jpg";

// Validation schemas
const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reusable error handler
  const handleAuthError = (error, context) => {
    console.error(`${context} Error:`, error); // Log with context

    if (error instanceof z.ZodError) {
      toast.error(error.errors?.[0]?.message || "Validation error");
    } else if (error.response?.data?.message) {
      // Handles specific API errors (e.g., "Email already exists")
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message || "Something went wrong. Try again!");
    }
  };

  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailSchema.parse(signInEmail);
      passwordSchema.parse(signInPassword);

      const response = await authApi.signIn(signInEmail, signInPassword);

      login(response.user, response.token);
      toast.success("Signed in successfully!");
      navigate("/");
    } catch (error) {
      handleAuthError(error, "Sign In");
    } finally {
      setLoading(false); // Ensures button is re-enabled on error
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      emailSchema.parse(signUpEmail);
      passwordSchema.parse(signUpPassword);

      if (signUpPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        // No need for 'return' here, finally will still run
      } else {
        const response = await authApi.signUp(signUpEmail, signUpPassword);

        login(response.user, response.token);
        toast.success("Account created successfully!");
        navigate("/");
      }
    } catch (error) {
      handleAuthError(error, "Sign Up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-amber-500 px-4 pt-20 pb-8">
      <Card className="w-full max-w-md shadow-xl border border-amber-200/30 backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img
              src={logo}
              alt="DelhiDiscover Logo"
              className="w-24 h-24 object-cover rounded-full "
            />
          </div>
          <CardTitle className="text-2xl text-center font-semibold text-amber-600">
            Welcome to DelhiDiscover
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-amber-100">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    disabled={loading} // Disable inputs while loading
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    disabled={loading} // Disable inputs while loading
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    disabled={loading} // Disable inputs while loading
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    disabled={loading} // Disable inputs while loading
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading} // Disable inputs while loading
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};