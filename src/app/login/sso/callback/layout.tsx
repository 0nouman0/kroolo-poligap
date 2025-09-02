"use client";

import type React from "react";
import { AuthProvider } from "@propelauth/react";

export default function SSO2Auth({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL!}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
