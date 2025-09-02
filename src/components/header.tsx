"use client";
import { PiMoonStars, PiSun } from "react-icons/pi";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/user-store";
import { useAuthStore } from "@/stores/auth-store";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LogOut, User, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useCompanyStore } from "@/stores/company-store";
import { useUserProfileDetails } from "@/lib/queries/useUserProfileDetails";
import { getInitials } from "@/utils/user.util";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [storedId, setStoredId] = useState<string | null>(null);
  const { setUserData, clearUserData } = useUserStore();
  const { logout: authLogout } = useAuthStore();
  const { setCompanies, setSelectedCompany } = useCompanyStore();
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);

  // Get user data from user store
  const { userData } = useUserStore();
  const profilePictureUrl = userData?.profileImage;

  useEffect(() => {
    setMounted(true);
    // Access localStorage only on client side
    setStoredId(localStorage.getItem("user_id"));
  }, []);

  useEffect(() => {}, []);

  const { data } = useUserProfileDetails(
    storedId || "",
    selectedCompany?.companyId || ""
  );

  useEffect(() => {
    if (data?.data && storedId) {
      // Ensure userId is always a string before setting userData
      const fixedData = {
        ...data.data,
        userId:
          typeof data.data.userId === "string"
            ? data.data.userId
            : data.data.userId?.toString?.() ?? "",
        banner: {
          ...data.data.banner,
          image: data.data.banner?.image ?? "",
        },
        memberStatus: Array.isArray(data.data.memberStatus)
          ? data.data.memberStatus[0] ?? ""
          : data.data.memberStatus ?? "",
        // Ensure createdAt and updatedAt are strings
        createdAt:
          typeof data.data.createdAt === "string"
            ? data.data.createdAt
            : data.data.createdAt?.toISOString?.() ?? "",
        updatedAt:
          typeof data.data.updatedAt === "string"
            ? data.data.updatedAt
            : data.data.updatedAt?.toISOString?.() ?? "",
      };
      setUserData(fixedData);
    }
  }, [data, setUserData, storedId]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    // Call API to clear the cookie
    await fetch("/api/users/signout", { method: "POST" });

    // Clear all stores
    clearUserData();
    authLogout();
    setCompanies([]);
    setSelectedCompany({ companyId: "", name: "", role: "" });

    // Clear localStorage items
    localStorage.removeItem("user_id");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("__LOGIN_SESSION__");

    // Redirect to signin page
    redirect("/auth/signin");
  };

  const headerImageSrc = mounted
    ? resolvedTheme === "light"
      ? "/assets/icons/kroolo-dark-logo.svg"
      : "/assets/icons/kroolo-light-logo.svg"
    : "/assets/icons/kroolo-dark-logo.svg"; // or fallback to a neutral logo or loading placeholder

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-[60px] max-w-screen items-center justify-between px-6">
        {/* Logo Section */}
        <div className="flex items-center">
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-bold text-foreground leading-tight">Poligap</h1>
            <span className="text-xs text-muted-foreground leading-tight">Powered by Kroolo</span>
          </div>
        </div>

        {/* Right Section - Theme Switcher and Profile */}
        <div className="flex items-center space-x-3">
          {/* Companies Drop Down */}
          <CompanyDropdown />
          {/* Theme Switcher */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            onClick={toggleTheme}
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <PiMoonStars className="h-4 w-4" />
              ) : (
                <PiSun className="h-4 w-4" />
              )
            ) : (
              <PiSun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Profile Picture */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-7 w-5 rounded-full cursor-pointer"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={profilePictureUrl} alt="Profile" />
                  <AvatarFallback>
                    {getInitials(userData?.name) || ""}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-80 popover-shadow text-13"
              align="end"
              forceMount
            >
              {/* User Info */}
              <div className="flex flex-col items-start px-4 py-3">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profilePictureUrl} alt="Profile" />
                    <AvatarFallback>
                      {getInitials(userData?.name) || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-base">
                      {userData?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userData?.email}
                    </div>
                  </div>
                </div>
                {/* Status */}
                {/* <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-xs">
                    <span className="h-2 w-2 rounded-full bg-yellow-400 inline-block" />
                    Here Only
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 px-2 py-0 text-xs"
                    onClick={() => alert("Set a status handler not provided")}
                  >
                    Set a status
                  </Button>
                </div> */}

                {/* Local Time */}
                {/* <div className="flex items-center gap-2 text-13 text-muted-foreground mt-1"></div> */}
                {/* Account & Plan */}
                {/* <div className="mt-2 text-xs w-full">
                  <div className="bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded mt-1">
                    <span className="font-medium">Current Plan:</span>{" "}
                    {userData?.plan || "Business"}
                  </div>
                </div> */}
              </div>

              {/* Full width separator */}
              <div className="w-full h-px bg-gray-200" />

              {/* Menu Options */}

              <DropdownMenuItem className="text-gray-500 pointer-events-none select-none px-0 rounded-none">
                <div className="px-4 w-full flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date()
                    .toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .replace(/\s?(am|pm)$/i, (match) => match.toUpperCase())}
                  &nbsp;local time
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem className="pointer-events-none select-none px-0 rounded-none">
                {selectedCompany?.name && (
                  <div className="px-4 w-full">
                    <span className="font-medium">Account:</span>{" "}
                    {selectedCompany.name}
                  </div>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer px-0 rounded-none hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-900"
                onClick={() => redirect("/profile")}
              >
                <div className="px-4 w-full flex items-center">
                  <User className="mr-2 h-4 w-4" /> My Profile
                </div>
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => alert("Change password handler not provided")}
              >
                <Lock className="mr-2 h-4 w-4" /> Change Password
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => alert("Switch account handler not provided")}
              >
                <Repeat className="mr-2 h-4 w-4" /> Switch Account
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => alert("Settings handler not provided")}
              >
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer px-0 rounded-none hover:bg-gray-50 focus:bg-gray-50 focus:text-gray-900"
                onClick={handleSignOut}
              >
                <div className="px-4 w-full flex items-center">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// CompanyDropdown component
