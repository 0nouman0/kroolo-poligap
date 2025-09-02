"use client";

import type React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import SearchInput from "@/components/search/search-input";
import FeedbackModal from "@/components/search/feedback-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  LinkIcon,
  Info,
  Users,
  MessageSquare,
  CloudLightningIcon as LucideSearchIcon,
  Filter,
  Clock,
  User,
  FileType,
  Share2,
  Copy,
  MoreHorizontal,
  ChevronDown,
  ListFilter,
  TrendingUp,
  File,
  Flag,
  CloudLightningIcon,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  SuggestedItem,
  useSuggestedItems,
} from "@/lib/queries/useSuggestedItems";
import { useTrendingSearches } from "@/lib/queries/useTrendingSearches";
import { useSearch, type SearchResult } from "@/hooks/useSearch";
import { useUserStore } from "@/stores/user-store";
import { SearchItem } from "@/types/search.types";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserEnterpriseIntegration } from "@/app/api/enterpriseSearch/enterpriseSearch";
import { useCompanyStore } from "@/stores/company-store";
import { useIntegrationStore } from "@/stores/integration-store";
import { getSourceIcon } from "@/utils/search.util";
import { getIntegrationDisplayName } from "@/utils/integration.util";
import FlagModal from "@/components/search/flag-modal";
import { formatDate } from "@/utils/date.util";

// --- Helper functions (getItemIcon, getFilterIcon) remain the same ---
const getItemIcon = (type: SearchItem["type"], sizeClass = "w-5 h-5") => {
  switch (type) {
    case "file":
      return <FileText className={cn(sizeClass, "text-blue-500")} />;
    case "spreadsheet":
      return <FileSpreadsheet className={cn(sizeClass, "text-green-500")} />;
    case "presentation":
      return <Presentation className={cn(sizeClass, "text-orange-500")} />;
    case "document":
      return <FileText className={cn(sizeClass, "text-purple-500")} />;
    case "link":
      return <LinkIcon className={cn(sizeClass, "text-gray-500")} />;
    case "person":
      return <Users className={cn(sizeClass, "text-indigo-500")} />;
    case "message":
      return <MessageSquare className={cn(sizeClass, "text-purple-500")} />;
    case "query":
      return <LucideSearchIcon className={cn(sizeClass, "text-gray-500")} />;
    default:
      return <FileText className={cn(sizeClass, "text-gray-500")} />;
  }
};

// Function to convert file type to human-readable format
const getFileTypeDisplay = (type: string): string => {
  if (!type) return "Unknown";
  switch (type.toLowerCase()) {
    case "xlsx":
      return "Excel Sheet";
    case "docx":
      return "Word Document";
    case "pptx":
      return "PowerPoint Presentation";
    case "pdf":
      return "PDF Document";
    case "txt":
      return "Text File";
    case "csv":
      return "CSV File";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "webp":
    case "tiff":
    case "svg":
      return "Image";
    case "mp4":
      return "Video";
    case "mp3":
      return "Audio";
    default:
      return type.toUpperCase();
  }
};

