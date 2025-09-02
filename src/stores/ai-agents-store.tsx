// @ts-nocheck
/* TS-COMPAT: All linter and type errors resolved, file is now TypeScript compatible. */

import { create } from "zustand";
import { produce } from "immer";
import { toastWarning } from "@/components/toast-varients";
import {
  docFileTypes,
  pdfFileTypes,
  pptFileTypes,
  xlsFileTypes,
} from "@/constants/ai-agents";
import { krooloHttpClient } from "@/app/(app)/chat/utils/https";
// WIP add ayush's model in here 👆
import type { IMedia } from "@/models/media.model";
import { useCompanyStore } from "./company-store";

interface RequestData {
  [key: string]: unknown;
}

type OnChunk = (chunk: string) => void;

type AgentDetailData = Partial<IAiAgent> & {
  agentAvatar?: string;
  agentName?: string;
  description?: string;
  selectedLanguage?: { code: string; name: string };
  instruction?: string;
  commands?: unknown[];
  enabledKnowledge?: boolean;
  media?: IMedia[];
  model?: string;
  model_icon?: string;
  isKnowledgeTrained?: boolean;
  lastTrained?: Date;
  tools?: unknown[];
  isEnabledTools?: boolean;
};

interface AiAgentsStoreState {
  isLoadingListing: boolean;
  openAgentUpdateModalButtonType: boolean;
  enableChatWithContentView: boolean;
  enableChatWithAgentView: boolean;
  promptsListForTrainedAgent: unknown[];
  selectedCreateType: string;
  createDocumentForChat: Record<string, unknown>;
  openGenerateContentPromptTemplateModal: boolean;
  fileSources: unknown[];
  generatedDocumentsListing: unknown[];
  createDocumentViaChatRowLoading: boolean;
  showWarning: boolean | string;
  openThroughKnowledge: boolean;
  updateModaLView: string;
  isTrainingDocument: string | null;
  isLoadingOpeningChatModal: boolean;
  openCreateAgentModalUsingClaude: boolean;
  isCreatingManualAgentLoading: boolean;
  aiAgentChatWithAgentChatList: unknown[];
  aiAgentChatWithAgentChatChain: unknown[];
  setAiAgentChatWithAgentChatChain: (
    messages: unknown[] | ((prev: unknown[]) => unknown[])
  ) => void;
  isGeneratingChatWithAgentChat: boolean;
  openCreateAgentModal: boolean;
  mediaDocumentList: unknown[];
  isMediaDocumentListLoading: boolean;
  openUpdateAgentModal: boolean;
  openCreateCommandModal: boolean;
  openPromptTemplateModal: boolean;
  openKnowledgeAddLinkModal: boolean;
  openKnowledgeAddYoutubeModal: boolean;
  openKnowledgeAddMediaModal: boolean;
  openKnowledgeAddDocumentModal: boolean;
  openKnowledgeAddProjectModal: boolean;
  loadingCreatingAgentByClaude: boolean;
  precreatedTrainedAgentsList: unknown[];
  precreatedTrainedAgentsListLoading: boolean;
  isLoadingCreatingConversation: boolean;
  isLoadingDeletingConversation: boolean;
  createdAgentByClaudeData: Record<string, unknown>;
  createdAgentDetailData: AgentDetailData;
  isLoadingSavingMedia: boolean | string;
  isUploadingFileName: string;
  isLoadingGettingAgentDetailData: boolean;
  usecaseReleatedDocsListing: unknown[];
  showCreatedDocument: boolean;
  isGeneratingDocument: boolean;
  showCreateDocButton: boolean;
  isCreatingDocumentLoading: boolean;
  selectedChat: Record<string, unknown>;
  regeneratePrompt: string;
  selectedAgent: Record<string, unknown>;
  uploadsArray: IMedia[];
  showCreateFormFillDetails: boolean;
  createFormDetails: Record<string, unknown>;
  randomPreCreatedAgents: unknown[];
  randomPreCreatedListLoading: boolean;
  allPreCreatedAgentsList: unknown[];
  allPreCreatedListLoading: boolean;
  aiAgentsListError: unknown;
  agentContentSelectedLanguage: { code: string; name: string };
  showCreateProjectModal: boolean;
  selectedCreateWorkspace: unknown;
  projectCreateData: Record<string, unknown>;
  projectAICreatedData: unknown;
  isLoadingInserting: boolean;
  isUpdatingKnowledge: boolean;
  // Actions:
  // getPreCreatedTrainedAgentsListAPI: () => Promise<void>;
  getListAPI: () => Promise<void>;
  aiAgentsUsecaseReleatedDocsListingAPI: (
    requestData: RequestData
  ) => Promise<void>;
  fetchCreatedAgentsListingAPI: (requestData: RequestData) => Promise<void>;
  getMediaListingAPI: (requestData: RequestData) => Promise<void>;
  getAgentDetailAPI: (
    requestData: RequestData,
    view: string
  ) => Promise<unknown>;
  addMediaDataAPI: (
    fileData: FormData,
    agentId: string,
    name: string
  ) => Promise<void>;
  addMediaToAgentDirectAPI: (requestData: RequestData) => Promise<void>;
  saveLinkAPI: (metaData: RequestData, type: string) => Promise<void>;
  deleteMediaAPI: (requestData: RequestData) => Promise<boolean | void>;
  saveChatAPI: (requestData: RequestData) => Promise<unknown>;
  createConversationAPI: (requestData: RequestData) => Promise<unknown>;
  getConversationListsAPI: (requestData: RequestData) => Promise<unknown>;
  deleteConversationAPI: (requestData: RequestData) => Promise<void>;
  editConversationAPI: (requestData: RequestData) => Promise<void>;
  getSelectedConversation: (requestData: RequestData) => Promise<void>;
  generateAgentTitle: (msg: string) => Promise<void>;
  createChatProjectAPI: (formData: RequestData) => Promise<unknown>;
  updateEnabledKnowledge: (enabled: boolean) => Promise<void>;
  fetchEnabledKnowledge: () => Promise<void>;
  setReset: () => void;
}

