import React, { useState, useRef } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { TiDocumentAdd } from "react-icons/ti";
import { TbFileUpload } from "react-icons/tb";
// import LoadingSpinner from "../../../../../LoadingSpinner";
// import { toastWarning } from "../../../../../toast";
// import { uploadMemeTypes } from "../../Utils";
import FileRowLoader from "../knowledge-loader/FileRowLoader";
import { AgentUploadFileRow } from "../AgentUploadFileRow";
// import useAiAgentsStore from "../../../../../../store/ai-agents-store";
// import useGetMediaList from "../../hooks/useGetMediaList";
import LoadingSpinner from "../knowledge-loader/LoadingSpinner";
import { toastWarning } from "@/components/toast-varients";
import { uploadMemeTypes } from "@/app/(app)/chat/utils/utils";
import useAiAgentsStore from "@/stores/ai-agents-store";
import useGetMediaList from "../hooks/useGetMediaList";

interface FileUploadSectionProps {
  from: string;
  id: string;
  enabledKnowledge: boolean;
}

interface MediaItem {
  fileType?: string;
  _id?: string;
  [key: string]: unknown;
}

export const FileUploadSection = ({
  from,
  id,
  enabledKnowledge,
}: FileUploadSectionProps) => {
  const {
    createdAgentDetailData,
    addMediaDataAPI,
    isLoadingSavingMedia,
    uploadsArray,
  } = useAiAgentsStore();

  const mediaArray: MediaItem[] =
    from === "chat-with-agent" ? createdAgentDetailData?.media : uploadsArray;
  const mediaList = useGetMediaList(mediaArray, "files");

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!uploadMemeTypes.includes(file.type)) {
      toastWarning(
        "The following file was not uploaded: ",
        `'${file.name}' is not a valid file.`
      );
      return;
    }

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      await addMediaDataAPI(formData, id, file?.name);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      handleFileUpload(selectedFiles[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length) {
      handleFileUpload(droppedFiles[0]);
    }
  };

  const handleButtonClick = () => {
    if (isLoadingSavingMedia === "files") return;
    fileInputRef.current?.click();
  };

  return (
    <Stack
      direction="column"
      gap={1}
      width="100%"
      sx={{
        border: "1px solid var(--card-border)",
        borderRadius: "8px",
        padding: 1.5,
      }}
      className={!enabledKnowledge ? "kroolo-disabled" : ""}
    >
      <Stack direction="row" gap={0.5}>
        <TiDocumentAdd
          style={{
            width: 20,
            height: 20,
            color: "var(--secondary-text-color)",
          }}
        />
        <Typography fontWeight={500} fontSize="14px" color="var(--text-color)">
          Add Files
        </Typography>
      </Stack>

      <Stack direction="column" gap={1}>
        <Box
          onClick={handleButtonClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{
            width: "100%",
            padding: "36px 12px",
            border: "1px dashed var(--card-border)",
            borderRadius: "6px",
            cursor: isLoadingSavingMedia === "files" ? "default" : "pointer",
            color: "var(--text-color)",
            background: isDragging
              ? "var(--url-color)"
              : "var(--agent-background-color)",
            "&:hover": {
              background: "var(--agent-background-color)",
              opacity: isLoadingSavingMedia === "files" ? 1 : 0.8,
            },
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            hidden
            disabled={isLoadingSavingMedia === "files"}
          />

          <Stack
            direction="column"
            alignItems="center"
            sx={{ flexGrow: 1, gap: 0.75 }}
          >
            {isLoadingSavingMedia === "files" ? (
              <LoadingSpinner noMargin />
            ) : (
              <TbFileUpload
                size={28}
                color="var(--secondary-text-color)"
                strokeWidth={1.5}
              />
            )}
            <Typography
              className="themed-text-color centered-text"
              fontSize={12}
              fontWeight={500}
            >
              Drag and Drop files here, or click to select files
            </Typography>
            <Typography
              className="themed-secondary-text-color centered-text"
              fontSize={11}
            >
              Attach (.pdf, .csv , .xls, .ppt, .docx, .png , .jpg)
            </Typography>
          </Stack>
        </Box>

        <Stack direction="column">
          {isLoadingSavingMedia === "files" && <FileRowLoader />}
          {mediaList?.length > 0 &&
            mediaList?.map((media, index) => (
              <AgentUploadFileRow
                from={from}
                id={id}
                media={
                  media as unknown as {
                    _id: string;
                    fileName: string;
                    fileType: string;
                    fileSize?: string;
                  }
                }
                key={String(media?._id || index)}
              />
            ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
