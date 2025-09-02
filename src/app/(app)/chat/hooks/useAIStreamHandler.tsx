import type {
  AgentSelectedChatType,
  AgnoRequestDataType,
  MultiSelectOption,
  PlaygroundChatMessage,
  ReasoningSteps,
  ReferenceData,
  RunResponse,
  StrictSearchResponse,
  ToolCall,
  UseStreamHandlerProps,
} from "@/types/agent";
import { useCallback } from "react";
import { v4 as uuid } from "uuid";

import { useAgentStore } from "./../store/agent-store";
import { RunEvent } from "./../types/agent";
import { getJsonMarkdown, LlmsList, ToolLabelMap } from "./../utils/utils";
import useAIResponseStream from "./useAIResponseStream";
import useChatActions from "./useChatActions";
import { toastError } from "@/components/toast-varients";
import { useCompanyStore } from "@/stores/company-store";

const useAIChatStreamHandler = ({
  agent_id,
  agno_id,
  selectedLanguage,
  selectedModel,
  selectedOptions,
  setMessages,
  isTrained,
  selectedMedia,
  medias = [],
  isPublic,
  isGlobalAgent,
  publicCompanyId,
  publicUserId,
  agent_name,
  enabledKnowledge,
  user_description,
  user_instructions,
  setInputMessage,
}: UseStreamHandlerProps) => {
  const {
    setStreamingErrorMessage,
    setIsStreaming,
    saveChat,
    saveGlobalChat,
    setSelectedMedia,
  } = useAgentStore();
  const { addMessage, focusChatInput } = useChatActions({ setMessages });
  const { streamResponse } = useAIResponseStream();
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const companyId = selectedCompany?.companyId;

  const updateMessagesWithErrorState = useCallback(() => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage) {
        lastMessage.streamingError = true;
      }
      return newMessages;
    });
  }, [setMessages]);

  const extractToolCalls = useCallback((chunk: RunResponse): ToolCall[] => {
    const toolCalls: ToolCall[] = [];

    if (chunk.tools && Array.isArray(chunk.tools)) {
      const toolCallReferences: ReferenceData[] = [];
      chunk.tools.forEach((tool) => {
        if (tool.tool_name === "web_search_using_tavily" && tool.result) {
          const parsedResult = JSON.parse(tool.result) as StrictSearchResponse;
          if (Array.isArray(parsedResult.results)) {
            const referenceData: ReferenceData = {
              query: (parsedResult.query || tool.tool_args.query) ?? "",
              references: parsedResult.results.map((result) => ({
                url: result.url || "",
                title: result.title || "",
              })),
              time: Date.now(),
              tool_call_id: tool.tool_call_id,
            };
            toolCallReferences.push(referenceData);
          }
        }
        const tool_label = ToolLabelMap({ tool_name: tool.tool_name });
        toolCalls.push({
          ...tool,
          tool_label,
          tool_references: toolCallReferences,
        });
      });
    }

    if (chunk.tool) {
      let singleToolCallReference: ReferenceData | undefined;

      if (
        chunk.tool.tool_name === "web_search_using_tavily" &&
        chunk.tool.result
      ) {
        const parsedResult = JSON.parse(
          chunk.tool.result
        ) as StrictSearchResponse;
        if (Array.isArray(parsedResult.results)) {
          singleToolCallReference = {
            query: (parsedResult.query || chunk.tool.tool_args.query) ?? "",
            references: parsedResult.results.map((result) => ({
              url: result.url || "",
              title: result.title || "",
            })),
            time: Date.now(),
            tool_call_id: chunk.tool.tool_call_id,
          };
        }
      }

      const tool_label = ToolLabelMap({ tool_name: chunk.tool.tool_name });
      toolCalls.push({
        ...chunk.tool,
        tool_label,
        tool_references: singleToolCallReference
          ? [singleToolCallReference]
          : [],
      });
    }

    return toolCalls;
  }, []);

  const extractReferences = useCallback(
    (toolCalls: ToolCall[]): ReferenceData[] => {
      const references: ReferenceData[] = [];

      toolCalls.forEach((toolCall) => {
        if (
          toolCall.tool_name === "web_search_using_tavily" &&
          toolCall.result
        ) {
          const parsedResult = JSON.parse(
            toolCall.result
          ) as StrictSearchResponse;
          if (Array.isArray(parsedResult.results)) {
            const referenceData: ReferenceData = {
              query: (parsedResult.query || toolCall.tool_args.query) ?? "",
              references: parsedResult.results.map((result) => ({
                url: result.url || "",
                title: result.title || "",
              })),
              time: Date.now(),
              tool_call_id: toolCall.tool_call_id,
            };
            references.push(referenceData);
          }
        }
      });

      return references;
    },
    []
  );

  const handleStreamResponse = useCallback(
    async (
      input: string | FormData,
      selectedConversation: AgentSelectedChatType
    ) => {
      const tempId = uuid();
      setIsStreaming(tempId);
      interface RequestData extends AgnoRequestDataType {
        user_id: string | null;
        organization_id: string | null;
        agent_id: string;
        provider: string;
        model: string;
        web_search: boolean;
        reasoning: boolean;
        files?: string[];
        user_query: string;
        file_names?: string[];
        project_id?: string | boolean;
        project_name?: string | boolean;
        doc_id?: string | boolean;
        doc_name?: string | boolean;
        language: string;
        search_depth: string;
        enable: boolean;
        max_tokens: number;
        user_description?: string;
        user_instructions?: string;
      }

      const enabledOptionIds = selectedOptions
        .filter((option: MultiSelectOption) => option.enabled)
        .map((option) => option.id);
      const selectedLlmModel = LlmsList.find(
        (model) => model.modelId === selectedModel
      );
      const isTrainedAgent = isTrained
        ? agno_id
        : isGlobalAgent
        ? "Global_chat"
        : agent_name;
      const apiUrl = isTrained
        ? `${process.env.NEXT_PUBLIC_REACT_APP_API_URL_KROOLO_AI}/agno-agent`
        : isGlobalAgent
        ? `${process.env.NEXT_PUBLIC_REACT_APP_API_URL_KROOLO_AI}/global-chat-agno`
        : `${process.env.NEXT_PUBLIC_REACT_APP_API_URL_KROOLO_AI}/custom-agent`;
      const session_id = isPublic ? publicUserId : selectedConversation._id;
      const orgId = isPublic ? publicCompanyId : companyId;
      const userId = isPublic
        ? publicUserId
        : localStorage.getItem("user_id")?.replace(/^"(.*)"$/, "$1");

      const requestData: RequestData = {
        enable: enabledKnowledge ?? false,
        user_id: userId ?? "",
        organization_id: orgId ?? "",
        agent_id: isTrainedAgent ?? "",
        provider: selectedLlmModel?.provider ?? "openai",
        files: selectedMedia.map((file) => file._id),
        model: selectedLlmModel?.modelId ?? "gpt-4.1-mini",
        web_search: enabledOptionIds.includes("web-search"),
        reasoning: enabledOptionIds.includes("research"),
        user_query: "",
        session_id,
        language: selectedLanguage.name,
        search_depth: "advanced",
        max_tokens: 4000,
      };
      if (isTrained) {
        requestData.user_description = user_description ?? "";
        requestData.user_instructions = user_instructions ?? "";
      }

      if (typeof input === "string") {
        requestData.user_query = input;
      }
      if (medias.length > 0) {
        requestData.file_names = medias
          .filter(
            (file) => file.fileType !== "Project" && file.fileType !== "Doc"
          )
          .map((file) => file.fileName);
        requestData.project_id =
          medias.length > 0 &&
          medias.find((file) => file.fileType === "Project")?.projectId;
        requestData.project_name =
          medias.length > 0 &&
          medias.find((file) => file.fileType === "Project")?.fileName;
        requestData.doc_id =
          medias.length > 0 &&
          medias.find((file) => file.fileType === "Doc")?.documentId;
        requestData.doc_name =
          medias.length > 0 &&
          medias.find((file) => file.fileType === "Doc")?.fileName;
      }

      setMessages((prevMessages) => {
        if (prevMessages.length >= 1) {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage?.streamingError) {
            return prevMessages.slice(0, -1);
          }
        }
        return prevMessages;
      });

      addMessage({
        id: tempId,
        user_query: requestData.user_query,
        tool_calls: [],
        streamingError: false,
        created_at: Math.floor(Date.now() / 1000),
      });

      let lastContent = "";
      let completedMessage: PlaygroundChatMessage | null = null;
      let allToolCalls: ToolCall[] = [];
      let allReasoningSteps: ReasoningSteps[] = [];
      let allReferences: ReferenceData[] = [];

      try {
        if (!agent_id) return;

        await streamResponse({
          apiUrl: apiUrl,
          requestBody: requestData,
          onChunk: (chunk: RunResponse) => {
            if (chunk.event === RunEvent.RunResponseContent) {
              setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && typeof chunk.content === "string") {
                  const uniqueContent = chunk.content.replace(lastContent, "");

                  lastMessage.content ??= "";
                  lastMessage.content += uniqueContent;
                  lastContent = chunk.content;

                  const currentToolCalls = extractToolCalls(chunk);
                  if (currentToolCalls.length > 0) {
                    allToolCalls = [...allToolCalls, ...currentToolCalls];
                    lastMessage.tool_calls = [...allToolCalls];
                  }

                  if (chunk.extra_data?.reasoning_steps) {
                    allReasoningSteps = [
                      ...allReasoningSteps,
                      ...chunk.extra_data.reasoning_steps,
                    ];
                    lastMessage.extra_data = {
                      ...lastMessage.extra_data,
                      reasoning_steps: allReasoningSteps,
                    };
                  }
                  if (chunk.extra_data?.references) {
                    allReferences = [
                      ...allReferences,
                      ...chunk.extra_data.references,
                    ];
                    lastMessage.extra_data = {
                      ...lastMessage.extra_data,
                      references: allReferences,
                    };
                  }

                  lastMessage.created_at =
                    chunk.created_at ?? lastMessage.created_at;
                  if (chunk.images) {
                    lastMessage.images = chunk.images;
                  }
                  if (chunk.videos) {
                    lastMessage.videos = chunk.videos;
                  }
                  if (chunk.audio) {
                    lastMessage.audio = chunk.audio;
                  }
                } else if (
                  lastMessage &&
                  typeof chunk.content !== "string" &&
                  !!chunk.content
                ) {
                  const jsonBlock = getJsonMarkdown(chunk.content);

                  lastMessage.content ??= "";
                  lastMessage.content += jsonBlock;
                  lastContent = jsonBlock;
                } else if (
                  typeof chunk.response_audio?.transcript === "string"
                ) {
                  const transcript = chunk.response_audio.transcript;
                  if (lastMessage) {
                    lastMessage.response_audio = {
                      ...lastMessage.response_audio,
                      transcript:
                        lastMessage.response_audio?.transcript + transcript,
                    };
                  }
                }
                return newMessages;
              });
            } else if (chunk.event === RunEvent.ToolCallCompleted) {
              const completedToolCalls = extractToolCalls(chunk);
              if (completedToolCalls.length > 0) {
                allToolCalls = [...allToolCalls, ...completedToolCalls];

                const newReferences = extractReferences(completedToolCalls);
                if (newReferences.length > 0) {
                  allReferences = [...allReferences, ...newReferences];
                }

                setMessages((prevMessages) => {
                  const newMessages = [...prevMessages];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage) {
                    lastMessage.tool_calls = [...allToolCalls];
                    lastMessage.extra_data = {
                      ...lastMessage.extra_data,
                      references: allReferences,
                    };
                  }
                  return newMessages;
                });
              }
            } else if (chunk.event === RunEvent.ReasoningStep) {
              if (chunk.content && typeof chunk.content === "object") {
                const reasoningStep = chunk.content as ReasoningSteps;
                allReasoningSteps = [...allReasoningSteps, reasoningStep];

                setMessages((prevMessages) => {
                  const newMessages = [...prevMessages];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage) {
                    lastMessage.extra_data = {
                      ...lastMessage.extra_data,
                      reasoning_steps: allReasoningSteps,
                    };
                  }
                  return newMessages;
                });
              }
            } else if (chunk.event === RunEvent.RunError) {
              updateMessagesWithErrorState();
              const errorContent = chunk.content as string;
              setStreamingErrorMessage(errorContent);
            } else if (chunk.event === RunEvent.RunCompleted) {
              setMessages((prevMessages) => {
                const newMessages = prevMessages.map((message, index) => {
                  if (index === prevMessages.length - 1) {
                    let updatedContent: string;
                    if (typeof chunk.content === "string") {
                      updatedContent = chunk.content;
                    } else {
                      try {
                        updatedContent = JSON.stringify(chunk.content);
                      } catch {
                        updatedContent = "Error parsing response";
                      }
                    }

                    const finalToolCalls = extractToolCalls(chunk);
                    if (finalToolCalls.length > 0) {
                      allToolCalls = [...allToolCalls, ...finalToolCalls];

                      const finalReferences = extractReferences(finalToolCalls);
                      if (finalReferences.length > 0) {
                        allReferences = [...allReferences, ...finalReferences];
                      }
                    }

                    const updatedMessage = {
                      ...message,
                      content: updatedContent,
                      conversation_id: session_id,
                      tool_calls:
                        allToolCalls.length > 0
                          ? allToolCalls
                          : message.tool_calls,
                      images: chunk.images ?? message.images,
                      videos: chunk.videos ?? message.videos,
                      response_audio: chunk.response_audio,
                      created_at: chunk.created_at ?? message.created_at,
                      extra_data: {
                        reasoning_steps:
                          chunk.extra_data?.reasoning_steps ??
                          allReasoningSteps,
                        references:
                          chunk.extra_data?.references ?? allReferences,
                      },
                    };
                    completedMessage = updatedMessage;
                    return updatedMessage;
                  }
                  return message;
                });

                return newMessages;
              });
            }
          },
          onError: (error) => {
            updateMessagesWithErrorState();
            setStreamingErrorMessage(error.message);
          },
          onComplete: () => {
            if (completedMessage && !completedMessage.streamingError) {
              setSelectedMedia([]);
              setInputMessage("");
              if (!isPublic) {
                if (isGlobalAgent) {
                  // debugger;
                  console.log("completedMessage => ", completedMessage);
                  saveGlobalChat(completedMessage).catch((error) => {
                    toastError(
                      `Chat Creation Failed: ${
                        error instanceof Error ? error.message : String(error)
                      }`
                    );
                  });
                } else {
                  saveChat(completedMessage).catch((error) => {
                    toastError(
                      `Chat Creation Failed: ${
                        error instanceof Error ? error.message : String(error)
                      }`
                    );
                  });
                }
              }
            }
          },
        });
      } catch (error) {
        updateMessagesWithErrorState();
        setStreamingErrorMessage(
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        focusChatInput();
        setIsStreaming("");
      }
    },
    [
      setMessages,
      addMessage,
      updateMessagesWithErrorState,
      isPublic,
      streamResponse,
      agent_id,
      selectedLanguage,
      agno_id,
      saveGlobalChat,
      isGlobalAgent,
      isTrained,
      setSelectedMedia,
      selectedMedia,
      selectedModel,
      enabledKnowledge,
      selectedOptions,
      agent_name,
      saveChat,
      setStreamingErrorMessage,
      setIsStreaming,
      focusChatInput,
      setInputMessage,
      extractToolCalls,
      extractReferences,
      publicCompanyId,
      publicUserId,
      user_description,
      user_instructions,
      companyId,
      medias,
    ]
  );

  return { handleStreamResponse };
};

export default useAIChatStreamHandler;