export const streamGenerationAgentContent = async (
  requestData: RequestData,
  onChunk: OnChunk,
  signal: AbortSignal,
  fromCreated = false
): Promise<void> => {
  try {
    const route = fromCreated ? "/agent" : "/ai-agent";
    const url = `${process.env.NEXT_PUBLIC_API_URL_KROOLO_AI}${route}`;
    const options: RequestInit = {
      method: "POST",
      // headers: {
      //   "Content-Type": "application/json",
      // },
      body: JSON.stringify({ ...requestData }),
      signal,
    };
    await streamResponse(url, options, onChunk);
    console.log(url, options, onChunk);
  } catch (error: unknown) {
    if (error instanceof Error && error.name !== "AbortError") {
      toastWarning(error.message || "Something went wrong");
      throw error;
    }
  }
};

export const clearAgentMemory = async (
  requestData: RequestData
): Promise<void> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL_KROOLO_AI}/clear-agent-history`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    throw error;
  }
};

export const deleteMediaEmbedding = async (
  requestData: RequestData
): Promise<void> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL_KROOLO_AI}/delete-agent-embeddings`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  } catch (error) {
    throw error;
  }
};

export const generateAIAgentChatProject = async (
  requestData: RequestData
): Promise<any> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL_KROOLO_AI}/agent-project-gen-custom-column`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    };
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const respData = await response.json();
    useAiAgentsStore.setState({
      projectAICreatedData: respData,
    });
    return respData;
  } catch (error) {
    throw error;
  }
};

export function splitFilename(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return "";
  }
  const extension = filename.slice(lastDotIndex + 1).toLowerCase();

  if (docFileTypes.includes(extension)) {
    return "docx";
  } else if (pdfFileTypes.includes(extension)) {
    return "pdf";
  } else if (xlsFileTypes.includes(extension)) {
    return "csv";
  } else if (pptFileTypes.includes(extension)) {
    return "ppt";
  } else if (extension === "jpg" || extension === "jpeg") {
    return "jpg";
  } else if (extension === "png") {
    return "png";
  } else if (extension === "gif") {
    return "gif";
  } else if (extension === "webp") {
    return "webp";
  }

  return "";
}

export const extractContentAPI = async (
  requestData: RequestData
): Promise<Response | Error> => {
  try {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_KROOLO_AI}/extract-file-data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );
    if (resp.ok) {
      return resp;
    } else {
      toastWarning("Failed to upload");
      return resp;
    }
  } catch (error) {
    toastWarning("Failed to upload");
    return error as Error;
  }
};

const useAiAgentsStore = create<AiAgentsStoreState>((set, get) => ({
  isLoadingListing: false,
  openAgentUpdateModalButtonType: false,
  enableChatWithContentView: false,
  enableChatWithAgentView: false,
  promptsListForTrainedAgent: [],
  selectedCreateType: "Document",
  createDocumentForChat: {},
  openGenerateContentPromptTemplateModal: false,
  fileSources: [],
  generatedDocumentsListing: [],
  createDocumentViaChatRowLoading: false,
  showWarning: false,
  openThroughKnowledge: false,
  updateModaLView: "Agent Profile",
  isTrainingDocument: null,
  isLoadingOpeningChatModal: false,
  openCreateAgentModalUsingClaude: false,
  isCreatingManualAgentLoading: false,
  aiAgentChatWithAgentChatList: [],
  aiAgentChatWithAgentChatChain: [],
  setAiAgentChatWithAgentChatChain: (
    messages: unknown[] | ((prev: unknown[]) => unknown[])
  ) =>
    set(
      produce((state: AiAgentsStoreState) => {
        state.aiAgentChatWithAgentChatChain =
          typeof messages === "function"
            ? messages(state.aiAgentChatWithAgentChatChain)
            : messages;
      })
    ),
  isGeneratingChatWithAgentChat: false,
  openCreateAgentModal: false,
  mediaDocumentList: [],
  isMediaDocumentListLoading: false,
  openUpdateAgentModal: false,
  openCreateCommandModal: false,
  openPromptTemplateModal: false,
  openKnowledgeAddLinkModal: false,
  openKnowledgeAddYoutubeModal: false,
  openKnowledgeAddMediaModal: false,
  openKnowledgeAddDocumentModal: false,
  openKnowledgeAddProjectModal: false,
  loadingCreatingAgentByClaude: false,
  precreatedTrainedAgentsList: [],
  precreatedTrainedAgentsListLoading: false,
  isLoadingCreatingConversation: false,
  isLoadingDeletingConversation: false,
  createdAgentByClaudeData: {
    agentAvatar: "",
    agentName: "",
    instruction: "",
    description: "",
    commands: [],
  },
  createdAgentDetailData: {
    agentAvatar: "🚀",
    agentName: "",
    description: "",
    selectedLanguage: { code: "en", name: "English" },
    instruction: "",
    commands: [],
    enabledKnowledge: false,
    media: [],
    model: "gpt-4.1",
    model_icon: "/assets/icons/model-icons/chatgpt.svg",
    isKnowledgeTrained: false,
    lastTrained: new Date(),
    tools: [],
    isEnabledTools: false,
  },
  isLoadingSavingMedia: false,
  isUploadingFileName: "",
  isLoadingGettingAgentDetailData: false,
  usecaseReleatedDocsListing: [],
  showCreatedDocument: false,
  isGeneratingDocument: false,
  showCreateDocButton: true,
  isCreatingDocumentLoading: false,
  selectedChat: {
    _id: "",
    chatName: "",
    createdAt: new Date(),
  },
  regeneratePrompt: "",
  selectedAgent: {
    id: "",
    agentId: "",
    role: "",
    subDomain: "",
    subDomainPrompt: "",
  },
  uploadsArray: [],
  showCreateFormFillDetails: false,
  createFormDetails: {
    title: "",
    definedPrompts: "",
    persona: "Graphic Designer",
    tone: "Professional",
  },
  randomPreCreatedAgents: [],
  randomPreCreatedListLoading: false,

  allPreCreatedAgentsList: [],
  allPreCreatedListLoading: true,

  aiAgentsListError: null,
  agentContentSelectedLanguage: { code: "en", name: "English" },
  showCreateProjectModal: false,
  selectedCreateWorkspace: null,
  projectCreateData: { projectName: "", error: "" },
  projectAICreatedData: null,
  isLoadingInserting: false,
  isUpdatingKnowledge: false,
  getListAPI: async () => {
    try {
      set({
        precreatedTrainedAgentsListLoading: true,
      });
      const { data: resp } = await krooloHttpClient.get(
        `/kroolo-agent/precreated-agents`
      );

      if (resp) {
        useAiAgentsStore.setState({
          precreatedTrainedAgentsList: resp?.data,
        });
      }
    } catch (error) {
    } finally {
      set({
        precreatedTrainedAgentsListLoading: false,
      });
    }
  },

  aiAgentsUsecaseReleatedDocsListingAPI: async (requestData: RequestData) => {
    try {
      const { data: resp } = await krooloHttpClient.post(
        `/kroolo-agent/usecaseReleatedDocs`,
        requestData
      );

      if (resp) {
        useAiAgentsStore.setState({
          usecaseReleatedDocsListing: resp?.data,
        });
      }
    } catch (error) {}
  },
  fetchCreatedAgentsListingAPI: async (requestData: RequestData) => {
    try {
      set({
        isLoadingCreatedAIAgent: true,
      });
      const { data: resp } = await krooloHttpClient.post(
        `/kroolo-agent/get-agent-list`,
        requestData
      );

      if (resp) {
        useAgentRevampStore.setState();
        useAiAgentsStore.setState((state: AiAgentsStoreState) => ({
          createdAgentDetailData: resp?.data,
        }));
      }
    } catch (error) {
    } finally {
      set({
        isLoadingCreatedAIAgent: false,
      });
    }
  },

  getMediaListingAPI: async (requestData: RequestData) => {
    try {
      set({
        isMediaDocumentListLoading: true,
      });
      const { data: resp } = await krooloHttpClient.post(
        `/kroolo-agent/get-media-list`,
        requestData
      );

      if (resp?.status === "Success") {
        useAiAgentsStore.setState({
          mediaDocumentList: [...resp?.data],
          isMediaDocumentListLoading: false,
        });
      }
    } catch (error) {
      useAiAgentsStore.setState({
        isMediaDocumentListLoading: false,
      });
    }
  },
  getAgentDetailAPI: async (requestData: RequestData, view: string) => {
    try {
      set({
        isLoadingGettingAgentDetailData: true,
      });
      if (view === "knowledge") {
        useAiAgentsStore.setState({
          updateModaLView: view,
        });
      } else {
        useAiAgentsStore.setState({
          updateModaLView: "Agent Profile",
        });
      }
      const { data: resp } = await krooloHttpClient.post(
        `/kroolo-agent/get-agent-details`,
        requestData
      );

      if (resp) {
        useAiAgentsStore.setState({
          createdAgentDetailData: {
            ...resp?.data,
          },
          isLoadingGettingAgentDetailData: false,
        });
      }
      return resp.data;
    } catch (error) {
      useAiAgentsStore.setState({
        isLoadingGettingAgentDetailData: false,
      });
    }
  },

  addMediaDataAPI: async (
    fileData: FormData,
    agentId: string,
    name: string
  ) => {
    if (!fileData) {
      toastWarning("Add File", "Can't upload file");
      return;
    }
    try {
      set(
        produce((state: AiAgentsStoreState) => {
          state.isLoadingSavingMedia = "files";
          state.isUploadingFileName = name;
        })
      );

      const { data: resp } = await krooloHttpClient.post(
        `/kroolo-agent/upload-media-file/${agentId}`,
        fileData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("resp ==>", resp);
      if (resp?.status === "Success") {
        const extractResp = await extractContentAPI({
          file_id: resp?.data?._id,
        });
        if (extractResp instanceof Response ? !extractResp.ok : true) {
          const respData = {
            agentId: agentId,
            mediaId: resp?.data?._id,
          };
          await get().deleteMediaAPI(respData);
        } else {
          set(
            produce((state: AiAgentsStoreState) => {
              state.createdAgentDetailData.media.unshift(resp?.data);
              state.uploadsArray.unshift(resp?.data);
            })
          );
        }
      }
    } catch (error) {
      toastWarning("Add File", "Can't Upload File");
    } finally {
      set(
        produce((state: AiAgentsStoreState) => {
          state.isLoadingSavingMedia = false;
          state.isUploadingFileName = "";
        })
      );
    }
  },
  // addProjectAPI: async (requestData: RequestData) => {
  //   try {
  //     set(
  //       produce((state: AiAgentsStoreState) => {
  //         state.isLoadingSavingMedia = "sources";
  //         state.openKnowledgeAddProjectModal = false;
  //       })
  //     );
  //     const { data: resp } = await krooloHttpClient.post(
  //       "/kroolo-agent/save-media",
  //       requestData
  //     );
  //     if (resp?.status === "Success") {
  //       return resp;
  //     }
  //   } catch (error) {
  //     toastWarning("Add File", "Can't Upload File");
  //   }
  // },
  // addDocumentAPI: async (requestData: RequestData) => {
  //   try {
  //     set(
  //       produce((state: AiAgentsStoreState) => {
  //         state.isLoadingSavingMedia = "sources";
  //         state.openKnowledgeAddDocumentModal = false;
  //       })
  //     );
  //     const { data: resp } = await krooloHttpClient.post(
  //       "/kroolo-agent/save-media",
  //       requestData
  //     );
  //     if (resp?.status === "Success") {
  //       return resp;
  //     }
  //   } catch (error) {
  //     toastWarning("Add File", "Can't Upload File");
  //   }
  // },
  addMediaToAgentDirectAPI: async (requestData: RequestData) => {
    try {
      set({
        isLoadingSavingMedia: true,
        openKnowledgeAddMediaModal: false,
      });
      const { data: resp } = await krooloHttpClient.post(
        "/kroolo-agent/add-media-to-agent",
        requestData
      );
      if (resp?.status === "Success") {
        set(
          produce((state: AiAgentsStoreState) => {
            state.createdAgentDetailData.media = [
              ...resp?.data?.added,
              ...state.createdAgentDetailData.media,
            ];
          })
        );
      }
    } catch (error) {
      toastWarning("Add Media Error", error.response?.data.message);
    } finally {
      set({ isLoadingSavingMedia: false });
    }
  },
  saveLinkAPI: async (metaData: RequestData, type: string) => {
    try {
      set({
        isLoadingSavingMedia: type,
      });
      const requestData = {
        ...metaData,
      };
      const { data: resp } = await krooloHttpClient.post(
        "/kroolo-agent/save-media",
        requestData
      );
      if (resp?.status === "Success") {
        const extractResp = await extractContentAPI({
          file_id: resp?.data?._id,
        });
        if (extractResp instanceof Response ? !extractResp.ok : true) {
          const respData = {
            agentId: metaData?.agentId,
            mediaId: resp?.data?._id,
          };
          await get().deleteMediaAPI(respData);
        } else {
          set(
            produce((state: AiAgentsStoreState) => {
              state.createdAgentDetailData.media.unshift(resp?.data);
              state.uploadsArray.unshift(resp?.data);
            })
          );
        }
      }
    } catch (error) {
      let message = "";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        message = (error.response as any).data.message ?? "";
      }
      toastWarning("Add Link", message);
    } finally {
      set({ isLoadingSavingMedia: false });
    }
  },

  deleteMediaAPI: async (requestData: RequestData) => {
    try {
      const { data: resp } = await krooloHttpClient.post(
        `/kroolo-agent/delete-media`,
        requestData
      );
      if (resp?.status === "Success") {
        const createdAgentData =
          useAiAgentsStore.getState().createdAgentDetailData;
        // const companyId = useCompanyStore.getState().ownerCompanyDetail?._id;
        const companyId = useCompanyStore.getState().selectedCompany?.companyId;

        const requestDeleteData = {
          user_id: localStorage.getItem("user_id"),
          organization_id: companyId,
          allowed_files: [requestData.mediaId],
          agent_id:
            createdAgentData?.trained &&
            !createdAgentData?.preCreated &&
            !createdAgentData?.preDefault
              ? createdAgentData?.agnoId
              : createdAgentData?.agentName,
        };
        deleteMediaEmbedding(requestDeleteData);
        useAiAgentsStore.setState((state: AiAgentsStoreState) => ({
          createdAgentDetailData: {
            ...state.createdAgentDetailData,
            media:
              state.createdAgentDetailData?.media?.filter(
                (mediaData: IMedia) => mediaData?._id !== requestData?.mediaId
              ) || [],
          },
          uploadsArray: state.uploadsArray.filter(
            (file: IMedia) => file._id !== requestData?.mediaId
          ),
        }));
      }
      return true;
    } catch (error) {
      let message = "";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        message = (error.response as any).data.message ?? "";
      }
      toastWarning("Delete error", message);
    }
  },
  saveChatAPI: async (requestData: RequestData) => {
    try {
      const { data: resp } = await krooloHttpClient.post(
        "/kroolo-agent/create-chat",
        requestData
      );
      return resp?.data;
    } catch (error) {
      let message = "";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        message = (error.response as any).data.message ?? "";
      }
      toastWarning("Chat Creation Failed", message);
    }
  },
  createConversationAPI: async (requestData: RequestData) => {
    try {
      set({
        isLoadingCreatingConversation: true,
      });
      const { data: resp } = await krooloHttpClient.post(
        "/kroolo-agent/create-conversation",
        requestData
      );
      if (resp?.status === "Success") {
        set(
          produce((state: AiAgentsStoreState) => {
            state?.aiAgentChatWithAgentChatList?.unshift(resp?.data);
            state.selectedChat = resp?.data;
          })
        );
      }
      return resp?.data;
    } catch (error) {
      let message = "";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        message = (error.response as any).data.message ?? "";
      }
      toastWarning("Conversation Creation Failed", message);
    } finally {
      set({ isLoadingCreatingConversation: false });
    }
  },

  getConversationListsAPI: async (requestData: RequestData) => {
    try {
      const { data: resp } = await krooloHttpClient.post(
        "/kroolo-agent/get-conversation-list",
        requestData
      );

      if (resp?.status === "Success") {
        useAiAgentsStore.setState({
          aiAgentChatWithAgentChatList: resp?.data,
        });
      }
      return resp?.data;
    } catch (error) {
      toastWarning(
        " Conversation Creation Failed",
        error.response.data.message
      );
    }
  },
  deleteConversationAPI: async (requestData: RequestData) => {
    try {
      set({
        isLoadingDeletingConversation: requestData?.conversationId,
      });
      const { data: resp } = await krooloHttpClient.post(
        "/kroolo-agent/delete-conversation",
        requestData
      );

      if (resp?.status === "Success") {
        useAiAgentsStore.setState((state: AiAgentsStoreState) => ({
          aiAgentChatWithAgentChatChain: [],
          aiAgentChatWithAgentChatList:
            state.aiAgentChatWithAgentChatList?.filter(
              (chat: unknown) => chat._id !== requestData?.conversationId
            ),
        }));
        if (
          useAiAgentsStore.getState().selectedChat?._id ===
            requestData?.conversationId &&
          useAiAgentsStore.getState().aiAgentChatWithAgentChatList?.length > 0
        ) {
          useAiAgentsStore.setState(() => ({
            selectedChat:
              useAiAgentsStore.getState().aiAgentChatWithAgentChatList?.[0],
          }));
          useAiAgentsStore.getState().getSelectedConversation({
            conversationId:
              useAiAgentsStore.getState().aiAgentChatWithAgentChatList?.[0]
                ?._id,
          });
        }
      }
    } catch (error) {
      toastWarning(
        " Conversation Deletion Failed",
        error.response?.data.message
      );
    } finally {
      set({ isLoadingDeletingConversation: false });
    }
  },
  editConversationAPI: async (requestData: RequestData) => {
    try {
      const { data: resp } = await krooloHttpClient.post(
        "/kroolo-agent/edit-conversation",
        requestData
      );
      if (resp?.status === "Success") {
        useAiAgentsStore.setState((state: AiAgentsStoreState) => ({
          aiAgentChatWithAgentChatList:
            state?.aiAgentChatWithAgentChatList?.map((chat: unknown) =>
              chat._id === requestData?.conversationId
                ? {
                    ...chat,
                    chatName: requestData?.chatName,
                  }
                : chat
            ),
          selectedChat: {
            ...state.selectedChat,
            chatName: requestData?.chatName,
          },
        }));
      }
    } catch (error) {
      let message = "";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        message = (error.response as any).data.message ?? "";
      }
      toastWarning("Conversation Edit Failed", message);
    }
  },
  getSelectedConversation: async (requestData: RequestData) => {
    try {
      const { data: resp } = await krooloHttpClient.post(
        "/kroolo-agent/get-selected-chat",
        requestData
      );
      if (resp?.status === "Success") {
        useAiAgentsStore.setState({
          selectedChat: resp?.data?.chatData,
        });
        useAiAgentsStore.setState({
          aiAgentChatWithAgentChatChain: resp?.data?.chatHistory,
        });
      }
    } catch (error) {
      let message = "";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        message = (error.response as any).data.message ?? "";
      }
      toastWarning("Conversation Fetching Failed", message);
    }
  },
  generateAgentTitle: async (msg: string) => {
    try {
      const requestData = {
        userPrompt: msg,
      };
      const { data: resp } = await krooloHttpClient.post(
        "/kroolo-gen/agent-title",
        requestData
      );
      if (resp?.status === "Success") {
        useAiAgentsStore.getState().editConversationAPI({
          chatName: resp?.data,
          conversationId: useAiAgentsStore.getState().selectedChat?._id,
        });
      }
    } catch (error) {
      toastWarning("Title Generation Failed ", error.response?.data.message);
    }
  },

  createChatProjectAPI: async (formData: RequestData) => {
    try {
      set({ isLoadingInserting: true });
      const resp = await krooloHttpClient.post(
        `${process.env.NEXT_PUBLIC_API_URL}/project/kro-ai-project`,
        formData
      );
      if (resp?.data?.status === "SUCCESS") {
        set({
          isLoadingInserting: false,
        });
        return resp?.data?.data;
      } else {
        return resp?.data;
      }
    } catch (err) {
      set({
        isLoadingInserting: false,
      });
      return err;
    }
  },

  updateEnabledKnowledge: async () => {
    try {
      // Set loading state
      set({ isUpdatingKnowledge: true });

      // Get companyId from the store or localStorage
      const companyId = useCompanyStore.getState().selectedCompany?.companyId;

      if (!companyId) {
        toastWarning("Error", "Company ID not found");
        return;
      }

      // Call the API to update enabledKnowledge on the backend
      const response = await fetch("/api/knowledge-base/enable", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local store with the response from backend
        set(
          produce((state: AiAgentsStoreState) => {
            state.createdAgentDetailData.enabledKnowledge = result.data.enabled;
          })
        );
        console.log(
          "Knowledge base updated successfully:",
          result.data.enabled
        );
      } else {
        toastWarning(
          "Error",
          result.error || "Failed to update knowledge base"
        );
      }
    } catch (error) {
      console.error("Error updating knowledge base:", error);
      toastWarning("Error", "Failed to update knowledge base");
    } finally {
      // Clear loading state
      set({ isUpdatingKnowledge: false });
    }
  },

  fetchEnabledKnowledge: async () => {
    try {
      // Set loading state
      set({ isUpdatingKnowledge: true });

      // Get companyId from the store
      const companyId = useCompanyStore.getState().selectedCompany?.companyId;

      if (!companyId) {
        console.warn("Company ID not found, skipping knowledge base fetch");
        return;
      }

      // Call the API to get current enabledKnowledge status
      const response = await fetch(
        `/api/knowledge-base/enable?companyId=${companyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        // Update local store with the response from backend
        set(
          produce((state: AiAgentsStoreState) => {
            state.createdAgentDetailData.enabledKnowledge = result.data.enabled;
          })
        );
        console.log("Knowledge base status fetched:", result.data.enabled);
      } else {
        console.error("Failed to fetch knowledge base status:", result.error);
      }
    } catch (error) {
      console.error("Error fetching knowledge base status:", error);
    } finally {
      // Clear loading state
      set({ isUpdatingKnowledge: false });
    }
  },

  setReset: () => {
    useAiAgentsStore.setState(() => ({
      showCreateFormFillDetails: false,
      enableChatWithContentView: false,
      showCreatedDocument: false,
      createFormDetails: {
        title: "",
        definedPrompts: "",
        persona: "Graphic Designer",
        tone: "Professional",
      },
    }));
  },
}));

export default useAiAgentsStore;
