"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth-store";
import { toastError, toastInfo } from "@/components/toast-varients";
import { cn } from "@/lib/utils";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { validateUser } from "@/app/api/enterpriseSearch/enterpriseSearch";
import TermsAndPrivacyLinks from "@/components/common/term-and-privacy-link";
import LoginSidePanel from "@/components/common/sso-login-side-panel";

// Validation schema
const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/users/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // const response = await fetch(
      //   process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/users/signin",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(data),
      //   }
      // );

      const result = await response.json();
      console.log("result =>", result);
      if (result.data.status === "ERROR") {
        if (result.data.message === "Email not exist!, try to signup") {
          setError("email", {
            type: "manual",
            message: "Enter registered email.",
          });
        } else if (result.data.message === "Incorrect username or password.") {
          setError("password", {
            type: "manual",
            message: "Incorrect username or password.",
          });
        } else {
          setApiError(result.data.message || "Sign in failed");
        }
        return;
      }

      if (!response.ok) {
        if (response.status === 500) {
          setError("password", {
            type: "manual",
            message: "Incorrect username or password.",
          });
        } else {
          setApiError("Server error. Please try again.");
        }
        return;
      }

      if (result) {
        const accessToken = result.data.data.userToken.AccessToken;
        // Store token and user data in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("__LOGIN_SESSION__", accessToken);

        const userId = result.data.data.userData.userId;
        localStorage.setItem("user_id", userId);

        router.push("/org-list");
      } else {
        toastError("Facing Some problem in signin.", "Please try again.");
      }
    } catch (error) {
      console.log(" signin error => ", error);
      setApiError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const krooloLogoSrc = mounted
    ? resolvedTheme === "light"
      ? "/assets/icons/kroolo-dark-logo.svg"
      : "/assets/icons/kroolo-light-logo.svg"
    : "/assets/icons/kroolo-dark-logo.svg"; // or fallback to a neutral logo or loading placeholder

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <Image src={krooloLogoSrc} alt="Logo" width={150} height={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold">
                Welcome to{" "}
                <span className="text-base-purple">Kroolo AI Search</span>
              </h1>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                Unlock your team&apos;s knowledge base with AI-powered insights.
                <br />
                Let Kroolo AI Search help you find answers quickly and
                effortlessly.
              </p>
            </div>
          </div>

          {/* Sign In Form */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-center">Sign in</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  disabled={isLoading}
                  className={cn(
                    "w-full px-3 py-2 rounded-md border border-transparent outline-none bg-transparent shadow-none transition-colors",
                    "hover:border-base-purple",
                    "focus:border-base-purple",
                    "focus-visible:border-base-purple", // explicitly define what border you want
                    errors.email &&
                      "border border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500/20 focus-visible:border-red-500"
                  )}
                />

                {errors.email && (
                  <p className="text-xs text-error-red">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    disabled={isLoading}
                    className={cn(
                      "w-full px-3 py-2 pr-10 rounded-md border border-transparent outline-none bg-transparent shadow-none transition-colors",
                      "hover:border-base-purple focus:border-base-purple focus-visible:border-base-purple",
                      errors.password &&
                        "border border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500/20 focus-visible:border-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-500"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <VisibilityIcon className="h-4 w-4 " />
                    ) : (
                      <VisibilityOffIcon className="h-4 w-4 " />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error-red">
                    {errors.password.message}
                  </p>
                )}
                {/* <div className="text-right">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm bg-base-purple hover:bg-base-purple-hover"
                  >
                    Forgot password?
                  </Link>
                </div> */}
              </div>

              <Button
                type="submit"
                className="w-full cursor-pointer bg-base-purple hover:bg-base-purple-hover text-white py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center text-xs text-gray-500">
              {"Don't have an account? "}
              <Link
                href="https://app.kroolo.com/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base-purple hover:text-base-purple-hover font-medium"
              >
                Sign up
              </Link>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
              <Link
                href={`/login/sso`}
                rel="noopener noreferrer"
                className="text-base-purple hover:text-base-purple-hover font-medium"
              >
                Login with SSO
              </Link>
            </div>
            <TermsAndPrivacyLinks />
          </div>
        </div>
      </div>
      <LoginSidePanel />
    </div>
  );
}
