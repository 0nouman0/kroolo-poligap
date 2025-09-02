"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  FileText,
  AlertCircle,
  CheckCircle,
  CheckSquare,
  Square,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useAppFiles, DriveFile } from "@/lib/queries/useAppFiles";
import Link from "next/link";
import { useUserStore } from "@/stores/user-store";
import { APP_DISPLAY } from "@/utils/knowledge.util";
import { getSourceIcon } from "@/utils/search.util";
import { formatDate } from "@/utils/date.util";
import { Skeleton } from "@/components/ui/skeleton";
import GoogleDriveExplorer from "../../components/explorer/GoogleDriveExplorer";
import DropboxExplorer from "../../components/explorer/DropboxExplorer";
import SlackExplorer from "../../components/explorer/SlackExplorer";
import JiraExplorer from "../../components/explorer/JiraExplorer";
import ConfluenceExplorer from "../../components/explorer/ConfluenceExplorer";
import MicrosoftTeamsExplorer from "../../components/explorer/MicrosoftTeamsExplorer";
import ZendeskExplorer from "../../components/explorer/ZendeskExplorer";
import MicrosoftSharePointExplorer from "../../components/explorer/MicrosoftSharePointExplorer";
import Document360Explorer from "../../components/explorer/Document360Explorer";
import SitemapExplorer from "../../components/explorer/SitemapExplorer";

