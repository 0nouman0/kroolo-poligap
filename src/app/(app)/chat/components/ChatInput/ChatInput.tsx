"use client";

import { useState } from "react";
import { LucideSendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type {
  AgentType,
  MediaTypeProps,
  MultiSelectOption,
  SelectedLanguageType,
  SelectedLlmType,
} from "../../types/agent";
import { useAgentStore } from "../../store/agent-store";
import useAIChatStreamHandler from "./../../hooks/useAIStreamHandler";
import { LlmsList } from "./../../utils/utils";
import { AddMediaButton } from "./AddMediaButton";
import { LlmButton } from "./LlmButton";
import { MediaCard, MediaCardSkeleton } from "./MediaCard";
import { SelectLanguageButton } from "./SelectLanguageButton";
import { SelectMetaProperties } from "./SelectMetaProperties";
import { toastError } from "@/components/toast-varients";
import { cn } from "@/lib/utils";
import { useCompanyStore } from "@/stores/company-store";

const ChatInput = ({
  agent_id,
  selectedLanguage,
  selectedModel,
  medias,
  setSelectedModel,
  setSelectedLanguage,
  handleCreateConversation,
  selectedConversation,
  agno_id,
  messages,
  inputMessage,
  setInputMessage,
  isPublic,
  publicCompanyId,
  publicUserId,
  setMessages,
  agent_name,
  user_description,
  user_instructions,
  isTrained = false,
  isGlobalAgent = true,
  enabledKnowledge,
  setOpenGlobalModal,
  generateTitle,
}: AgentType) => {
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const companyId = selectedCompany?.companyId;
  const {
    chatInputRef,
    isStreaming,
    selectedMedia,
    setSelectedMedia,
    isLoadingUploadFile,
  } = useAgentStore();
  const selectedLlmModel = LlmsList.find(
    (model) => model.modelId === selectedModel
  );

  const isStreamingResponse = Boolean(isStreaming);

  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>([
    { id: "web-search", label: "Enable Web Search", enabled: false },
    { id: "research", label: "Enable Reasoning", enabled: false },
    {
      id: "file-attach",
      label: "Allow user to attach any file",
      enabled: false,
    },
  ]);
  const { handleStreamResponse } = useAIChatStreamHandler({
    agent_id,
    selectedLanguage: selectedLanguage ?? { code: "en", name: "English" },
    selectedModel,
    agent_name,
    inputMessage,
    isPublic,
    setInputMessage,
    medias,
    publicCompanyId,
    publicUserId,
    selectedOptions,
    selectedMedia,
    user_description,
    user_instructions,
    isTrained,
    messages,
    setMessages,
    isGlobalAgent,
    enabledKnowledge,
    handleCreateConversation,
    agno_id,
  });
  const handleChange = (updatedOptions: MultiSelectOption[]) => {
    setSelectedOptions(updatedOptions);
  };

  const handleLanguageSelect = (language: SelectedLanguageType) => {
    if (setSelectedLanguage) {
      setSelectedLanguage(language);
    }
  };
  const handleModelSelect = (model: SelectedLlmType) => {
    if (setSelectedModel) {
      setSelectedModel(model.modelId);
    }
  };

  const handleSubmit = async () => {
    // debugger;
    if (!(inputMessage || "").trim()) return;
    if (setOpenGlobalModal) {
      setOpenGlobalModal();
    }

    const currentMessage = inputMessage;
    setInputMessage("");
    try {
      let createdConvo = {
        _id: "",
        chatName: "",
        createdAt: new Date().toISOString(),
      };

      const messagesArray = messages || [];

      if (handleCreateConversation) {
        // debugger;
        if (messagesArray.length === 0 && selectedConversation?._id === "") {
          if (isGlobalAgent) {
            createdConvo = await handleCreateConversation(companyId ?? "");
          } else {
            createdConvo = await handleCreateConversation(agent_id);
          }
        } else if (
          messagesArray.length === 0 &&
          selectedConversation?._id !== ""
        ) {
          createdConvo = selectedConversation ?? {
            _id: "",
            chatName: "",
            createdAt: new Date().toISOString(),
          };
        } else {
          createdConvo = selectedConversation ?? {
            _id: "",
            chatName: "",
            createdAt: new Date().toISOString(),
          };
        }
      }
      if (messagesArray.length === 0) {
        if (generateTitle) {
          console.log("generateTitle =>");
          generateTitle(inputMessage);
        }
      }

      console.log("createdConvo ==>", currentMessage, createdConvo);
      await handleStreamResponse(currentMessage, createdConvo);
    } catch (error) {
      toastError(
        `Error in handleSubmit: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const handleRemoveMedia = (file: MediaTypeProps) => {
    setSelectedMedia(
      selectedMedia.filter((media: MediaTypeProps) => media._id !== file._id)
    );
  };
  const selectedOptionIds = selectedOptions
    .filter((option: MultiSelectOption) => option.enabled)
    .map((option) => option.id);

  return (
    <div className="font-inter mx-auto flex w-full max-w-6xl flex-col rounded-xl border p-3">
      <div className="flex">
        {isLoadingUploadFile && <MediaCardSkeleton />}
        {selectedMedia.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedMedia.length > 0 &&
              selectedMedia.map((file, index) => (
                <MediaCard
                  key={index}
                  file={file}
                  onClose={() => handleRemoveMedia(file)}
                />
              ))}
          </div>
        )}
      </div>

      <div className="flex w-full">
        <textarea
          placeholder="Ask anything..."
          value={inputMessage || ""}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !isStreamingResponse) {
              e.preventDefault();
              return handleSubmit();
            }
          }}
          className="max-h-24 min-h-16 flex-1 border-none bg-transparent px-0.5 text-[13px] text-[var(--text-color)] outline-none placeholder:text-[var(--secondary-text-color)]"
          disabled={!agent_id || isStreamingResponse}
          ref={chatInputRef}
        />
      </div>
      <div className="mt-2 flex flex-row justify-between">
        <div className="flex gap-2">
          <SelectMetaProperties
            options={selectedOptions}
            onChange={handleChange}
            disabled={isStreamingResponse}
          />
          {selectedOptionIds.includes("file-attach") && (
            <AddMediaButton
              agent_id={agent_id}
              disabled={isStreamingResponse}
            />
          )}

          <SelectLanguageButton
            value={selectedLanguage}
            disabled={isStreamingResponse}
            onSelect={handleLanguageSelect}
          />
          <LlmButton
            value={selectedLlmModel}
            disabled={isStreamingResponse}
            onSelect={handleModelSelect}
          />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button
                onClick={handleSubmit}
                disabled={
                  !agent_id ||
                  !(inputMessage || "").trim() ||
                  isStreamingResponse
                }
                size="icon"
                variant={
                  (inputMessage || "").trim().length > 0 ? "default" : "outline"
                }
                className={cn(
                  "size-7 p-1 transition-colors",
                  "cursor-pointer disabled:cursor-not-allowed",
                  (inputMessage || "").trim().length > 0
                    ? "bg-[var(--text-color)] text-white dark:text-black"
                    : "bg-transparent border border-input text-muted-foreground dark:text-muted-foreground",
                  "disabled:bg-transparent disabled:text-muted-foreground"
                )}
              >
                <LucideSendHorizontal className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent style={{ zIndex: 1600 }}>Send</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
export default ChatInput;
