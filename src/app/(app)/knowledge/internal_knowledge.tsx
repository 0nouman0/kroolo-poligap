"use client";

import type React from "react";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  UploadCloud,
  FileIcon,
  LinkIcon,
  Youtube,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Network,
  FileText,
} from "lucide-react";
import { FileIcon as AttachmentFileIcon } from "@/utils/attachments.util";
import { toastWarning } from "@/components/toast-varients";
import { Switch } from "@/components/ui/switch";
import {
  KnowledgeFile,
  KnowledgeLink,
  formatBytes,
  handleScrapYoutube,
  handleScrapUrl,
  getFileExtension,
} from "@/utils/internal-knowledge.util";
import {
  useKnowledgeUpload,
  useKnowledgeData,
  useKnowledgeDelete,
  useKnowledgeToggle,
  useSitemapUpload,
  useSitemapsData,
  useSitemapDelete,
} from "@/lib/queries/useKnowledgeUpload";
import { useUserStore } from "@/stores/user-store";
import { useIntegrationStore } from "@/stores/integration-store";
import { TiDocumentAdd } from "react-icons/ti";
import { IoLogoYoutube } from "react-icons/io5";
import { TbFileUpload } from "react-icons/tb";

// Status indicator component
const StatusIndicator = ({ status }: { status: string }) => {
  switch (status) {
    case "processing":
      return (
        <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Processing</span>
        </div>
      );
    case "completed":
      return (
        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="w-3 h-3" />
          <span>Completed</span>
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3 h-3" />
          <span>Failed</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>Pending</span>
        </div>
      );
  }
};