export default function KnowledgeAppConnectView() {
  const params = useParams();
  const { app, acc_id } = params as { app: string; acc_id: string };
  const appInfo = APP_DISPLAY[app] || { name: app, icon: "" };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("connected");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch files from backend (optionally pass app if your hook supports it)
  const { data, isLoading, isError } = useAppFiles(acc_id);
  const files: DriveFile[] = data || [];

  // Helper to get file icon by type (from metadata.mime_type or title)
  const getFileIcon = (file: DriveFile) => {
    const mime = file.file_type || "";
    const title = file.title.toLowerCase();
    if (mime.includes("pdf") || title.endsWith(".pdf")) {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (
      mime.includes("sheet") ||
      title.endsWith(".xls") ||
      title.endsWith(".xlsx")
    ) {
      return <FileText className="w-4 h-4 text-green-500" />;
    } else if (
      mime.includes("word") ||
      title.endsWith(".doc") ||
      title.endsWith(".docx")
    ) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    } else if (mime.includes("zip") || title.endsWith(".zip")) {
      return <FileText className="w-4 h-4 text-yellow-500" />;
    } else {
      return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  // Helper to get status icon
  const getStatusIcon = (integration_type: string) => {
    if (integration_type === "success") {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (integration_type === "error") {
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Remove all folder/chunked-folder logic. Only show a flat list of files.
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFolder =
      !selectedFolder ||
      (file.folder_structure &&
        file.folder_structure.folder_path &&
        file.folder_structure.folder_path.includes(selectedFolder));
    return matchesSearch && matchesFolder;
  });

  // Checkbox selection handlers
  const handleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkAccessControl = () => {
    setShowConfirmationModal(true);
  };

  const confirmAccessControl = async () => {
    setIsProcessing(true);
    try {
      // API call to update access control for selected files
      console.log('Updating access for files:', selectedFiles);
      // Here you would make the actual API call
      // await updateBulkAccessControl(selectedFiles);
      
      // Reset selection after successful update
      setSelectedFiles([]);
      setSelectAll(false);
      setShowConfirmationModal(false);
      
      // Show success message
      alert('Access permissions updated successfully!');
    } catch (error) {
      console.error('Error updating access control:', error);
      alert('Failed to update access permissions. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get user email from store
  const { userData } = useUserStore();
  const userEmail = userData?.email || "N/A";

  return (
    <div className="min-h-screen bg-background text-[13px]">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Link href="/knowledge">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">{appInfo.name} Settings</h1>
            {appInfo.icon && (
              <Image
                src={appInfo.icon}
                alt={`${appInfo.name} logo`}
                className="h-8 w-8 object-contain"
                width={32}
                height={32}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* App Information */}
          <Card className="py-3">
            <CardHeader className="gap-0">
              <CardTitle className="font-semibold text-sm">
                {appInfo.name} Information
              </CardTitle>
            </CardHeader>
            <CardContent className="">
              <div className="text-[13px] text-muted-foreground">
                <div>
                  <div>User Email: {userEmail}</div>
                </div>
                <div>
                  Last Sync:{" "}
                  {files[0]?.updated_at
                    ? new Date(files[0].updated_at).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "N/A"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Explorer Card */}
          {app === "google_drive" && (
            <GoogleDriveExplorer
              files={files}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
          )}
          {app === "dropbox" && (
            <DropboxExplorer
              files={files}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
          )}
          {app === "slack" && (
            <SlackExplorer
              files={files}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
          )}
          {app === "jira" && (
            <JiraExplorer
              files={files}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
          )}
          {app === "confluence" && (
            <ConfluenceExplorer
              files={files}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
          )}
          {app === "microsoft_teams" && (
            <MicrosoftTeamsExplorer
              files={files}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
          )}
          {app === "zendesk" && (
            <ZendeskExplorer
              files={files}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
          )}
          {app === "microsoft_sharepoint" && (
            <MicrosoftSharePointExplorer
              files={files}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
          )}
          {app === "document_360" && (
            <Document360Explorer
              files={files}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
          )}
          {app === "sitemap" && (
            <SitemapExplorer
              files={files}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
          )}
          {/* Fallback */}
          {[
            "google_drive",
            "dropbox",
            "slack",
            "jira",
            "confluence",
            "microsoft_teams",
            "zendesk",
            "microsoft_sharepoint",
            "document_360",
            "sitemap",
          ].includes(app) ? null : (
            <div className="bg-card rounded-lg shadow p-3 text-sm text-muted-foreground">
              No explorer available for this app.
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* File Sync Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">File Sync</h2>
              <p className="text-[13px] text-muted-foreground">
                Total files: {files.length}
                {selectedFiles.length > 0 && (
                  <span className="ml-2 text-primary">
                    ({selectedFiles.length} selected)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {filteredFiles.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectAll && filteredFiles.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 accent-[oklch(62.7%_0.194_149.214)] focus:ring-2 focus:ring-[oklch(62.7%_0.194_149.214)] focus:ring-offset-0"
                    style={{
                      accentColor: 'oklch(62.7% 0.194 149.214)',
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              )}
              {selectedFiles.length > 0 && (
                <Button 
                  onClick={handleBulkAccessControl}
                  className="h-9"
                  size="sm"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Save Changes ({selectedFiles.length})
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            {/* <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date modified</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select> */}
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            {/* <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connected" className="text-[13px]">
                {appInfo.name} Content ({files.length})
              </TabsTrigger>
            </TabsList> */}

            <TabsContent value="connected" className="">
              <Card className="py-1">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="divide-y">
                      {[...Array(5)].map((_, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Skeleton className="w-5 h-5 rounded" />
                            <Skeleton className="w-5 h-5 rounded" />
                            <div className="flex-1 min-w-0">
                              <Skeleton className="h-4 w-3/4 mb-1" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                        No data found
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50 transition-colors gap-2"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes(file.id)}
                              onChange={() => handleFileSelection(file.id)}
                              className="h-4 w-4 rounded border-gray-300 accent-[oklch(62.7%_0.194_149.214)] focus:ring-2 focus:ring-[oklch(62.7%_0.194_149.214)] focus:ring-offset-0"
                              style={{
                                accentColor: 'oklch(62.7% 0.194 149.214)',
                              }}
                            />
                            <Link
                              href={file.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 flex-1 min-w-0 no-underline"
                            >
                              {getSourceIcon(file.integration_type, 22)}
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-medium truncate">
                                  {file.title}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  Last Synced:{" "}
                                  {formatDate(file.updated_at, {
                                    showTime: true,
                                  })}
                                </div>
                              </div>
                            </Link>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  fill="none"
                                  viewBox="0 0 20 20"
                                >
                                  <circle
                                    cx="4"
                                    cy="10"
                                    r="1.5"
                                    fill="currentColor"
                                  />
                                  <circle
                                    cx="10"
                                    cy="10"
                                    r="1.5"
                                    fill="currentColor"
                                  />
                                  <circle
                                    cx="16"
                                    cy="10"
                                    r="1.5"
                                    fill="currentColor"
                                  />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                Permissions
                              </div>
                              {file?.access_control?.authorized_emails &&
                              file?.access_control?.authorized_emails.length >
                                0 ? (
                                file?.access_control?.authorized_emails.map(
                                  (perm: any) => (
                                    <DropdownMenuItem
                                      key={perm}
                                      className="flex flex-col items-start"
                                    >
                                      <span>{perm || "N/A"}</span>
                                    </DropdownMenuItem>
                                  )
                                )
                              ) : (
                                <DropdownMenuItem disabled>
                                  No permissions found
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
