/* eslint-disable @typescript-eslint/no-explicit-any */
// import krooloHttpClient from "../services/httpClient";
// import { toastWarning } from "../components/toast";
import { produce } from "immer";
import { create } from "zustand";
// import { LlmsList } from "../components/Dashboard/ai-agents/Common";
// import { krooloHttpClient } from "../utils/https";
import { toastWarning } from "@/components/toast-varients";
import { LlmsList } from "../utils/utils";
import { PlaygroundChatMessage } from "@/types/agent";
// import { PlaygroundChatMessage } from "@/types/agent";
import { useCompanyStore } from "@/stores/company-store";
import { useUserStore } from "@/stores/user-store";

// Utility function to group conversations by date
export function groupConversationsByDate(
  conversations: any[]
): Record<string, any[]> {
  // debugger;
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const groupedConversations: { [key: string]: any[] } = {};

  conversations.forEach((convo: any) => {
    const updatedDate = new Date(convo.updatedAt);
    const diffTime =
      (today as unknown as number) - (updatedDate as unknown as number);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let key;

    if (updatedDate.toDateString() === today.toDateString()) {
      key = "Today";
    } else if (updatedDate.toDateString() === yesterday.toDateString()) {
      key = "Yesterday";
    } else if (diffDays === 2) {
      key = "Two Days Ago";
    } else if (diffDays <= 7) {
      key = "Previous 7 Days";
    } else if (diffDays <= 30) {
      key = "Previous 30 Days";
    } else {
      const convoMonth = updatedDate.getMonth();
      const convoYear = updatedDate.getFullYear();

      // Only include months before the current month
      if (convoMonth !== currentMonth || convoYear !== currentYear) {
        key = updatedDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
      }
    }

    if (key) {
      if (!groupedConversations[key]) {
        groupedConversations[key] = [];
      }
      groupedConversations[key].push(convo);
    }
  });

  return groupedConversations;
}

export const streamResponse = async (
  url: string,
  options: any,
  onChunk: (chunk: string) => void
) => {
  try {
    const response = await fetch(url, options);
    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.detail);
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!response.body) throw new Error("No response body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (error: unknown) {
    const err = error as any;
    toastWarning(err?.message || "Something went wrong");
  }
};

export const streamGeneration = async (
  prompt: string,
  onChunk: (chunk: string) => void,
  signal: AbortSignal
) => {
  try {
    const userSession = localStorage.getItem("__LOGIN_SESSION__");
    const accessToken = userSession
      ? JSON.parse(userSession)?.AccessToken
      : undefined;
    const url = `${process.env.NEXT_PUBLIC_REACT_APP_API_URL}/kroolo-ai/chat-with-ai`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        prompt,
      }),
      signal,
    };

    await streamResponse(url, options, onChunk);
  } catch (error: any) {
    if (error?.name !== "AbortError") {
      throw error;
    }
  }
};

export const streamGenerationGLobalChat = async (
  requestData: any,
  onChunk: (chunk: string) => void,
  signal: AbortSignal
) => {
  try {
    const url =
      process.env.NEXT_PUBLIC_REACT_APP_API_URL_KROOLO_AI + "/global-chat";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
      signal,
    };
    await streamResponse(url, options, onChunk);
  } catch (error: any) {
    if (error?.name !== "AbortError") {
      throw error;
    }
  }
};

