"use client";

import * as React from "react";
import {
  ChevronLeft,
  CheckSquare,
  MessageCircle,
  Shield,
  FileText,
  Bot,
  Settings,
  Home,
  Upload,
  History,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Link from "next/link";
import { usePathname } from "next/navigation";
// import useGlobalChatStore from "@/app/(app)/chat/store/global-chat-store";
import { useCompanyStore } from "@/stores/company-store";

// Define page types for type safety
type PageType =
  | "dashboard"
  | "my-tasks"
  | "chat"
  | "compliance-check"
  | "contract-review"
  | "ai-agents"
  | "rulebase"
  | "upload-assets"
  | "history"
  | "settings";

const navigationItems = [
  {
    title: "My Tasks",
    icon: CheckSquare,
    page: "/my-tasks" as PageType,
  },
  {
    title: "Chat",
    icon: MessageCircle,
    page: "/chat" as PageType,
  },
  {
    title: "Compliance Check",
    icon: Shield,
    page: "/compliance-check" as PageType,
  },
  {
    title: "Contract Review",
    icon: FileText,
    page: "/contract-review" as PageType,
  },
  {
    title: "AI Agents",
    icon: Bot,
    page: "/ai-agents" as PageType,
  },
  {
    title: "RuleBase",
    icon: NotebookPen,
    page: "/rulebase" as PageType,
  },
  {
    title: "Upload Assets",
    icon: Upload,
    page: "/upload-assets" as PageType,
  },
  {
    title: "History",
    icon: History,
    page: "/history" as PageType,
  },
];

const bottomNavigationItems = [
  {
    title: "Settings",
    icon: Settings,
    page: "/settings" as PageType,
  },
];

// Main component that renders the appropriate page based on the active page state
export function AppSidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const pathname = usePathname();
  const currentPage = pathname ? `/${pathname.split("/")[1]}` : "/";

  // Get selected company role from the store
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const userRole = selectedCompany ? selectedCompany.role : "User";

  console.log("userRole =>", userRole);

  // Show all navigation items for Poligap interface
  const visibleNavigationItems = navigationItems;

  // Show all bottom navigation items for Poligap interface
  const visibleBottomNavigationItems = bottomNavigationItems;

  // console.log("visibleBottomNavigationItems =>", visibleBottomNavigationItems);

  // const setMessages = useGlobalChatStore((state) => state.setMessages);

  const MenuItemWithTooltip = ({
    title,
    href,
    icon: Icon,
    isActive,
  }: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
  }) => {
    const buttonContent = (
      <div
        className={`text-card-foreground hover:bg-filter-menu hover:text-accent-foreground ${
          isActive
            ? "bg-filter-menu text-accent-foreground"
            : ""
        } cursor-pointer flex items-center gap-1.5 px-3 py-1.5 w-full rounded-md transition-colors`}
      >
        <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`font-medium text-13 transition-opacity duration-300 ${
            sidebarCollapsed
              ? "opacity-0 w-0 overflow-hidden"
              : "opacity-100"
          }`}
        >
          {title}
        </span>
      </div>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={href} className="block">
              {buttonContent}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" className="font-normal">
            {title}
          </TooltipContent>
        </Tooltip>
      );
    }
    
    return (
      <Link href={href} className="block">
        {buttonContent}
      </Link>
    );
  };

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden">
      <TooltipProvider delayDuration={300}>
        <SidebarProvider>
          {/* Sidebar */}
          <div
            className={`border-r border-border ${
              sidebarCollapsed ? "w-[60px]" : "w-[240px]"
            } transition-all duration-300 flex flex-col h-[calc(100vh-60px)] overflow-hidden relative group`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Collapse Button - Always takes up space but only visible on hover */}
            <div className="flex justify-end p-2 h-10">
              {" "}
              {/* Fixed height to prevent layout shift */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={`h-6 w-6 absolute top-0 right-0 cursor-pointer hover:bg-filter-menu rounded-bl-md rounded-tr-none rounded-tl-none rounded-br-none transition-opacity duration-200 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <ChevronLeft
                      className={`h-4 w-4 transition-transform ${
                        sidebarCollapsed ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="start"
                  className="font-normal"
                >
                  {sidebarCollapsed ? "Expand" : "Collapse"}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* New Chat Button */}
            {/* <div className="px-2">
              <MenuItemWithTooltip title="New Chat">
                <Button
                  className={`bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer flex items-center justify-center px-3 py-2 w-full ${
                    !sidebarCollapsed ? "gap-3" : ""
                  }`}
                  onClick={() => {
                    useGlobalChatStore.setState({
                      selectedConversation: {
                        _id: "",
                        chatName: "",
                        createdAt: new Date().toISOString(),
                      },
                      messages: [],
                    });
                  }}
                >
                  <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                    <Plus className="h-4 w-4" />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="text-13 transition-opacity duration-300">
                      <Link href={"/chat"}>New Chat</Link>
                    </span>
                  )}
                </Button>
              </MenuItemWithTooltip>
            </div> */}

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-3">
              <div className="px-2 space-y-0.5">
                {visibleNavigationItems.map((item) => (
                  <MenuItemWithTooltip
                    key={item.title}
                    title={item.title}
                    href={item.page}
                    icon={item.icon}
                    isActive={currentPage === item.page}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Navigation Items */}
            <div className="mt-auto py-3 border-t border-border">
              <div className="px-2 space-y-0.5">
                {visibleBottomNavigationItems.map((item) => (
                  <MenuItemWithTooltip
                    key={item.title}
                    title={item.title}
                    href={item.page}
                    icon={item.icon}
                    isActive={currentPage === item.page}
                  />
                ))}
              </div>
            </div>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  );
}
