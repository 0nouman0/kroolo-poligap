"use client"

import type React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">{children}</div>
    </div>
  )
}