export default function ExternalKnowledgeBaseUploader() {
  // User and company data
  const userData = useUserStore((s) => s.userData);
  const userId = userData?.userId;
  const userEmail = userData?.email;

  // TanStack Query mutations and queries
  const uploadMutation = useKnowledgeUpload();
  const deleteMutation = useKnowledgeDelete();
  const toggleMutation = useKnowledgeToggle();
  const {
    data: knowledgeData,
    isLoading: isLoadingKnowledge,
    refetch: refetchKnowledge,
  } = useKnowledgeData(userId);

  // Sitemap mutations and queries
  const sitemapUploadMutation = useSitemapUpload();
  const sitemapDeleteMutation = useSitemapDelete();
  const {
    data: sitemapsData,
    isLoading: isLoadingSitemaps,
    refetch: refetchSitemaps,
  } = useSitemapsData(userId, userEmail);

  // Use backend is_enabled data with fallback to true
  const isEnabled = knowledgeData?.is_enabled ?? true;

  // Store isEnabled in integration store
  const setIsEnabled = useIntegrationStore((s) => s.setIsEnabled);
  useEffect(() => {
    setIsEnabled(isEnabled);
  }, [isEnabled, setIsEnabled]);

  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [websites, setWebsites] = useState<KnowledgeLink[]>([]);
  const [youtubeLinks, setYoutubeLinks] = useState<KnowledgeLink[]>([]);

  // Separate state for fetched knowledge data
  const [fetchedWebsites, setFetchedWebsites] = useState<KnowledgeLink[]>([]);
  const [fetchedYoutubeLinks, setFetchedYoutubeLinks] = useState<
    KnowledgeLink[]
  >([]);
  const [fetchedFiles, setFetchedFiles] = useState<
    {
      id: string;
      name: string;
      status: string;
      uploaded_at: string;
    }[]
  >([]);
  const [fetchedSitemaps, setFetchedSitemaps] = useState<KnowledgeLink[]>([]);

  // State to track which item is being deleted
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [websiteInput, setWebsiteInput] = useState("");
  const [youtubeInput, setYoutubeInput] = useState("");
  const [sitemapInput, setSitemapInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  console.log("files ===>", files);

  // Process fetched knowledge data to display with metadata
  useEffect(() => {
    if (knowledgeData) {
      // Process websites using handleScrapUrl logic
      const processedWebsites = knowledgeData.websites.map((item) => {
        try {
          // Use handleScrapUrl logic to get metadata
          const websiteInput = item.name;
          const link = websiteInput?.replace(/^(https?:\/\/)?(www\.)?/, "");
          const fileName = link?.split(/[./]/)[0];
          const title = fileName?.charAt(0)?.toUpperCase() + fileName?.slice(1);

          // Use Google S2 favicon service
          const domain =
            websiteInput.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i)?.[1] ||
            link;
          const favicon = domain
            ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
            : undefined;

          return {
            id: item.id,
            url: item.name,
            title: title || item.name,
            favicon,
            status: item.status,
            uploaded_at: item.uploaded_at,
          };
        } catch (error) {
          console.error("Error processing website:", error);
          return {
            id: item.id,
            url: item.name,
            title: item.name,
            status: item.status,
            uploaded_at: item.uploaded_at,
          };
        }
      });

      // Process YouTube links using handleScrapYoutube logic
      const processedYoutubeLinks = knowledgeData.youtubeLinks.map(
        async (item) => {
          try {
            // Use handleScrapYoutube logic to get metadata
            const youtubeInput = item.name;
            const res = await fetch(
              `https://noembed.com/embed?dataType=json&url=${youtubeInput}`
            );
            const data = await res.json();

            return {
              id: item.id,
              url: data?.url || youtubeInput,
              title: data?.title || youtubeInput,
              status: item.status,
              uploaded_at: item.uploaded_at,
            };
          } catch (error) {
            console.error("Error processing YouTube link:", error);
            return {
              id: item.id,
              url: item.name,
              title: item.name,
              status: item.status,
              uploaded_at: item.uploaded_at,
            };
          }
        }
      );

      // Process files from backend data
      const processedFiles = knowledgeData.files.map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        uploaded_at: item.uploaded_at,
      }));

      // Update state with processed data
      setFetchedWebsites(processedWebsites);
      setFetchedFiles(processedFiles);

      // Handle async YouTube processing
      Promise.all(processedYoutubeLinks).then((youtubeLinks) => {
        setFetchedYoutubeLinks(youtubeLinks);
      });
    }
  }, [knowledgeData]);

  // Process sitemaps data
  useEffect(() => {
    if (sitemapsData) {
      const processedSitemaps = sitemapsData.sitemaps.map((item) => ({
        id: item.id,
        url: item.sitemap_url,
        title: `Sitemap: ${item.sitemap_url}`,
        status: item.status,
        uploaded_at: item.uploaded_at,
      }));
      setFetchedSitemaps(processedSitemaps);
    }
  }, [sitemapsData]);

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).map((file) => ({
        id: crypto.randomUUID(),
        file,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const removeFile = (id: string) => setFiles(files.filter((f) => f.id !== id));
  const removeWebsite = (id: string) =>
    setWebsites(websites.filter((w) => w.id !== id));
  const removeYoutubeLink = (id: string) =>
    setYoutubeLinks(youtubeLinks.filter((y) => y.id !== id));

  // Sitemap functions
  const handleSitemapUpload = async () => {
    if (!sitemapInput.trim() || !userId || !userEmail) return;

    try {
      await sitemapUploadMutation.mutateAsync({
        external_user_id: userId + "_site",
        user_email: userEmail,
        sitemap_url: sitemapInput.trim(),
        sitemap_identifier: userId + "sitemap_identifier",
        account_ids: [userId],
      });
      setSitemapInput("");
    } catch (error) {
      console.error("Failed to upload sitemap:", error);
    }
  };

  const deleteExistingSitemap = async (itemId: string) => {
    if (!userId) return;

    setDeletingItemId(itemId);
    try {
      await sitemapDeleteMutation.mutateAsync({
        itemId,
        external_user_id: userId,
      });
    } catch (error) {
      console.error("Failed to delete sitemap:", error);
    } finally {
      setDeletingItemId(null);
    }
  };

  // Delete functions for existing items
  const deleteExistingWebsite = async (itemId: string) => {
    if (!userId) {
      toastWarning("User information not available. Please try again.");
      return;
    }

    setDeletingItemId(itemId);
    try {
      await deleteMutation.mutateAsync({
        itemId,
        external_user_id: userId,
      });
    } catch (error) {
      console.error("Delete failed:", error);
      // Error handling is done in the mutation hook
    } finally {
      setDeletingItemId(null);
    }
  };

  const deleteExistingYoutubeLink = async (itemId: string) => {
    if (!userId) {
      toastWarning("User information not available. Please try again.");
      return;
    }

    setDeletingItemId(itemId);
    try {
      await deleteMutation.mutateAsync({
        itemId,
        external_user_id: userId,
      });
    } catch (error) {
      console.error("Delete failed:", error);
      // Error handling is done in the mutation hook
    } finally {
      setDeletingItemId(null);
    }
  };

  const deleteExistingFile = async (itemId: string) => {
    if (!userId) {
      toastWarning("User information not available. Please try again.");
      return;
    }

    setDeletingItemId(itemId);
    try {
      await deleteMutation.mutateAsync({
        itemId,
        external_user_id: userId,
      });
    } catch (error) {
      console.error("Delete failed:", error);
      // Error handling is done in the mutation hook
    } finally {
      setDeletingItemId(null);
    }
  };

  // Toggle knowledge function with debouncing protection
  const handleToggleKnowledge = async (enabled: boolean) => {
    if (!userId) {
      toastWarning("User information not available. Please try again.");
      return;
    }

    // Prevent rapid clicking by checking if mutation is already in progress
    if (toggleMutation.isPending) {
      console.log("Toggle already in progress, ignoring click");
      return;
    }

    try {
      await toggleMutation.mutateAsync({
        external_user_id: userId,
        is_enabled: enabled,
      });
      // The optimistic update will handle the UI immediately
      // The backend data will be automatically updated via the query invalidation
    } catch (error) {
      console.error("Toggle failed:", error);
      // Error handling is done in the mutation hook
      // The optimistic update will automatically rollback if the API call fails
    }
  };

  const addYoutubeLink = () => {
    if (
      youtubeInput.trim() &&
      youtubeLinks.every((y) => y.url !== youtubeInput)
    ) {
      // Use handleScrapYoutube to get metadata for new YouTube links
      handleScrapYoutube(
        youtubeInput,
        setYoutubeInput,
        setYoutubeLinks,
        youtubeLinks,
        toastWarning
      );
    }
  };

  const totalSize = useMemo(
    () => files.reduce((acc, curr) => acc + curr.file.size, 0),
    [files]
  );

  // Helper function for pluralization
  const getPluralText = (count: number, singular: string, plural: string) => {
    return count === 1 ? singular : plural;
  };

  const handleFilesAndLinkUpload = async () => {
    if (!userId || !userEmail) {
      toastWarning("User information not available. Please try again.");
      return;
    }

    if (
      files.length === 0 &&
      websites.length === 0 &&
      youtubeLinks.length === 0
    ) {
      toastWarning("Please add at least one file, website, or YouTube link.");
      return;
    }

    console.log("files ===>", files);
    console.log("websites ===>", websites);
    console.log("youtubeLinks ===>", youtubeLinks);
    try {
      await uploadMutation.mutateAsync({
        external_user_id_internal: userId,
        account_ids: userId ? [userId] : [],
        user_email: userEmail,
        files: files.map((f) => f.file),
        websites: websites.map((w) => w.url),
        youtubeLinks: youtubeLinks.map((y) => y.url),
        use_exa_ai: isEnabled,
      });

      // Clear form on success
      setFiles([]);
      setWebsites([]);
      setYoutubeLinks([]);
      setWebsiteInput("");
      setYoutubeInput("");

      // Refetch knowledge data to show updated list
      refetchKnowledge();
    } catch (error) {
      console.error("Upload failed:", error);
      // Error handling is done in the mutation hook
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen " style={{ fontSize: "13px" }}>
        <div className="max-w-7xl mx-auto">
          <header className="mb-3 mt-6">
            <h1 className="text-sm font-bold text-card-foreground">
              Knowledge
            </h1>
            <p className="text-secondary mt-0.5">
              Enhance Search's knowledge by adding files, media, links, videos,
              for better results.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
            <div className="lg:col-span-2 space-y-3">
              <Card className={`gap-1 py-0 rounded-md`}>
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
                  <CardTitle className="text-13">Enable Knowledge</CardTitle>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={handleToggleKnowledge}
                    aria-label="Enable Knowledge"
                  />
                </CardHeader>
              </Card>

              <Card
                className={`py-3 gap-1 rounded-md ${
                  !isEnabled ? " kroolo-disabled" : ""
                }`}
              >
                <CardHeader className="px-3">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <TiDocumentAdd
                      style={{
                        width: 20,
                        height: 20,
                        color: "var(--secondary-text-color)",
                      }}
                    />{" "}
                    Add Files
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3">
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      isDragging
                        ? "border-primary"
                        : "border-card-border bg-card"
                    }`}
                  >
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <TbFileUpload
                          size={28}
                          color="var(--secondary-text-color)"
                          strokeWidth={1.5}
                        />
                        <p className="text-secondary">
                          <span className="font-semibold text-primary">
                            Drop your documents here 
                          </span>
                          , or click to upload
                        </p>
                        <p className="text-xs">
                          Attach (.pdf, .csv, .xls, .ppt, .docx, .png, .jpg)
                        </p>
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files)}
                        accept=".pdf,.csv,.xls,.xlsx,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg"
                      />
                    </label>
                  </div>
                  {isLoadingKnowledge && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Loading existing knowledge...</span>
                    </div>
                  )}
                  {/* Display all files in unified list */}
                  {(fetchedFiles.length > 0 || files.length > 0) && (
                    <div className="mt-2 space-y-1">
                      {fetchedFiles.map(({ id, name, status, uploaded_at }) => {
                        const ext = getFileExtension(name);
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between p-1 border rounded-md bg-card border-card-border"
                          >
                            <div className="flex items-center gap-2">
                              <AttachmentFileIcon fileType={ext} />
                              <span className="text-xs font-medium truncate max-w-xs">
                                {name}
                              </span>
                              {/* {status && <StatusIndicator status={status} />} */}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteExistingFile(id)}
                              disabled={
                                deleteMutation.isPending &&
                                deletingItemId === id
                              }
                            >
                              {deleteMutation.isPending &&
                              deletingItemId === id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
                              )}
                            </Button>
                          </div>
                        );
                      })}
                      {files.map(({ id, file }) => {
                        // Use file name extension for icon
                        const ext = getFileExtension(file.name);
                        return (
                          <div
                            key={id}
                            className="flex items-center justify-between p-1 border rounded-md bg-card border-card-border"
                          >
                            <div className="flex items-center gap-2">
                              <AttachmentFileIcon fileType={ext} />
                              <span className="text-xs font-medium truncate max-w-xs">
                                {file.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">
                                {formatBytes(file.size)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className={`py-3 gap-1 rounded-md ${
                  !isEnabled ? " kroolo-disabled" : ""
                }`}
              >
                <CardHeader className="px-3 ">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <LinkIcon className="w-4 h-4" /> Add Website
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3">
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="https://www.example.com"
                      value={websiteInput}
                      onChange={(e) => setWebsiteInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        handleScrapUrl(
                          websiteInput,
                          setWebsiteInput,
                          setWebsites,
                          websites,
                          toastWarning
                        )
                      }
                      className="text-xs"
                    />
                    <Button
                      className="text-xs px-2 py-1 h-7 rounded-[4px]"
                      onClick={() =>
                        handleScrapUrl(
                          websiteInput,
                          setWebsiteInput,
                          setWebsites,
                          websites,
                          toastWarning
                        )
                      }
                      disabled={websiteInput.trim().length === 0}
                    >
                      Import Site
                    </Button>
                  </div>
                  <p className="text-xs  mt-1">
                    This will crawl all the links starting with the URL (not
                    including files on the website).
                  </p>
                  {isLoadingKnowledge && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Loading existing knowledge...</span>
                    </div>
                  )}
                  {/* Display all websites in unified list */}
                  {(fetchedWebsites.length > 0 || websites.length > 0) && (
                    <div className="mt-2 space-y-1">
                      {fetchedWebsites.map(
                        ({ id, url, title, favicon, status, uploaded_at }) => (
                          <div
                            key={id}
                            className="flex items-center justify-between p-1 border rounded-md bg-card border-card-border"
                          >
                            <div className="flex items-center gap-2">
                              {favicon ? (
                                <img
                                  src={favicon}
                                  alt="favicon"
                                  className="w-5 h-5 rounded bg-card border border-card-border"
                                />
                              ) : (
                                <LinkIcon className="w-5 h-5 text-gray-600" />
                              )}
                              <div className="flex flex-col">
                                <span className="text-xs font-medium truncate max-w-md">
                                  {title ? `${title} — ` : null}
                                  {url}
                                </span>
                                {/* {status && <StatusIndicator status={status} />} */}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteExistingWebsite(id)}
                              disabled={
                                deleteMutation.isPending &&
                                deletingItemId === id
                              }
                            >
                              {deleteMutation.isPending &&
                              deletingItemId === id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
                              )}
                            </Button>
                          </div>
                        )
                      )}
                      {websites.map(({ id, url, title, favicon }) => (
                        <div
                          key={id}
                          className="flex items-center justify-between p-1 border rounded-md bg-card border-card-border"
                        >
                          <div className="flex items-center gap-2">
                            {favicon ? (
                              <img
                                src={favicon}
                                alt="favicon"
                                className="w-5 h-5 rounded bg-card border border-card-border"
                              />
                            ) : (
                              <LinkIcon className="w-5 h-5 text-gray-600" />
                            )}
                            <div className="flex flex-col">
                              <span className="text-xs font-medium truncate max-w-md">
                                {title ? `${title} — ` : null}
                                {url}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeWebsite(id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className={`py-3 gap-1 rounded-md ${
                  !isEnabled ? " kroolo-disabled" : ""
                }`}
              >
                <CardHeader className="px-3">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <IoLogoYoutube
                      style={{
                        width: 20,
                        height: 20,
                        color: "var(--secondary-text-color)",
                      }}
                    />{" "}
                    Add Youtube
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3">
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="Paste YouTube link"
                      value={youtubeInput}
                      onChange={(e) => setYoutubeInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addYoutubeLink()}
                      className="text-xs"
                    />
                    <Button
                      className="text-xs px-2 py-1 h-7 rounded-[4px]"
                      onClick={() =>
                        handleScrapYoutube(
                          youtubeInput,
                          setYoutubeInput,
                          setYoutubeLinks,
                          youtubeLinks,
                          toastWarning
                        )
                      }
                      disabled={youtubeInput.trim().length === 0}
                    >
                      Import Video
                    </Button>
                  </div>
                  <p className="text-xs  mt-1">
                    Add YouTube transcripts as knowledge.
                  </p>
                  {isLoadingKnowledge && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Loading existing knowledge...</span>
                    </div>
                  )}
                  {/* Display all YouTube links in unified list */}
                  {(fetchedYoutubeLinks.length > 0 ||
                    youtubeLinks.length > 0) && (
                    <div className="mt-2 space-y-1">
                      {fetchedYoutubeLinks.map(
                        ({ id, url, title, status, uploaded_at }) => (
                          <div
                            key={id}
                            className="flex items-center justify-between p-1 border rounded-md bg-card border-card-border"
                          >
                            <div className="flex items-center gap-2">
                              <Youtube className="w-5 h-5 text-red-600 dark:text-red-400" />
                              <div className="flex flex-col">
                                <span className="text-xs font-medium truncate max-w-md">
                                  {title ? `${title} — ` : null}
                                  {url}
                                </span>
                                {/* {status && <StatusIndicator status={status} />} */}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteExistingYoutubeLink(id)}
                              disabled={
                                deleteMutation.isPending &&
                                deletingItemId === id
                              }
                            >
                              {deleteMutation.isPending &&
                              deletingItemId === id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
                              )}
                            </Button>
                          </div>
                        )
                      )}
                      {youtubeLinks.map(({ id, url, title }) => (
                        <div
                          key={id}
                          className="flex items-center justify-between p-1 border rounded-md bg-card border-card-border"
                        >
                          <div className="flex items-center gap-2">
                            <Youtube className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium truncate max-w-md">
                                {title ? `${title} — ` : null}
                                {url}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeYoutubeLink(id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className={`py-3 gap-1 rounded-md ${
                  !isEnabled ? " kroolo-disabled" : ""
                }`}
              >
                <CardHeader className="px-3">
                  <CardTitle className="flex items-center gap-1 text-sm">
                    <Network className="w-4 h-4" /> Add Sitemap
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3">
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="https://www.example.com/sitemap.xml"
                      value={sitemapInput}
                      onChange={(e) => setSitemapInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSitemapUpload()
                      }
                      className="text-xs"
                    />
                    <Button
                      className="text-xs px-2 py-1 h-7 rounded-[4px]"
                      onClick={handleSitemapUpload}
                      disabled={
                        sitemapInput.trim().length === 0 ||
                        sitemapUploadMutation.isPending
                      }
                    >
                      {sitemapUploadMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Crawl Sitemap"
                      )}
                    </Button>
                  </div>
                  <p className="text-xs mt-1">
                    Add XML sitemap URLs to crawl all pages from the sitemap.
                  </p>
                  {isLoadingSitemaps && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Loading existing sitemaps...</span>
                    </div>
                  )}
                  {/* Display all sitemaps in unified list */}
                  {fetchedSitemaps.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {fetchedSitemaps.map(
                        ({ id, url, title, status, uploaded_at }) => (
                          <div
                            key={id}
                            className="flex items-center justify-between p-1 border rounded-md bg-card border-card-border"
                          >
                            <div className="flex items-center gap-2">
                              <Network className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <div className="flex flex-col">
                                <span className="text-xs font-medium truncate max-w-md">
                                  {title}
                                </span>
                                {status && <StatusIndicator status={status} />}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteExistingSitemap(id)}
                              disabled={
                                sitemapDeleteMutation.isPending &&
                                deletingItemId === id
                              }
                            >
                              {sitemapDeleteMutation.isPending &&
                              deletingItemId === id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
                              )}
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 sticky top-8">
              <Card
                className={`py-3 gap-1 rounded-md ${
                  !isEnabled ? " kroolo-disabled" : ""
                }`}
              >
                <CardHeader className="px-3">
                  <CardTitle className="text-13 flex text-secondary">
                    <span>SOURCES</span>
                    <span className="ml-2">
                      {files.length +
                        fetchedFiles.length +
                        websites.length +
                        fetchedWebsites.length +
                        youtubeLinks.length +
                        fetchedYoutubeLinks.length +
                        fetchedSitemaps.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-xs">
                      <FileText className="w-4 h-4 text-[var(--secondary-text-color)]" />
                      <span>
                        {files.length + fetchedFiles.length}{" "}
                        {getPluralText(
                          files.length + fetchedFiles.length,
                          "File",
                          "Files"
                        )}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-primary">
                      {formatBytes(totalSize)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-xs">
                      <LinkIcon className="w-4 h-4 " />
                      <span>
                        {websites.length + fetchedWebsites.length}{" "}
                        {getPluralText(
                          websites.length + fetchedWebsites.length,
                          "Link",
                          "Links"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-xs">
                      <IoLogoYoutube className="w-4 h-4 text-[var(--secondary-text-color)]" />
                      <span>
                        {youtubeLinks.length + fetchedYoutubeLinks.length}{" "}
                        {getPluralText(
                          youtubeLinks.length + fetchedYoutubeLinks.length,
                          "Youtube link",
                          "Youtube links"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-[var(--secondary-text-color)] my-4"></div>
                  <div className="flex justify-between items-center font-semibold text-xs">
                    <span>Total size:</span>
                    <span className="font-mono">{formatBytes(totalSize)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 py-2 px-3">
                  <Button
                    className="w-full text-xs h-8"
                    onClick={handleFilesAndLinkUpload}
                    disabled={
                      uploadMutation.isPending ||
                      !isEnabled ||
                      (files.length === 0 &&
                        websites.length === 0 &&
                        youtubeLinks.length === 0) ||
                      !userId ||
                      !userEmail
                    }
                  >
                    {uploadMutation.isPending ? "Training..." : "Train"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
