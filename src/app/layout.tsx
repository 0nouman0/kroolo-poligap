import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast-provider";
import { Metadata } from "next";
import React from "react";
import { QueryProvider } from "@/components/QueryProvider";

const Inter = localFont({
  src: [
    {
      path: "../fonts/Inter_28pt-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/Inter_28pt-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/Inter_28pt-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Inter_28pt-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Inter_28pt-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Inter_28pt-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/Inter_28pt-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/Inter_28pt-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/Inter_28pt-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Kroolo | Enterprise Search",
  description: "Kroolo Enterprise Search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={Inter.variable}>
      <head>
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/x-icon"
          sizes="32x32"
        />
      </head>
      <body className={`${Inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
