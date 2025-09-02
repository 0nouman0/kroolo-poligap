"use client";

import type React from "react";
import { SessionProvider } from "next-auth/react";

// Mock session for development
const mockSession = {
  user: {
    id: "dev-user-123",
    name: "Test User",
    email: "test@test.com",
    role: "admin",
  },
  expires: "2025-12-31",
};

interface DevSessionProviderProps {
  children: React.ReactNode;
}

export function DevSessionProvider({ children }: DevSessionProviderProps) {
  if (process.env.NODE_ENV === "development") {
    // In development, provide a mock session
    return <SessionProvider session={mockSession}>{children}</SessionProvider>;
  }

  // In production, use normal SessionProvider
  return <SessionProvider>{children}</SessionProvider>;
}
