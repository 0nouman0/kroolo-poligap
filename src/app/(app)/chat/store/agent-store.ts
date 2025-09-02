import type {
  ExtractMediaParams,
  MediaTypeProps,
  PlaygroundChatMessage,
  UploadMediaParams,
  // UploadMediaResponse,
} from "@/types/agent";
import { create } from "zustand";

import { krooloHttpClient } from "./../utils/https";
import { toastError } from "@/components/toast-varients";

interface AgentStore {
  streamingErrorMessage: string;
  isLoadingUploadFile: boolean;
  setStreamingErrorMessage: (streamingErrorMessage: string) => void;
  setIsLoadingUploadFile: (isLoadingUploadFile: boolean) => void;
  isStreaming: string;
  selectedMedia: MediaTypeProps[];
  setSelectedMedia: (selectedMedia: MediaTypeProps[]) => void;
  setIsStreaming: (isStreaming: string) => void;
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>;
  extractContentAPI: (apiData: ExtractMediaParams) => Promise<Response | Error>;
  saveChat: (apiData: PlaygroundChatMessage) => Promise<void | Error>;
  saveGlobalChat: (apiData: PlaygroundChatMessage) => Promise<void | Error>;
  uploadMedia: (apiData: UploadMediaParams) => Promise<MediaTypeProps | Error>;
}

export const useAgentStore = create<AgentStore>()((set) => ({
  streamingErrorMessage: "",
  isLoadingUploadFile: false,
  setStreamingErrorMessage: (streamingErrorMessage) =>
    set(() => ({ streamingErrorMessage })),
  isStreaming: "",
  selectedMedia: [],
  setSelectedMedia: (selectedMedia) => set(() => ({ selectedMedia })),
  setIsStreaming: (isStreaming) => set(() => ({ isStreaming })),
  setIsLoadingUploadFile: (isLoadingUploadFile) =>
    set(() => ({ isLoadingUploadFile })),
  chatInputRef: { current: null },

  extractContentAPI: async (apiData: ExtractMediaParams) => {
    try {
      const resp = await fetch(
        process.env.NEXT_PUBLIC_REACT_APP_API_URL_KROOLO_AI +
          "/extract-file-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        }
      );
      return resp;
    } catch (error) {
      return error as Error;
    }
  },
  uploadMedia: async (
    apiData: UploadMediaParams
  ): Promise<MediaTypeProps | Error> => {
    try {
      console.log("uploadMedia called with:", apiData);

      // Use local S3 upload API instead of external endpoint
      const resp = await fetch("/api/s3/file-upload", {
        method: "POST",
        body: apiData.file,
      });

      const data = await resp.json();
      console.log("S3 upload response:", data);

      if (data.success) {
        // const extractContent = await useAgentStore
        //   .getState()
        //   .extractContentAPI({ file_id: data._id });
        // if (!(extractContent instanceof Response) || !extractContent.ok) {
        //   set((state) => ({
        //     selectedMedia: state.selectedMedia.filter(
        //       (media) => media._id !== data._id
        //     ),
        //   }));
        // } else {
        //   set((state) => ({
        //     selectedMedia: [...state.selectedMedia, data],
        //   }));
        // }

        // return data;

        // Create a MediaTypeProps object from the S3 response
        const mediaData: MediaTypeProps = {
          _id: crypto.randomUUID(), // Generate a temporary ID
          fileUrl: data.data.fileUrl,
          fileName: data.data.fileName,
          fileType: "pdf",
          companyId: "", // Will be set when needed
          createdBy: "", // Will be set when needed
          fileSize: data.data.size?.toString() || "",
        };

        // Add to selected media
        set((state) => ({
          selectedMedia: [...state.selectedMedia, mediaData],
        }));

        return mediaData;
      } else {
        console.error("S3 upload failed:", data);
        return new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("uploadMedia error:", error);
      return error as Error;
    }
  },
  saveChat: async (apiData: PlaygroundChatMessage) => {
    try {
      await krooloHttpClient.post("/kroolo-agent/create-chat", apiData);
    } catch (error) {
      toastError(
        `Chat Creation Failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  },
  saveGlobalChat: async (apiData: PlaygroundChatMessage) => {
    try {
      // debugger;
      // await krooloHttpClient.post("/kroolo-ai/create-chat", apiData);
      const res = await fetch("/api/ai-chat/create-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

      const resp = await res.json();
      console.log("save global chat resp =>", resp);
    } catch (error) {
      toastError(
        `Chat Creation Failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  },
}));
