import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
import { Header } from "@/components/header";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AppPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-0">{children}</main>
      </div>
    </div>
  );
}