export const useGlobalChatStore = create((set: any) => ({
  isGeneratingChat: false,
  selectedModel: LlmsList[0],
  globalChatPrompt: "",
  callFromOutSide: false,
  isCreatingInitialConversation: false,
  globalConversationList: {},
  fetchController: new AbortController(),
  openModalView: false,
  isCreatingConversation: false,
  isLoadingFetchingConvoList: false,
  isDeletingConversation: false,
  deletingConversationId: null,
  isInitiateChat: false,
  selectedConversation: {
    _id: "",
    chatName: "",
    createdAt: new Date().toISOString(),
  },
  messages: [] as PlaygroundChatMessage[],
  setMessages: (
    messages:
      | PlaygroundChatMessage[]
      | ((prevMessages: PlaygroundChatMessage[]) => PlaygroundChatMessage[])
  ) =>
    set((state: any) => ({
      messages:
        typeof messages === "function" ? messages(state.messages) : messages,
    })),
  clearMessages: () => set({ messages: [] }),

  abortFetchReq: (): void => {
    const { fetchController } = useGlobalChatStore.getState() as any;
    fetchController.abort();
    set({ fetchController: new AbortController() });
  },
  setSelectedModel: (model: any): void => {
    set({ selectedModel: model });
  },

  saveChatAPI: async (requestData: any): Promise<any> => {
    try {
      // const { data: resp } = await krooloHttpClient.post(
      //   "/kroolo-ai/create-chat",
      //   {
      //     ...requestData,
      //     conversationId: (useGlobalChatStore.getState() as any)
      //       .selectedConversation?._id,
      //   }
      // );
      const res = await fetch("/api/ai-chat/create-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...requestData,
          conversationId: (useGlobalChatStore.getState() as any)
            .selectedConversation?._id,
        }),
      });

      const resp = await res.json();
      // console.log("save global chat resp =>", resp);
      return resp?.data;
    } catch (error: unknown) {
      const err = error as any;
      toastWarning(
        "Chat Creation Failed",
        err?.response?.data?.message || err?.message || "Unknown error"
      );
    }
  },

  // saveGlobalChat: async (apiData: PlaygroundChatMessage) => {
  //   try {
  //     // debugger;
  //     // await krooloHttpClient.post("/kroolo-ai/create-chat", apiData);
  //     const res = await fetch("/api/ai-chat/create-chat", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(apiData),
  //     });

  //     const resp = await res.json();
  //     console.log("save global chat resp =>", resp);
  //   } catch (error) {
  //     toastError(
  //       `Chat Creation Failed: ${
  //         error instanceof Error ? error.message : String(error)
  //       }`
  //     );
  //   }
  // },
  createConversationAPI: async (requestData: any): Promise<any> => {
    // debugger;
    try {
      set({
        isCreatingConversation: true,
      });

      // const { data: resp } = await krooloHttpClient.post(
      //   "/kroolo-ai/create-conversation",
      //   requestData
      // );

      const res = await fetch("/api/ai-chat/create-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const resp = await res.json();
      console.log("conversation create resp =>", resp);

      if (resp?.success) {
        set(
          produce((state: any) => {
            if (state.globalConversationList["Today"]) {
              state.globalConversationList["Today"].unshift(resp.data);
            } else {
              state.globalConversationList["Today"] = [resp.data];
            }
            state.selectedConversation = resp?.data;
          })
        );

        (useGlobalChatStore.getState() as any).getSelectedConversation(
          { conversationId: resp?.data?._id },
          resp?.data
        );
      }
      console.log(
        "Zustand useGlobalChatStore state:",
        useGlobalChatStore.getState()
      );
      // debugger;
      return resp?.data;
    } catch (error: unknown) {
      const err = error as any;
      toastWarning(
        "Conversation Creation Failed",
        err?.response?.data?.message || err?.message || "Unknown error"
      );
    } finally {
      set({ isCreatingConversation: false });
    }
  },

  // API function to fetch and group conversation lists
  getConversationListsAPI: async (
    companyId: string,
    userId: string
  ): Promise<void> => {
    try {
      set({
        isLoadingFetchingConvoList: true,
      });
      // const { data: resp } = await krooloHttpClient.post(
      //   "/kroolo-ai/get-conversation-list",
      //   requestData
      // );
      console.log("companyId and userId ==>", companyId, userId);
      const res = await fetch(
        `/api/ai-chat/get-conversation-list?companyId=${companyId}&userId=${userId}`,
        {
          method: "GET",
        }
      );

      const resp = await res.json();
      console.log("resp ===>", resp);
      if (resp?.success) {
        const groupedData = groupConversationsByDate(resp?.data);
        useGlobalChatStore.setState({
          globalConversationList: groupedData,
        });
      }
    } catch (error: unknown) {
      const err = error as any;
      toastWarning(
        "Conversation Fetching Failed",
        err?.response?.data?.message || err?.message || "Unknown error"
      );
    } finally {
      set({ isLoadingFetchingConvoList: false });
    }
  },

  // API function to delete a conversation
  deleteConversationAPI: async (
    requestData: any
    // setMessages?: (msgs: any[]) => void
  ): Promise<void> => {
    try {
      // debugger;
      set({
        isDeletingConversation: true,
        deletingConversationId: requestData?.conversationId,
      });

      // const { data: resp } = await krooloHttpClient.post(
      //   "/kroolo-ai/delete-conversation",
      //   requestData
      // );

      const res = await fetch(
        `/api/ai-chat/delete-conversation?conversationId=${requestData}`,
        {
          method: "DELETE",
        }
      );

      const resp = await res.json();
      // console.log("conversation delete resp =>", resp);

      if (resp?.status === 200) {
        useGlobalChatStore.setState(
          produce((state: any) => {
            state.globalConversationList = (
              Object.entries(state.globalConversationList) as [string, any[]][]
            ).reduce((acc: any, [key, chats]: [string, any[]]) => {
              const filteredChats = chats.filter(
                (chat) => chat._id !== requestData?.conversationId
              );
              if (filteredChats?.length > 0) {
                acc[key] = filteredChats;
              }
              return acc;
            }, {});

            if (
              state.selectedConversation?._id === requestData?.conversationId
            ) {
              state.messages = [];
            }
            if (
              state.selectedConversation?._id === requestData?.conversationId &&
              Object.values(state.globalConversationList)?.flat()?.length > 0
            ) {
              const newSelectedConversation = Object.values(
                state.globalConversationList
              )?.flat()[0] as any;
              state.selectedConversation = newSelectedConversation;
              state.isCreatingConversation = true;
              (useGlobalChatStore.getState() as any).getSelectedConversation({
                conversationId: newSelectedConversation._id,
              });
            }
          })
        );
      }
    } catch (error: unknown) {
      const err = error as any;
      toastWarning(
        "Conversation Deletion Failed",
        err?.response?.data?.message || err?.message || "Unknown error"
      );
    } finally {
      set({ isDeletingConversation: false, deletingConversationId: null });
    }
  },

  // API function to edit a conversation
  editConversationAPI: async (requestData: any): Promise<void> => {
    try {
      console.log("editConversationAPI requestData:", requestData);

      const res = await fetch("/api/ai-chat/edit-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const resp = await res.json();
      console.log("editConversationAPI response:", resp);

      if (resp?.success) {
        set(
          produce((state: any) => {
            state.globalConversationList = (
              Object.entries(state.globalConversationList) as [string, any[]][]
            ).reduce((acc: any, [key, chats]: [string, any[]]) => {
              const updatedChats = chats.map((chat) =>
                chat._id === requestData?.conversationId
                  ? {
                      ...chat,
                      chatName: requestData?.chatName,
                      updatedAt: new Date().toISOString(),
                    }
                  : chat
              );
              if (updatedChats?.length > 0) {
                acc[key] = updatedChats;
              }
              return acc;
            }, {});

            state.selectedConversation = {
              ...state.selectedConversation,
              chatName: requestData?.chatName,
            };

            (useGlobalChatStore.getState() as any).getConversationListsAPI(
              useCompanyStore.getState().selectedCompany?.companyId,
              useUserStore.getState().userData?._id
            );
          })
        );
      } else {
        console.error("editConversationAPI failed:", resp);
        toastWarning(
          "Conversation Edit Failed",
          resp?.error || "Failed to update conversation"
        );
      }
    } catch (error: unknown) {
      console.error("editConversationAPI error:", error);
      const err = error as any;
      toastWarning(
        "Conversation Edit Failed",
        err?.response?.data?.message || err?.message || "Unknown error"
      );
    }
  },

  // API function to get the selected conversation
  getSelectedConversation: async (
    requestData: any,
    chatData?: any
  ): Promise<any> => {
    try {
      useGlobalChatStore.setState({ isCreatingConversation: true });
      // const { data: resp } = await krooloHttpClient.post(
      //   "/kroolo-ai/get-selected-chat",
      //   requestData
      // );

      const res = await fetch(
        `/api/ai-chat/get-selected-chat?conversationId=${requestData}`,
        {
          method: "GET",
        }
      );

      const resp = await res.json();
      console.log("resp getSelectedConversation ===>", resp);
      console.log("getSelectedConversation chatData ===>", chatData);
      if (resp?.success) {
        set((state: any) => ({
          ...state,
          selectedConversation: chatData,
        }));
      }

      console.log(
        "Zustand useGlobalChatStore state:",
        useGlobalChatStore.getState()
      );
      // return resp?.data?.chatHistory;
      return resp?.data;
    } catch (error: unknown) {
      const err = error as any;
      toastWarning(
        "Conversation Fetching Failed",
        err?.response?.data?.message || err?.message || "Unknown error"
      );
    } finally {
      useGlobalChatStore.setState({ isCreatingConversation: false });
    }
  },
  generateConversationTitle: async (msg: string): Promise<void> => {
    try {
      console.log("generateConversationTitle msg:", msg);
      const requestData = {
        userPrompt: msg,
      };

      const res = await fetch("/api/ai-chat/generate-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const resp = await res.json();
      console.log("generateConversationTitle response:", resp);

      if (resp?.success) {
        const selectedConversation = (useGlobalChatStore.getState() as any)
          .selectedConversation;
        console.log("selectedConversation for edit:", selectedConversation);

        if (selectedConversation?._id) {
          (useGlobalChatStore.getState() as any).editConversationAPI(
            {
              chatName: resp.data,
              conversationId: selectedConversation._id,
            },
            true
          );
        } else {
          console.error("No selectedConversation._id found");
          toastWarning("Title Generation Failed", "No conversation selected");
        }
      } else {
        console.error("generateConversationTitle failed:", resp);
        toastWarning(
          "Title Generation Failed",
          resp?.error || "Failed to generate title"
        );
      }
    } catch (error: unknown) {
      console.error("generateConversationTitle error:", error);
      const err = error as any;
      toastWarning(
        "Title Generation Failed ",
        err?.response?.data?.message || err?.message || "Unknown error"
      );
    }
  },
}));

export default useGlobalChatStore;
