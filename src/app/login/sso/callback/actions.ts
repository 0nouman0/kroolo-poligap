"use server";
import { cookies } from "next/headers";

interface CognitoLoginResponse {
  AccessToken: string;
  RefreshToken: string;
  userData: Record<string, unknown>;
  success: true;
}

interface CognitoLoginError {
  error: string;
  success: false;
}

export const handleCognitoLogin = async (
  code: string
): Promise<CognitoLoginResponse | CognitoLoginError> => {
  console.log({ Lolz: "What's Up?" });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_REACT_APP_API_URL}/sso/callback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    }
  );

  if (!response.ok) {
    return { error: "", success: false };
  }

  const { data } = await response.json();
  const AccessToken = data?.userToken?.AccessToken;
  const cookieStore = await cookies();
  cookieStore.set("token", AccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return {
    AccessToken,
    RefreshToken: data?.userToken?.RefreshToken,
    userData: data?.userData,
    success: true,
  };
};