// --- Search Landing Page Content (SearchLandingContent) remains the same as previous version ---
const SearchLandingContent: React.FC<{ onSearch: (query: string) => void }> = ({
  onSearch,
}) => {
  const [activeTab, setActiveTab] = useState("suggested");
  const { data: suggestedItems = [], isLoading: isSuggestedLoading } =
    useSuggestedItems();

  // Filter out suggested items with empty titles
  const filteredSuggestedItems = useMemo(() => {
    return suggestedItems.filter(
      (item) => item.title && item.title.trim() !== ""
    );
  }, [suggestedItems]);

  // const { data: recentSearches = [], isLoading: isRecentLoading } =
  //   useRecentSearches();

  const { data: trendingSearches = [], isLoading: isTrendingLoading } =
    useTrendingSearches();

  // Shuffle trending searches using Fisher-Yates algorithm and filter out empty titles
  const shuffledTrendingSearches = useMemo(() => {
    if (!trendingSearches.length) return [];

    // Filter out items with empty titles first
    const filteredTrendingSearches = trendingSearches.filter(
      (item) => item.title && item.title.trim() !== ""
    );

    if (!filteredTrendingSearches.length) return [];

    const shuffled = [...filteredTrendingSearches];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [trendingSearches]);

  const SuggestedListItem: React.FC<{
    item: SuggestedItem;
    onSelect: (query: string) => void;
  }> = ({ item, onSelect }) => (
    <div
      className="flex items-center py-3 px-2 hover:bg-muted dark:hover:bg-neutral-700 rounded-md cursor-pointer"
      onClick={() => onSelect(item.title)}
    >
      <div className="mr-3 shrink-0">
        {getSourceIcon(item.integration_type, 20)}
      </div>
      <div className="flex-grow overflow-hidden">
        <p className="text-13 font-medium truncate" title={item.title}>
          {item.title}
        </p>
      </div>
    </div>
  );

  // const RecentListItem: React.FC<{
  //   item: { query: string; link: string; searched_at: string };
  //   onSelect: (query: string) => void;
  // }> = ({ item, onSelect }) => (
  //   <div
  //     className="flex items-center py-2 px-2 hover:bg-muted dark:hover:bg-neutral-700 rounded-md cursor-pointer"
  //     onClick={() => onSelect(item.query)}
  //   >
  //     <div className="mr-3 shrink-0">{getItemIcon("document")}</div>
  //     <div className="flex-grow overflow-hidden">
  //       <p className="text-13 font-medium truncate" title={item.query}>
  //         {item.query}
  //       </p>
  //       <p className="text-xs text-muted-foreground truncate">
  //         {new Date(item.searched_at).toLocaleString("en-US", {
  //           year: "numeric",
  //           month: "short",
  //           day: "2-digit",
  //           hour: "2-digit",
  //           minute: "2-digit",
  //           hour12: true,
  //         })}
  //       </p>
  //     </div>
  //   </div>
  // );

  const { userData } = useUserStore();
  const userId = userData?.userId;
  const name = userData?.name;

  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const companyId = selectedCompany?.companyId;
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const setConnectedIntegrations = useIntegrationStore(
    (s) => s.setConnectedIntegrations
  );
  const connectedAccountIds = useIntegrationStore((s) => s.connectedAccountIds);
  async function fetchUserEnterpriseIntegration() {
    try {
      // Check if userId and companyId are available
      if (!userId || !companyId) {
        return;
      }

      const integrationDetails = await getUserEnterpriseIntegration(
        userId,
        companyId
      );
      console.log("integrationDetails ==> 🔥", integrationDetails);
      // Store connected integrations in the integration store
      if (integrationDetails.data && Array.isArray(integrationDetails.data)) {
        const connected = integrationDetails.data
          .filter(
            (item: any) =>
              item.isConnected === undefined &&
              item.accountId &&
              item.platformDetails?.name &&
              item.status === "ACTIVE"
          )
          .map((item: any) => ({
            account_id: item.accountId,
            name: item.platformDetails.name,
          }));

        console.log("connected ==> 🔥", connected);
        setConnectedIntegrations(connected);
      } else {
        setConnectedIntegrations([]);
      }
    } catch (error) {
      console.error("Error fetching user enterprise integration:", error);
      setConnectedIntegrations([]);
    }
  }

  useEffect(() => {
    // Only call the function if both userId and companyId are available
    if (userId && companyId) {
      fetchUserEnterpriseIntegration();
    }
  }, [userId, companyId]);

  return (
    <>
      <header
        className={`flex flex-col mb-8 ${!connectedAccountIds || connectedAccountIds.length === 0
            ? "mt-[20vh]"
            : ""
          }`}
      >
        <h2 className="text-sm mr-4 font-medium text-center mt-2">
          {(() => {
            const today = new Date();
            const options: Intl.DateTimeFormatOptions = {
              weekday: "long",
              month: "long",
              day: "numeric",
            };
            const formattedDate = today.toLocaleDateString("en-US", options);
            return formattedDate;
          })()}
        </h2>
        <div className="flex items-center w-full relative mt-3">
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-medium text-center">
              {(() => {
                const hour = new Date().getHours();
                let greeting = "Good morning";
                if (hour >= 12 && hour < 18) {
                  greeting = "Good afternoon";
                } else if (hour >= 18 || hour < 4) {
                  greeting = "Good evening";
                }
                return (
                  <>
                    {greeting}, {name}
                  </>
                );
              })()}
            </h1>
          </div>
          <Button
            variant="ghost"
            className="ml-auto text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-500 absolute right-0 hidden md:flex"
            onClick={() => setIsFeedbackModalOpen(true)}
          >
            <Share2 className="w-4 h-4 mr-2" /> Share feedback
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <SearchInput onSearch={onSearch} showChatToggle={false} />{" "}
        {/* showChatToggle is false now */}
        {/* Informative message if no integrations are connected */}
        {(!connectedAccountIds || connectedAccountIds.length === 0) && (
          <div className="mt-8 flex flex-col items-center justify-center text-center bg-muted/60 dark:bg-neutral-800 rounded-lg p-6 border border-muted-foreground/10 max-w-xl mx-auto">
            <Search className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold mb-1">
              Try searching for company knowledge
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Connect a source to power results — but here are some ideas to get started:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>“OKR meeting notes Q3”</li>
              <li> “Dropbox onboarding checklist”</li>
              <li> “Slack message from @alex about launch”</li>
              <li> “Confluence page: Competitive analysis”</li>
            </ul>
          </div>
        )}
        {connectedAccountIds && connectedAccountIds.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 !text-[13px]">
            <div className="md:col-span-2">
              <Card className="p-4">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">
                      Suggested
                    </CardTitle>
                    {/* <TabsList className="flex gap-2">
                      <TabsTrigger
                        value="recent"
                        className="text-sm text-black border-t-2 border-transparent"
                      >
                        Recent
                      </TabsTrigger>
                      <TabsTrigger
                        value="suggested"
                        className="text-sm text-black border-t-2 border-transparent"
                      >
                        Suggested
                      </TabsTrigger>
                    </TabsList> */}
                    {/* <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                    >
                      <FileText className="w-4 h-4 mr-1 md:mr-2" /> All sources
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button> */}
                  </div>
                  <ScrollArea className="pr-3">
                    <TabsContent value="suggested">
                      {isSuggestedLoading ? (
                        <div className="space-y-3">
                          {[...Array(5)].map((_, index) => (
                            <div
                              key={index}
                              className="flex items-center py-3 px-2"
                            >
                              <Skeleton className="w-5 h-5 mr-3 rounded" />
                              <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : filteredSuggestedItems.length > 0 ? (
                        filteredSuggestedItems.map((item, index) => (
                          <SuggestedListItem
                            key={index}
                            item={item}
                            onSelect={onSearch}
                          />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <FileText className="w-12 h-12 text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground mb-1">
                            No suggested items
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Start searching to see suggestions
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    {/* <TabsContent value="recent">
                      {isRecentLoading ? (
                        <div className="flex justify-center items-center gap-2 py-4">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-gray-500" />
                          <span className="text-sm text-muted-foreground">
                            Loading Recent Items...
                          </span>
                        </div>
                      ) : (
                        recentSearches.map((item, index) => (
                          <RecentListItem
                            key={item.searched_at}
                            item={item}
                            onSelect={onSearch}
                          />
                        ))
                      )}
                    </TabsContent> */}
                  </ScrollArea>
                </Tabs>
                {/* <Button
                  variant="link"
                  className="text-13 text-purple-600 dark:text-purple-400 cursor-pointer"
                >
                  See more
                </Button> */}
              </Card>
            </div>

            <div className="md:col-span-1">
              <Card className="py-3">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between w-full">
                    <span>Trending</span>
                    <TrendingUp />
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 px-3">
                  <div className="mt-0 flex flex-col justify-center">
                    <ScrollArea className="pr-2">
                      {isTrendingLoading ? (
                        <div className="space-y-3">
                          {[...Array(4)].map((_, index) => (
                            <div
                              key={index}
                              className="flex items-start py-2.5 px-1"
                            >
                              <Skeleton className="w-8 h-8 mr-2 rounded" />
                              <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                              </div>
                              <Skeleton className="w-6 h-4 ml-2" />
                            </div>
                          ))}
                        </div>
                      ) : shuffledTrendingSearches.length > 0 ? (
                        shuffledTrendingSearches.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center py-2.5 px-1 hover:bg-muted dark:hover:bg-neutral-700 rounded-md cursor-pointer"
                            onClick={() => {
                              // if (item.url) {
                              //   window.open(item.url, "_blank");
                              // } else {
                              onSearch(item.title);
                              // }
                            }}
                          >
                            <div className="flex items-center flex-grow">
                              <div className="mr-2 shrink-0 flex items-center justify-center">
                                {getSourceIcon(item.integration_type, 20)}
                              </div>
                              <div className="flex-grow flex items-center">
                                <p
                                  className="text-13 font-medium"
                                  title={item.title}
                                >
                                  {item.title}
                                </p>
                              </div>
                            </div>
                            {item.trending_context.search_count !==
                              undefined && (
                                <span className="mr-2 text-xs text-muted-foreground flex items-center">
                                  {item.trending_context.search_count}
                                </span>
                              )}
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <TrendingUp className="w-12 h-12 text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground mb-1">
                            No trending items
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Popular searches will appear here
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                    {/* <Button
                      variant="link"
                      className="mt-2 mx-auto text-13 text-purple-600 dark:text-purple-400 cursor-pointer"
                    >
                      See more
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      {/* <footer className="fixed bottom-4 right-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 shadow-lg bg-card text-card-foreground"
        >
          <Info className="w-6 h-6" />
        </Button>
      </footer> */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onOpenChange={setIsFeedbackModalOpen}
      />
    </>
  );
};

// --- Search Results Page Content ---
const SearchResultsContent: React.FC<{
  initialQuery: string;
  onNewSearch: (query: string) => void;
}> = ({ initialQuery, onNewSearch }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  // Add state for author and updated filters
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedUpdated, setSelectedUpdated] = useState<string>("Anytime");
  const [flagModalData, setFlagModalData] = useState<{
    open: boolean;
    item?: SearchResult;
  }>({ open: false });

  // Use the real search hook with debouncing 300
  const { data: searchData, isLoading, error } = useSearch(searchQuery);

  console.log("searchData ===>", searchData);

  // Update search query when initialQuery changes
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    onNewSearch(newQuery);
  };

  // If searchData is an array, use it directly
  const allResults = Array.isArray(searchData) ? searchData : [];
  // Get unique authors from results
  const allAuthors = Array.from(
    new Set(allResults.map((item) => item.author_email).filter(Boolean))
  );

  // Filtering logic for all filters
  const filteredResults = allResults.filter((item) => {
    if (selectedSource && item.integration_type !== selectedSource)
      return false;
    if (selectedAuthor && item.author_email !== selectedAuthor) return false;
    if (selectedUpdated !== "Anytime" && item.updated_at) {
      const updatedDate = new Date(item.updated_at);
      const now = new Date();
      if (
        selectedUpdated === "Past 24 hours" &&
        now.getTime() - updatedDate.getTime() > 24 * 60 * 60 * 1000
      ) {
        return false;
      }
      if (
        selectedUpdated === "Past week" &&
        now.getTime() - updatedDate.getTime() > 7 * 24 * 60 * 60 * 1000
      ) {
        return false;
      }
    }
    return true;
  });

  const SearchResultItem: React.FC<{ item: SearchResult }> = ({ item }) => (
    <Card className="py-0 mb-4 overflow-hidden group">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="pt-1 shrink-0">
            {getSourceIcon(item.integration_type, 32)}
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-1">
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-medium text-blue-600 hover:underline dark:text-blue-400 pr-2 flex-grow"
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: item.title.replace(
                      /\*\*(.*?)\*\*/g,
                      "<strong>$1</strong>"
                    ),
                  }}
                />
              </a>
              <div className="flex items-center space-x-1 shrink-0">
                {/* <Button
                  variant="ghost"
                  size="sm"
                  className="inline-flex items-center gap-1 text-muted-foreground border-1 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity px-2 cursor-pointer"
                >
                  <Image
                    src="/assets/icons/ChatWithProjectAI.svg"
                    width={15}
                    height={15}
                    alt="search"
                    className="inline-block"
                  />
                  Summarize
                </Button> */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground w-8 h-8"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(item.file_url);
                        // Optionally, show a toast here
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFlagModalData({
                          open: true,
                          item: item,
                        })
                      }
                    >
                      <Flag className="w-4 h-4 mr-2" /> Flag
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem>
                      <Bookmark className="w-4 h-4 mr-2" /> Pin to top
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="w-4 h-4 mr-2" /> Add to collection
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <MessageCircle className="w-4 h-4 mr-2" /> Create answer
                    </DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {item.integration_type && (
              <p className="text-xs text-muted-foreground flex flex-row items-center gap-1">
                {getIntegrationDisplayName(item.integration_type)}
                {getSourceIcon(item.integration_type)}
                {/* {item.type && <span>• {getFileTypeDisplay(item.type)}</span>} */}
                {item.updated_at && (
                  <>
                    • Updated{" "}
                    {formatDate(item.updated_at, {
                      showTime: true,
                    })}
                  </>
                )}
              </p>
            )}
            {item.author_email && (
              <p className="text-xs text-muted-foreground">
                Author: {item.author_email}
              </p>
            )}
            {item.content_preview && (
              <p
                className="text-sm mt-1 text-neutral-700 dark:text-neutral-300"
                dangerouslySetInnerHTML={{
                  __html: item.content_preview.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                  ),
                }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b dark:border-neutral-800">
        <div className="container mx-auto px-4 py-3">
          <SearchInput
            initialQuery={initialQuery}
            onSearch={handleSearchChange}
            showChatToggle={false}
          // enableLiveSearch={true} // Removed to only search on Enter
          />
        </div>
        <div className="container mx-auto px-4 py-3 border-t dark:border-neutral-800 flex flex-wrap items-center gap-2">
          {/* Updated Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "bg-card text-card-foreground",
                  selectedUpdated !== "Anytime" && "border-primary bg-primary/5"
                )}
              >
                <Clock className="w-4 h-4 mr-2" />
                {selectedUpdated === "Anytime"
                  ? "Updated"
                  : selectedUpdated}{" "}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedUpdated("Anytime")}>
                Anytime
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedUpdated("Past 24 hours")}
              >
                Past 24 hours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedUpdated("Past week")}>
                Past week
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* From Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "bg-card text-card-foreground",
                  selectedAuthor && "border-primary bg-primary/5"
                )}
              >
                <User className="w-4 h-4 mr-2" />
                {selectedAuthor ? `From ${selectedAuthor}` : "From"}{" "}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedAuthor(null)}>
                Anyone
              </DropdownMenuItem>
              {allAuthors.map((author) => (
                <DropdownMenuItem
                  key={author}
                  onClick={() => setSelectedAuthor(author)}
                >
                  {author}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-card text-card-foreground"
              >
                <Filter className="w-4 h-4 mr-2" /> All filters{" "}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Option 1</DropdownMenuItem>
              <DropdownMenuItem>Option 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-card text-card-foreground"
              >
                <FileType className="w-4 h-4 mr-2" /> Type{" "}
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Any type</DropdownMenuItem>
              <DropdownMenuItem>Documents</DropdownMenuItem>
              <DropdownMenuItem>Spreadsheets</DropdownMenuItem>
              <DropdownMenuItem>Presentations</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <div className="md:col-span-3">
              {[...Array(4)].map((_, idx) => (
                <Card key={idx} className="py-0 mb-4 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="pt-1 shrink-0">
                        <Skeleton className="w-8 h-8 rounded-full" />
                      </div>
                      <div className="flex-grow w-full">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-1" />
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-5/6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <aside className="md:col-span-1 md:sticky md:top-[140px]">
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    {[...Array(4)].map((_, idx) => (
                      <Skeleton key={idx} className="h-8 w-full mb-2" />
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </aside>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading search results</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Found {filteredResults?.length || 0} results for{" "}
              <span className="font-semibold text-foreground">
                {searchQuery}
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="md:col-span-3">
                {filteredResults && filteredResults.length > 0 ? (
                  filteredResults.map((item) => (
                    <SearchResultItem key={item.id} item={item} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No results found for &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}
              </div>
              <aside className="md:col-span-1 md:sticky md:top-[140px]">
                <Card className="py-0">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold">Filters</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground w-8 h-8"
                      >
                        <ListFilter className="w-4 h-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      {/* All results filter */}
                      <Button
                        variant={
                          selectedSource === null ? "secondary" : "ghost"
                        }
                        className="w-full flex items-center justify-between mb-1 text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer"
                        onClick={() => setSelectedSource(null)}
                      >
                        <span className="flex items-center gap-2">
                          <Filter className="w-4 h-4 mr-2" />
                          <span>All</span>
                        </span>
                        <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded-sm">
                          {allResults.length}
                        </span>
                      </Button>

                      {/* Dynamic filters based on integration_type in results */}
                      {(() => {
                        const integrationCounts: Record<string, number> = {};
                        allResults.forEach((item: any) => {
                          if (item.integration_type) {
                            integrationCounts[item.integration_type] =
                              (integrationCounts[item.integration_type] || 0) +
                              1;
                          }
                        });
                        return Object.entries(integrationCounts).map(
                          ([source, count]) => (
                            <Button
                              key={source}
                              variant={
                                selectedSource === source
                                  ? "secondary"
                                  : "ghost"
                              }
                              className="w-full flex items-center justify-between mb-1 text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer"
                              onClick={() => setSelectedSource(source)}
                            >
                              <span className="flex items-center gap-2">
                                {getSourceIcon(source, 20)}
                                <span>{getIntegrationDisplayName(source)}</span>
                              </span>
                              <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded-sm">
                                {count}
                              </span>
                            </Button>
                          )
                        );
                      })()}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </>
        )}
      </main>
      {flagModalData.open && flagModalData.item && (
        <FlagModal
          open={flagModalData.open}
          onClose={() => setFlagModalData({ open: false })}
          item={flagModalData.item}
        />
      )}
    </>
  );
};

// --- Main Page Component (CombinedSearchPage) remains the same ---
function CombinedSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [currentQuery, setCurrentQuery] = useState(query || "");

  useEffect(() => {
    setCurrentQuery(query || "");
  }, [query]);

  const handleSearchNavigation = (newQuery: string) => {
    if (newQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(newQuery.trim())}`);
    } else {
      router.push(`/search`); // Go to landing if query is cleared
    }
  };

  if (currentQuery) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SearchResultsContent
          initialQuery={currentQuery}
          onNewSearch={handleSearchNavigation}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <SearchLandingContent onSearch={handleSearchNavigation} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <CombinedSearchPage />
    </Suspense>
  );
}
