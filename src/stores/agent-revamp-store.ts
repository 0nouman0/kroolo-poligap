// import { krooloHttpClient } from "@kroolo/utils/http";
import { produce } from "immer";
import { create } from "zustand";
// import { AGENTS_TABS_LIST } from "../Utils";
// import useAiAgentsStore from "../../../../../store/ai-agents-store";
// import { toastSuccess } from "../../../../toast";
import useAiAgentsStore from "@/stores/ai-agents-store";
import { toastSuccess } from "@/components/toast-varients";
import { AGENTS_TABS_LIST } from "@/utils/knowledge-base.util";
import { krooloHttpClient } from "@/app/(app)/chat/utils/https";
import type { Agent } from "@/types/agent";

// Define the structure for allAgentsList
interface PredefinedAgentCategory {
  usecase: string;
  predefinedAgents: Agent[];
}

interface AllAgentsList {
  created?: Agent[];
  favourite?: Agent[];
  popular?: Agent[];
  shared?: Agent[];
  preDefault?: PredefinedAgentCategory[];
  [key: string]: any;
}

interface AgentRevampStoreState {
  openAgentRevampModal: boolean;
  selectedCategory: string;
  getAllAgentsListLoading: boolean;
  allAgentsList: AllAgentsList;
  isTrainingAgent: boolean;
  isAgentDuplicating: boolean | string;
  isAgentDeleting: boolean | string;
  selectedAgents: string[];
  isFetchingUsageStatistics: boolean;
  agentUsageData: Record<string, unknown>;
  showWarning: boolean;
  recentChatsList: Record<string, unknown>[];
  agentToolsList: Record<string, unknown>[];
  isFetchingRecentChatsList: boolean;
  getAllAgentAPI: (requestData: Record<string, unknown>) => Promise<void>;
  getRecentChats: () => Promise<void>;
  traineAgentKnowledge: (
    requestData: Record<string, unknown>,
    agentId: string,
    isKnowledgeTrained: boolean
  ) => Promise<void>;
  chatUpdateAPI: (requestData: Record<string, unknown>) => Promise<void>;
  getUsageApi: (
    agentId: string,
    startDate: string,
    endDate: string
  ) => Promise<void>;
  getToolsApi: () => Promise<void>;
  updateAgentById: (agentId: string, updatedAgentData: Agent) => void;
  updateAgentAPI: (requestData: Record<string, unknown>) => Promise<any>;
  duplicateAgentAPI: (
    agentId: string,
    category: string,
    predefault: boolean
  ) => Promise<void>;
  updateAgentFavoriteById: (agentId: string, favorite: boolean) => void;
  favouriteAgentAPI: (agentId: string, favourite: boolean) => Promise<any>;
  deleteAgentById: (agentId: string) => void;
  deleteAgentAPI: (agentId: string) => Promise<any>;
}

