"use client";

import React, { useEffect } from "react";
import { useAuthInfo } from "@propelauth/react";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import useAuthenticationStore from "@/stores/authentication";
import { handleCognitoLogin } from "./actions";

interface loginMethod {
  login_method: string;
}
interface DecodedToken {
  login_method?: loginMethod;
}

export default function SsoCallbackPage() {
  const authInfo = useAuthInfo();
  const router = useRouter();

  useEffect(() => {
    if (authInfo?.loading) return;
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    // console.log("AUthInfo>>>>>>>>>>>>", authInfo);
    // console.log("code>>>>>>>>>", code);

    if (code) {
      // 👉 User is coming back from Cognito with ?code
      const callBackendCallback = async () => {
        try {
          const response = await handleCognitoLogin(code);

          if (response.success) {
            const { AccessToken, RefreshToken, userData } = response;

            useAuthenticationStore.setState((state) => ({
              ...state,
              user: userData?.userId,
              accessToken: AccessToken,
              refreshToken: RefreshToken,
            }));

            localStorage.setItem("accessToken", AccessToken);
            localStorage.setItem("__LOGIN_SESSION__", AccessToken);
            localStorage.setItem("refreshToken", RefreshToken);
            localStorage.setItem("user_id", `${userData?.userId}`);

            router.push("/org-list");
          } else {
            console.error("Failed to complete SSO callback");
            router.push("/auth/signin");
          }
        } catch (error) {
          console.error("Error:", error);
          router.push("/auth/signin");
        }
      };

      callBackendCallback();
    } else if (authInfo?.accessToken) {
      const decoded: DecodedToken = jwtDecode(authInfo.accessToken);

      if (decoded?.login_method?.login_method === "saml_sso") {
        const url = new URL(
          `https://${process.env.NEXT_PUBLIC_AWS_COGNITO_DOMAIN}/oauth2/authorize`
        );

        url.searchParams.set(
          "client_id",
          process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_WEB_CLIENT_ID ?? ""
        );
        url.searchParams.set("response_type", "code");
        url.searchParams.set(
          "scope",
          "email openid profile aws.cognito.signin.user.admin"
        );
        url.searchParams.set("identity_provider", "PropelAuth");
        url.searchParams.set("state", "1234567890");
        url.searchParams.set(
          "redirect_uri",
          `${window.location.origin}/login/sso/callback`
        );

        window.location.href = url.toString();
      } else {
        // If login method is unexpected, redirect to dashboard or show error
        router.push("/auth/signin");
      }
    }
  }, [authInfo, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Processing SSO login...</p>
    </div>
  );
}
