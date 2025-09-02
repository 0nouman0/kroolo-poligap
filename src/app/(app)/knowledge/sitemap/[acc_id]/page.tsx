"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/stores/user-store";
import { useSitemapUpload, useSitemapCrawl } from "@/lib/queries/useKnowledgeUpload";

export default function SitemapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { acc_id } = params as { acc_id: string };
  
  // User data
  const userData = useUserStore((s) => s.userData);
  const userId = userData?.userId;
  const userEmail = userData?.email;

  // Form state
  const [url, setUrl] = useState("https://");
  const [includePaths, setIncludePaths] = useState("");
  const [excludePaths, setExcludePaths] = useState("");
  const [activeTab, setActiveTab] = useState("sitemap");

  // Mutations
  const sitemapUploadMutation = useSitemapUpload();
  const sitemapCrawlMutation = useSitemapCrawl();

  const handleLoadSitemap = async () => {
    if (!url.trim() || !userId || !userEmail) return;

    // Parse include and exclude paths
    const includePathsArray = includePaths
      .split(',')
      .map(path => path.trim())
      .filter(path => path.length > 0);

    const excludePathsArray = excludePaths
      .split(',')
      .map(path => path.trim())
      .filter(path => path.length > 0);

    try {
      await sitemapCrawlMutation.mutateAsync({
        external_user_id: userId + "_site",
        user_email: userEmail,
        url: url.trim(),
        crawl_type: 'sitemap',
        account_ids: [userId],
        include_paths: includePathsArray.length > 0 ? includePathsArray : undefined,
        exclude_paths: excludePathsArray.length > 0 ? excludePathsArray : undefined,
      });
    } catch (error) {
      console.error("Failed to load sitemap:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Sitemap</h1>
             
            </div>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add links</span>
              <ChevronDown className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              

              <TabsContent value="sitemap" className="space-y-6 mt-6">
                {/* URL Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL</label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md w-full">
                      <select
                        className="px-3 py-2 border-r bg-muted text-sm rounded-l-md focus:outline-none"
                        value={url.startsWith("https://") ? "https://" : "http://"}
                        onChange={(e) => {
                          const protocol = e.target.value;
                          const domain = url.replace(/^https?:\/\//, "");
                          setUrl(protocol + domain);
                        }}
                      >
                        <option value="https://">https://</option>
                        <option value="http://">http://</option>
                      </select>
                      <Input
                        value={url.replace(/^https?:\/\//, "")}
                        onChange={(e) => {
                          const protocol = url.startsWith("https://") ? "https://" : "http://";
                          setUrl(protocol + e.target.value);
                        }}
                        placeholder="www.example.com"
                        className="border-0 rounded-l-none focus-visible:ring-0 flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Links found during crawling or sitemap retrieval may be updated if new links are discovered or some links are invalid.
                    </span>
                  </div>
                </div>

                {/* Include/Exclude Paths */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Include only paths</label>
                    <Input
                      value={includePaths}
                      onChange={(e) => setIncludePaths(e.target.value)}
                      placeholder="Ex: blog/*, dev/*"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Exclude paths</label>
                    <Input
                      value={excludePaths}
                      onChange={(e) => setExcludePaths(e.target.value)}
                      placeholder="Ex: blog/*, dev/*"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Load Sitemap Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleLoadSitemap}
                    disabled={!url.trim() || url === "https://" || url === "http://" || sitemapCrawlMutation.isPending}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    {sitemapCrawlMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load sitemap"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="crawl" className="space-y-6 mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Crawl links functionality coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="individual" className="space-y-6 mt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Individual link functionality coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
