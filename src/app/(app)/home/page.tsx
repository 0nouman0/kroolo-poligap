"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Search as SearchIcon } from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { useCompanyStore } from "@/stores/company-store";
import { useIntegrationStore } from "@/stores/integration-store";
import { useSuggestedItems, SuggestedItem } from "@/lib/queries/useSuggestedItems";
import { useTrendingSearches } from "@/lib/queries/useTrendingSearches";
import { useLatestDocuments } from "@/lib/queries/useLatestDocuments";
import { getSourceIcon } from "@/utils/search.util";

export default function HomeFeedPage() {
  const { userData } = useUserStore();
  const name = userData?.name;
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const connectedAccountIds = useIntegrationStore((s) => s.connectedAccountIds);

  const { data: suggestedItems = [], isLoading: isSuggestedLoading } = useSuggestedItems();
  const { data: trendingSearches = [], isLoading: isTrendingLoading } = useTrendingSearches();
  const { data: latestDocs = [], isLoading: isLatestLoading } = useLatestDocuments(10);

  const filteredSuggestedItems = useMemo(
    () => suggestedItems.filter((i) => i.title && i.title.trim() !== ""),
    [suggestedItems]
  );

  const shuffledTrending = useMemo(() => {
    const filtered = (trendingSearches || []).filter((i: any) => i.title && i.title.trim() !== "");
    const arr = [...filtered];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [trendingSearches]);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <header className={`flex flex-col mb-8 ${!connectedAccountIds || connectedAccountIds.length === 0 ? "mt-[12vh]" : ""}`}>
        <h2 className="text-sm mr-4 font-medium text-center mt-2">
          {(() => {
            const today = new Date();
            const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" };
            return today.toLocaleDateString("en-US", options);
          })()}
        </h2>
        <div className="flex items-center w-full relative mt-3">
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-medium text-center">
              {(() => {
                const hour = new Date().getHours();
                let greeting = "Good morning";
                if (hour >= 12 && hour < 18) greeting = "Good afternoon";
                else if (hour >= 18 || hour < 4) greeting = "Good evening";
                return (
                  <>
                    {greeting}{name ? `, ${name}` : ""}
                  </>
                );
              })()}
            </h1>
          </div>
        </div>
      </header>

      {(!connectedAccountIds || connectedAccountIds.length === 0) && (
        <div className="mt-8 flex flex-col items-center justify-center text-center bg-muted/60 dark:bg-neutral-800 rounded-lg p-6 border border-muted-foreground/10 max-w-xl mx-auto">
          <SearchIcon className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Connect a source to personalize your feed</h3>
          <p className="text-sm text-muted-foreground">
            Once your accounts are connected, you'll see suggested documents and trending items here for {selectedCompany?.name || "your org"}.
          </p>
        </div>
      )}

      <main className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-[13px]">
        <div className="md:col-span-2 space-y-6">
          {/* Latest Articles */}
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Latest articles</CardTitle>
            </div>
            <ScrollArea className="pr-3 max-h-[40vh]">
              {isLatestLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center py-3 px-2">
                      <Skeleton className="w-5 h-5 mr-3 rounded" />
                      <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : latestDocs.length > 0 ? (
                latestDocs.map((item, idx: number) => (
                  <div key={item.id ?? idx} className="flex items-center py-3 px-2 hover:bg-muted dark:hover:bg-neutral-700 rounded-md cursor-default">
                    <div className="mr-3 shrink-0">{getSourceIcon(item.integration_type ?? "", 20)}</div>
                    <div className="flex-grow overflow-hidden">
                      <p className="text-13 font-medium truncate" title={item.title}>
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-1">No latest articles found</p>
                  <p className="text-xs text-muted-foreground">Kroolo API returned no data. Configure Gemini to enable fallback content.</p>
                </div>
              )}
            </ScrollArea>
          </Card>

          {/* Suggested */}
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Suggested</CardTitle>
            </div>
            <ScrollArea className="pr-3 max-h-[60vh]">
              {isSuggestedLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center py-3 px-2">
                      <Skeleton className="w-5 h-5 mr-3 rounded" />
                      <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSuggestedItems.length > 0 ? (
                filteredSuggestedItems.map((item: SuggestedItem, idx: number) => (
                  <div key={idx} className="flex items-center py-3 px-2 hover:bg-muted dark:hover:bg-neutral-700 rounded-md cursor-default">
                    <div className="mr-3 shrink-0">{getSourceIcon(item.integration_type, 20)}</div>
                    <div className="flex-grow overflow-hidden">
                      <p className="text-13 font-medium truncate" title={item.title}>
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-1">No suggestions yet</p>
                  <p className="text-xs text-muted-foreground">Your personalized suggestions will appear here.</p>
                </div>
              )}
            </ScrollArea>
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
                <ScrollArea className="pr-2 max-h-[60vh]">
                  {isTrendingLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start py-2.5 px-1">
                          <Skeleton className="w-8 h-8 mr-2 rounded" />
                          <div className="flex-grow space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="w-6 h-4 ml-2" />
                        </div>
                      ))}
                    </div>
                  ) : shuffledTrending.length > 0 ? (
                    shuffledTrending.map((item: any) => (
                      <div key={item.id} className="flex items-center py-2.5 px-1 hover:bg-muted dark:hover:bg-neutral-700 rounded-md cursor-default">
                        <div className="flex items-center flex-grow">
                          <div className="mr-2 shrink-0 flex items-center justify-center">
                            {getSourceIcon(item.integration_type, 20)}
                          </div>
                          <div className="flex-grow flex items-center">
                            <p className="text-13 font-medium" title={item.title}>
                              {item.title}
                            </p>
                          </div>
                        </div>
                        {item.trending_context?.search_count !== undefined && (
                          <span className="mr-2 text-xs text-muted-foreground flex items-center">
                            {item.trending_context.search_count}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <TrendingUp className="w-12 h-12 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">No trending items</p>
                      <p className="text-xs text-muted-foreground">Popular searches will appear here.</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