function CompanyDropdown() {
  const companies = useCompanyStore((s) => s.companies);
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const setSelectedCompany = useCompanyStore((s) => s.setSelectedCompany);
  const [isOpen, setIsOpen] = useState(false);

  if (!companies.length) return null;

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="px-3 py-1 h-[26px] rounded border bg-filter-menu dark:hover:bg-accent flex items-center gap-2 border-gray-200 dark:border-gray-600 cursor-pointer">
          <div className="flex flex-col items-start">
            <span className="text-13 font-medium text-gray-900 dark:text-gray-100">
              {selectedCompany ? selectedCompany.name : "Select Company"}
            </span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[200px] p-0 popover-shadow bg-white dark:bg-background border border-gray-200 dark:border-gray-600"
      >
        {/* Header */}
        <div className="pl-2 pr-4 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
          Switch account
        </div>

        {/* Company List */}
        <div className="py-1">
          {companies.map((company) => (
            <DropdownMenuItem
              key={company.companyId}
              onClick={() => setSelectedCompany(company)}
              className="px-0 py-2 text-13 hover:bg-[var(--url-color)] focus:bg-gray-50 dark:focus:bg-accent focus:text-gray-900 dark:focus:text-gray-100 cursor-pointer flex items-center rounded-none justify-between w-full"
            >
              <div className="px-4 w-full flex items-center justify-between">
                <span
                  className={`text-gray-900 dark:text-gray-100 ${
                    selectedCompany &&
                    selectedCompany.companyId === company.companyId
                      ? "font-medium"
                      : ""
                  }`}
                >
                  {company.name}
                </span>
                {selectedCompany &&
                  selectedCompany.companyId === company.companyId && (
                    <svg
                      className="w-4 h-4 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
