"use client";

import { useRef } from "react";
import { LucideCirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAgentStore } from "../../store/agent-store";
import { uploadMemeTypes } from "./../../utils/utils";
import { toastError, toastSuccess } from "@/components/toast-varients";

interface AddMediaButtonProps {
  agent_id?: string;
  disabled?: boolean;
}

export const AddMediaButton = ({
  agent_id,
  disabled = false,
}: AddMediaButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadMedia, isLoadingUploadFile, setIsLoadingUploadFile } =
    useAgentStore();

  const handleFileSelect = () => {
    if (disabled || !agent_id) return;
    fileInputRef.current?.click();
  };

  const validateFileType = (file: File): boolean => {
    return uploadMemeTypes.includes(file.type);
  };

  const getFileTypeDisplayName = (mimeType: string): string => {
    const typeMap: Record<string, string> = {
      "application/pdf": "PDF",
      "application/vnd.ms-powerpoint": "PowerPoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "PowerPoint",
      "text/csv": "CSV",
      "application/vnd.ms-excel": "Excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "Excel",
      "text/plain": "Text",
      "application/msword": "Word",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "Word",
      "image/jpeg": "Image",
      "image/png": "Image",
    };
    return typeMap[mimeType] ?? "File";
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !agent_id) {
      console.log("No file selected or no agent_id:", { file, agent_id });
      return;
    }

    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validateFileType(file)) {
      console.error("Invalid file type:", file.type);
      toastError(
        `Unsupported file type. Please upload: ${getFileTypeDisplayName(
          file.type
        )} files only.`
      );
      return;
    }
    try {
      setIsLoadingUploadFile(true);
      const formData = new FormData();
      formData.append("file", file);
      const uploadData = {
        file: formData,
      };
      console.log("Uploading file:", file.name);
      const result = await uploadMedia(uploadData);

      if (result instanceof Error) {
        console.error("Upload failed:", result.message);
        toastError(`Upload failed: ${result.message}`);
      } else {
        console.log("Upload successful:", result);
        toastSuccess(`${file.name} uploaded successfully!`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toastError(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsLoadingUploadFile(false);
    }
  };

  const acceptedTypes = uploadMemeTypes.join(",");

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileChange}
        style={{ display: "none" }}
        disabled={disabled || isLoadingUploadFile || !agent_id}
      />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes}
              onChange={handleFileChange}
              style={{ display: "none" }}
              disabled={disabled || isLoadingUploadFile || !agent_id}
            />

            <Button
              onClick={handleFileSelect}
              disabled={disabled || isLoadingUploadFile || !agent_id}
              size="sm"
              className="p-0 hover:bg-transparent h-full"
              variant="ghost"
            >
              <LucideCirclePlus className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent style={{ zIndex: 1600 }}>Add file</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
