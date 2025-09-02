"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { produce } from "immer";
import useAuthenticationStore from "@/stores/authentication";
import { useCompanyStore } from "@/stores/company-store";
import TextInput from "@/components/common/text-input";
import TermsAndPrivacyLinks from "@/components/common/term-and-privacy-link";
import LoadingSpinner from "@/components/common/loading-spinner";
import SsoLoginSidePanel from "@/components/common/sso-login-side-panel";
import { EMAIL_REGEX } from "@/constants/validation-constants";
import { errorMessages } from "@/constants/error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import LoginSidePanel from "@/components/common/sso-login-side-panel";

export default function SsoLogin() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  const ssoLoginData = useAuthenticationStore((state) => state.ssoLoginData);
  const ssoLoginError = useAuthenticationStore((state) => state.ssoLoginError);
  const SsoLoginApi = useCompanyStore((state) => state.SsoLoginApi);

  useEffect(() => {
    useAuthenticationStore.setState((state) => ({
      ssoLoginData: { ...state.ssoLoginData },
    }));
    useAuthenticationStore.setState(
      produce((state) => {
        state.ssoLoginData.email = "";
        state.ssoLoginError.email = "";
        state.ssoLoginError.disabled = false;
        state.ssoLoginError.loader = false;
      })
    );

    setMounted(true);
  }, []);

  const onEmailChange = (value: string) => {
    const email = value?.toLowerCase();
    useAuthenticationStore.setState((state) => ({
      ssoLoginData: { ...state.ssoLoginData, email },
    }));

    if (!value) {
      useAuthenticationStore.setState((state) => ({
        ssoLoginError: {
          ...state.ssoLoginError,
          email: errorMessages.ssoEmail.required,
        },
      }));
      return false;
    } else if (!EMAIL_REGEX.test(value)) {
      useAuthenticationStore.setState((state) => ({
        ssoLoginError: {
          ...state.ssoLoginError,
          email: errorMessages.ssoEmail.validate,
        },
      }));
      return false;
    } else {
      useAuthenticationStore.setState((state) => ({
        ssoLoginError: { ...state.ssoLoginError, email: "" },
      }));
      return true;
    }
  };

  const onSSOLoginSubmitHandler = useCallback(
    async (
      e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
    ) => {
      e?.preventDefault();
      const isEmailValid = onEmailChange(ssoLoginData.email);

      if (isEmailValid) {
        useAuthenticationStore.setState((state) => ({
          ssoLoginError: {
            ...state.ssoLoginError,
            disabled: true,
            loader: true,
          },
        }));

        const errorResponse = await SsoLoginApi(ssoLoginData.email);

        if (errorResponse?.user_facing_error) {
          useAuthenticationStore.setState((state) => ({
            ssoLoginError: {
              ...state.ssoLoginError,
              email: errorResponse.user_facing_error,
              disabled: false,
              loader: false,
            },
          }));
        } else {
          useAuthenticationStore.setState((state) => ({
            ssoLoginError: {
              ...state.ssoLoginError,
              disabled: false,
              loader: false,
              email: "",
            },
            ssoLoginData: {
              ...state.ssoLoginData,
              email: "",
            },
          }));
        }
      }
    },
    [SsoLoginApi, ssoLoginData.email]
  );

  const krooloLogoSrc = mounted
    ? resolvedTheme === "light"
      ? "/assets/icons/kroolo-dark-logo.svg"
      : "/assets/icons/kroolo-light-logo.svg"
    : "/assets/icons/kroolo-dark-logo.svg";

  return (
    <>
      <Head>
        <title>SSO Login with Kroolo</title>
        <meta
          name="description"
          content="SSO Login with Kroolo to get Productivity Apps in one"
        />
      </Head>

      <div className="min-h-screen flex">
        {/* Left Side - SSO Sign In Form */}
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
                  Unlock your team&apos;s knowledge base with AI-powered
                  insights.
                  <br />
                  Let Kroolo AI Search help you find answers quickly and
                  effortlessly.
                </p>
              </div>
            </div>

            {/* SSO Form */}
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-center">
                Login with SSO
              </h2>
              <form onSubmit={onSSOLoginSubmitHandler} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium">
                    Work Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@workmail.com"
                    value={ssoLoginData.email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    disabled={ssoLoginError.disabled}
                    className={cn(
                      "w-full px-3 py-2 rounded-md border border-transparent outline-none bg-transparent shadow-none transition-colors",
                      "hover:border-base-purple",
                      "focus:border-base-purple",
                      "focus-visible:border-base-purple",
                      ssoLoginError.email &&
                        "border-error-border hover:border-error-border focus:border-error-border focus:ring-error-border/20 focus-visible:border-error-border"
                    )}
                  />
                  {ssoLoginError.email && (
                    <p className="text-xs text-error-red">
                      {ssoLoginError.email}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={ssoLoginError.disabled}
                  className="w-full cursor-pointer bg-base-purple hover:bg-base-purple-hover text-white py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ssoLoginError.loader ? <LoadingSpinner /> : "Sign in"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-gray-600">
                <Link
                  href={`/auth/signin`}
                  rel="noopener noreferrer"
                  className="text-base-purple hover:text-base-purple-hover font-medium"
                >
                  Login without SSO
                </Link>
              </div>

              <TermsAndPrivacyLinks />
            </div>
          </div>
        </div>
        <LoginSidePanel />
      </div>
    </>
  );
}