export const useAgentRevampStore = create<AgentRevampStoreState>(
  (set, get) => ({
    openAgentRevampModal: false,
    selectedCategory: AGENTS_TABS_LIST[3]?.usecase,
    getAllAgentsListLoading: false,
    allAgentsList: {},
    isTrainingAgent: false,
    isAgentDuplicating: false,
    isAgentDeleting: false,
    selectedAgents: [],
    isFetchingUsageStatistics: false,
    agentUsageData: {},
    showWarning: false,
    recentChatsList: [],
    agentToolsList: [],
    isFetchingRecentChatsList: false,

    getAllAgentAPI: async (requestData: Record<string, unknown>) => {
      try {
        set({
          getAllAgentsListLoading: true,
        });
        const { data: resp } = await krooloHttpClient.post(
          "/kroolo-agent/get-all-agents-grouped",
          requestData
        );

        if (resp?.status === "Success") {
          set({
            allAgentsList: resp.data,
          });
        }
      } catch {
        // no-op
      } finally {
        set({
          getAllAgentsListLoading: false,
        });
      }
    },
    getRecentChats: async () => {
      try {
        set({
          isFetchingRecentChatsList: true,
        });
        const { data: resp } = await krooloHttpClient.get(
          "/kroolo-agent/get-recent-chats"
        );

        if (resp?.status === "Success") {
          set({
            recentChatsList: resp.data,
          });
        }
      } catch {
        // no-op
      } finally {
        set({
          isFetchingRecentChatsList: false,
        });
      }
    },
    traineAgentKnowledge: async (
      requestData: Record<string, unknown>,
      agentId: string,
      isKnowledgeTrained: boolean
    ): Promise<void> => {
      try {
        set({
          isTrainingAgent: true,
        });
        const env = (
          import.meta as ImportMeta & { env: Record<string, string> }
        ).env;
        const url = env.REACT_APP_API_URL_KROOLO_AI + "/embed-agent";
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        };
        const response = await fetch(url, options);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        if (response.ok) {
          const resp = await useAgentRevampStore.getState().updateAgentAPI({
            isKnowledgeTrained,
            lastTrained: new Date(),
            agentId,
          });
          if (resp) {
            // useAiAgentsStore.setState(
            //   produce(
            //     (
            //       state: AgentRevampStoreState & {
            //         createdAgentDetailData: Record<string, unknown>;
            //       }
            //     ) => {
            //       state.createdAgentDetailData.isKnowledgeTrained =
            //         resp.data.lastTrained;
            //       state.createdAgentDetailData.lastTrained =
            //         resp.data.lastTrained;
            //     }
            //   )
            // );
          }
        }
      } finally {
        set({
          isTrainingAgent: false,
        });
      }
    },
    chatUpdateAPI: async (requestData: Record<string, unknown>) => {
      try {
        await krooloHttpClient.post("/kroolo-agent/updateChat", requestData);
      } catch {
        // no-op
      }
    },
    getUsageApi: async (
      agentId: string,
      startDate: string,
      endDate: string
    ) => {
      try {
        set({
          isFetchingUsageStatistics: true,
        });
        const { data: resp } = await krooloHttpClient.get(
          `/kroolo-agent/agent-usage/${agentId}`,
          {
            params: {
              startDate,
              endDate,
            },
          }
        );

        if (resp?.status === "Success") {
          set({
            agentUsageData: resp.data,
          });
        }
      } catch {
        // no-op
      } finally {
        set({
          isFetchingUsageStatistics: false,
        });
      }
    },
    getToolsApi: async () => {
      try {
        const { data: resp } = await krooloHttpClient.get(
          "/kroolo-agent/get-tools"
        );

        if (resp?.status === "Success") {
          set({
            agentToolsList: resp.data,
          });
        }
      } catch {
        // no-op
      }
    },
    updateAgentById: (agentId: string, updatedAgentData: Agent) => {
      set(
        produce((state: AgentRevampStoreState) => {
          const updateInArray = (array: Agent[] | undefined) => {
            if (!Array.isArray(array)) return;
            const index = array.findIndex(
              (agent) => (agent as unknown as { _id?: string })._id === agentId
            );
            if (index !== -1) {
              array[index] = updatedAgentData;
            }
          };

          if (!state.allAgentsList) return;
          updateInArray(state.allAgentsList.created);
          updateInArray(state.allAgentsList.favourite);
          updateInArray(state.allAgentsList.popular);
          updateInArray(state.allAgentsList.shared);
          if (state.allAgentsList.preDefault) {
            (
              state.allAgentsList.preDefault as PredefinedAgentCategory[]
            ).forEach((category: PredefinedAgentCategory) => {
              updateInArray(category.predefinedAgents);
            });
          }
        })
      );
    },
    updateAgentAPI: async (requestData: Record<string, unknown>) => {
      try {
        useAiAgentsStore.setState({
          // isLoadingUpdatingAgent: true,
        });

        const { data: resp } = await krooloHttpClient.post(
          `/kroolo-agent/update-agent`,
          requestData
        );

        if (resp?.status === "Success") {
          if (useAiAgentsStore.getState().openAgentUpdateModalButtonType) {
            toastSuccess(`${resp.data?.agentName}`, "is successfully created.");
          }
          get().updateAgentById(resp.data?._id, resp.data);
        }

        return resp;
      } catch {
        // no-op
      } finally {
        useAiAgentsStore.setState({
          // isLoadingUpdatingAgent: false,
          openAgentUpdateModalButtonType: false,
        });
      }
    },

    duplicateAgentAPI: async (
      agentId: string,
      category: string,
      predefault: boolean
    ): Promise<void> => {
      try {
        set({
          isAgentDuplicating: agentId,
        });
        const { data: resp } = await krooloHttpClient.post(
          `/kroolo-agent/duplicate/${agentId}`
        );

        if (resp?.status === "Success") {
          const duplicatedAgent = resp.data as Agent;
          set(
            produce((state: AgentRevampStoreState) => {
              if (predefault) {
                if (state.allAgentsList?.preDefault) {
                  const categoryIndex = (
                    state.allAgentsList.preDefault as PredefinedAgentCategory[]
                  ).findIndex(
                    (item: PredefinedAgentCategory) => item.usecase === category
                  );

                  if (categoryIndex !== -1) {
                    if (
                      !state.allAgentsList.preDefault[categoryIndex]
                        .predefinedAgents
                    ) {
                      state.allAgentsList.preDefault[
                        categoryIndex
                      ].predefinedAgents = [];
                    }

                    state.allAgentsList.preDefault[
                      categoryIndex
                    ].predefinedAgents.push(duplicatedAgent);
                  }
                }
              } else {
                if (!state.allAgentsList) {
                  state.allAgentsList = {};
                }

                switch (category) {
                  case "Created Agents":
                    if (!state.allAgentsList.created) {
                      state.allAgentsList.created = [];
                    }
                    state.allAgentsList.created.push(duplicatedAgent);
                    break;
                  case "Favorites":
                    if (!state.allAgentsList.favourite) {
                      state.allAgentsList.favourite = [];
                    }
                    state.allAgentsList.favourite.push(duplicatedAgent);
                    break;
                  case "Popular":
                    if (!state.allAgentsList.popular) {
                      state.allAgentsList.popular = [];
                    }
                    state.allAgentsList.popular.push(duplicatedAgent);
                    break;
                  case "Shared Agents":
                    if (!state.allAgentsList.shared) {
                      state.allAgentsList.shared = [];
                    }
                    state.allAgentsList.shared.push(duplicatedAgent);
                    break;
                  default:
                    if (!state.allAgentsList.created) {
                      state.allAgentsList.created = [];
                    }
                    state.allAgentsList.created.push(duplicatedAgent);
                }
              }
            })
          );
        }
      } finally {
        set({
          isAgentDuplicating: false,
        });
      }
    },
    updateAgentFavoriteById: (agentId: string, favorite: boolean) => {
      set(
        produce((state: AgentRevampStoreState) => {
          let foundAgent: Agent | null = null;
          const updateFavoriteInArray = (array: Agent[] | undefined) => {
            if (!Array.isArray(array)) return;
            const index = array.findIndex(
              (agent) => (agent as unknown as { _id?: string })._id === agentId
            );
            if (index !== -1) {
              (array[index] as unknown as { favourite?: boolean }).favourite =
                favorite;
              foundAgent = array[index];
            }
          };

          if (!state.allAgentsList) return;

          updateFavoriteInArray(state.allAgentsList.created);
          updateFavoriteInArray(state.allAgentsList.favourite);
          updateFavoriteInArray(state.allAgentsList.popular);
          updateFavoriteInArray(state.allAgentsList.shared);

          if (state.allAgentsList.preDefault) {
            (
              state.allAgentsList.preDefault as PredefinedAgentCategory[]
            ).forEach((category: PredefinedAgentCategory) => {
              updateFavoriteInArray(category.predefinedAgents);
            });
          }
          if (foundAgent) {
            if (!state.allAgentsList.favourite) {
              state.allAgentsList.favourite = [];
            }

            const favoriteIndex = state.allAgentsList.favourite.findIndex(
              (agent: Agent) =>
                (agent as unknown as { _id?: string })._id === agentId
            );

            if (favorite) {
              if (favoriteIndex === -1) {
                state.allAgentsList.favourite.push(foundAgent);
              }
            } else {
              if (favoriteIndex !== -1) {
                state.allAgentsList.favourite.splice(favoriteIndex, 1);
              }
            }
          }
        })
      );
    },

    favouriteAgentAPI: async (
      agentId: string,
      favourite: boolean
    ): Promise<any> => {
      try {
        // Use a local variable for isAgentUpdating if needed, or remove if not used elsewhere
        set({});

        const { data: resp } = await krooloHttpClient.post(
          `/kroolo-agent/favourite/${agentId}`,
          {
            favourite,
          }
        );

        if (resp?.status === "Success") {
          get().updateAgentFavoriteById(agentId, favourite);
          toastSuccess(
            `${resp.data.agentName} ${
              favourite ? "added to" : "removed from"
            } favorites.`
          );
        }

        return resp;
      } catch {
        // no-op
      } finally {
        set({});
      }
    },

    deleteAgentById: (agentId: string) => {
      set(
        produce((state: AgentRevampStoreState) => {
          const deleteFromArray = (array: Agent[] | undefined) => {
            if (!Array.isArray(array)) return;
            const index = array.findIndex(
              (agent) => (agent as unknown as { _id?: string })._id === agentId
            );
            if (index !== -1) {
              array.splice(index, 1);
            }
          };

          if (!state.allAgentsList) return;
          deleteFromArray(state.allAgentsList.created);
          deleteFromArray(state.allAgentsList.favourite);
          deleteFromArray(state.allAgentsList.popular);
          deleteFromArray(state.allAgentsList.shared);
          if (state.allAgentsList.preDefault) {
            (
              state.allAgentsList.preDefault as PredefinedAgentCategory[]
            ).forEach((category: PredefinedAgentCategory) => {
              deleteFromArray(category.predefinedAgents);
            });
          }
        })
      );
    },

    deleteAgentAPI: async (agentId: string): Promise<any> => {
      try {
        set({});
        const { data: resp } = await krooloHttpClient.post(
          `kroolo-agent/delete-agent`,
          {
            agentId,
          }
        );
        if (resp?.status === "Success") {
          get().deleteAgentById(agentId);
          toastSuccess(`${resp.data.agentName} deleted successfully.`);
        }

        return resp;
      } catch {
        // no-op
      } finally {
        set({});
      }
    },
  })
);
