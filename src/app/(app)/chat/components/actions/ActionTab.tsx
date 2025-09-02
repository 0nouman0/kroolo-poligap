import type { MessageProps, PlaygroundChatMessage } from "@/types/agent";
import React, { useCallback, useState } from "react";
import { Copy, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Icon from "./../../ui/icon";
import MarkdownRenderer from "./../../ui/typography/MarkdownRenderer";
import { EXPORT_TYPES } from "./../../utils/utils";
import { toastError, toastSuccess } from "@/components/toast-varients";

export const ActionTab = ({
  message,
  exportReactComponentAsPDF,
  handleCreateProject,
  handleCreateDoc,
}: MessageProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState("");
  const [isCreatingDocument, setIsCreatingDocument] = useState("");

  const onExportAsPDF = useCallback(async () => {
    if (exportReactComponentAsPDF) {
      setIsExporting(message.id);
      await exportReactComponentAsPDF(
        <div
          className="m-10"
          style={{
            fontFamily: "Inter !important",
          }}
        >
          <MarkdownRenderer>{message.content}</MarkdownRenderer>
        </div>,
        {
          title: "AI Agent",
          fileName: `${message.content?.slice(0, 20) ?? "AI Agent"}`,
          fileFormat: "pdf",
        }
      );
      toastSuccess("Exported as PDF");
      setIsExporting("");
    }
  }, [message, exportReactComponentAsPDF]);

  const onExportAsMarkdown = useCallback(() => {
    setIsExporting(message.id);

    try {
      const content = message.content ?? "";
      const fileName = `${message.content?.slice(0, 20) ?? "AI Agent"}.md`;
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toastSuccess("Exported as Markdown");
    } catch (error) {
      toastError(
        `Failed to export as Markdown  ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsExporting("");
    }
  }, [message]);

  const handleExport = async (id: number) => {
    if (id === 1) {
      await onExportAsPDF();
    } else if (id === 2) {
      onExportAsMarkdown();
    }
  };

  const handleLike = useCallback(() => {
    if (isLiked) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
      setIsDisliked(false);
    }
  }, [isLiked]);

  const handleDislike = useCallback(() => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      setIsLiked(false);
    }
  }, [isDisliked]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(message.content ?? "");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
    toastSuccess("Copied to clipboard");
  }, [message.content]);

  const createDocument = async (message: PlaygroundChatMessage) => {
    try {
      setIsCreatingDocument(message.id);
      if (handleCreateDoc) {
        await handleCreateDoc(message);
      }
    } catch (error) {
      toastError(
        `Chat Creation Failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsCreatingDocument("");
    }
  };
  const createProject = (message: PlaygroundChatMessage) => {
    try {
      if (handleCreateProject) {
        handleCreateProject(message);
      }
    } catch (error) {
      toastError(
        `Chat Creation Failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="py-[4px]"
                disabled={isExporting === message.id}
                style={{
                  width: "min-content",
                  height: "100%",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {isExporting === message.id ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                      color="var(--text-color)"
                    />
                  ) : (
                    <Icon type="export" size="xs" color="var(--text-color)" />
                  )}
                  {isExporting === message.id ? "Exporting" : "Export"}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              style={{ zIndex: 1500, maxHeight: "200px", overflowY: "auto" }}
            >
              {EXPORT_TYPES.map((item) => {
                return (
                  <DropdownMenuItem
                    key={item.id}
                    style={{
                      fontSize: "13px",
                      backgroundColor: "transparent",
                      position: "relative",
                    }}
                    onSelect={() => handleExport(item.id)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                      }}
                    >
                      <Icon
                        type={item.icon}
                        size="xs"
                        color="var(--text-color)"
                      />
                      <p className="flex-1 text-[12px] text-[var(--text-color)]">
                        {item.title}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          {handleCreateDoc && (
            <Button
              onClick={() => createDocument(message)}
              variant="secondary"
              className="bg-[var(--text-color)] py-0.5 text-[var(--black-1000)] disabled:opacity-80"
              size="sm"
              disabled={isCreatingDocument === message.id}
              style={{ width: "min-content", height: "100%" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                {isCreatingDocument === message.id && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                    color="var(--black-1000)"
                  />
                )}
                {isCreatingDocument === message.id ? "Creating" : "Create Doc"}
              </div>
            </Button>
          )}
          {handleCreateProject && (
            <Button
              onClick={() => createProject(message)}
              variant="secondary"
              className="bg-[var(--text-color)] py-0.5 text-[var(--black-1000)] disabled:opacity-80"
              size="sm"
              disabled={isCreatingDocument === message.id}
              style={{ width: "min-content", height: "100%" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                Create Project
              </div>
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={handleLike}
                  className={`cursor-pointer rounded-lg p-2 transition-colors hover:bg-[var(--agent-background-color)] ${
                    isLiked
                      ? "text-green-500"
                      : "text-[var(--secondary-text-color)]"
                  }`}
                >
                  <ThumbsUp
                    size={16}
                    fill={isLiked ? "currentColor" : "none"}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent style={{ zIndex: 1600 }}>
                {isLiked ? "Liked" : "Like"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={handleDislike}
                  className={`cursor-pointer rounded-lg p-2 transition-colors hover:bg-[var(--agent-background-color)] ${
                    isDisliked
                      ? "text-red-500"
                      : "text-[var(--secondary-text-color)]"
                  }`}
                >
                  <ThumbsDown
                    size={16}
                    fill={isDisliked ? "currentColor" : "none"}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent style={{ zIndex: 1600 }}>
                {isDisliked ? "Disliked" : "Dislike"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={handleCopy}
                  className={`cursor-pointer rounded-lg p-2 transition-colors hover:bg-[var(--agent-background-color)] ${
                    isCopied
                      ? "text-blue-500"
                      : "text-[var(--secondary-text-color)]"
                  }`}
                >
                  <Copy size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent style={{ zIndex: 1600 }}>
                {isCopied ? "Copied!" : "Copy"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
