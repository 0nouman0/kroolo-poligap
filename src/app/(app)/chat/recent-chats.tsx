import React, { useEffect } from "react";
import RecentChatIcon from "@/assets/icons/doc-comment-icon.svg";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useGlobalChatStore from "./store/global-chat-store";
import { PlaygroundChatMessage } from "@/types/agent";
import { useCompanyStore } from "@/stores/company-store";
import { useUserStore } from "@/stores/user-store";

type Props = {
  isMobile: boolean;
  setRecentChatsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  recentChatsOpen: boolean;
  setMessages: React.Dispatch<React.SetStateAction<PlaygroundChatMessage[]>>;
};

interface ChatItem {
  _id: string;
  chatName: string;
  createdAt: string;
}

// Skeleton loader for chat card
const ChatSkeleton = () => (
  <div className="flex items-center justify-between p-2 rounded-lg border bg-muted animate-pulse mb-2">
    <div className="flex-1">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="h-4 w-4 bg-gray-300 rounded"></div>
  </div>
);

const RecentChats = ({
  isMobile,
  setRecentChatsOpen,
  recentChatsOpen,
  setMessages,
}: Props) => {
  const getConversationListsAPI = useGlobalChatStore(
    (state) => state.getConversationListsAPI
  );
  const globalConversationList = useGlobalChatStore(
    (state) => state.globalConversationList
  );
  const deleteConversationAPI = useGlobalChatStore(
    (state) => state.deleteConversationAPI
  );
  const getSelectedConversation = useGlobalChatStore(
    (state) => state.getSelectedConversation
  );
  const selectedConversation = useGlobalChatStore(
    (state) => state.selectedConversation
  );
  const isLoadingFetchingConvoList = useGlobalChatStore(
    (state) => state.isLoadingFetchingConvoList
  );

  const userId = useUserStore((s) => s.userData?.userId);

  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const companyId = selectedCompany?.companyId;

  const groupedChats = (globalConversationList || {}) as Record<
    string,
    ChatItem[]
  >;

  useEffect(() => {
    getConversationListsAPI(companyId!, userId!);
  }, [companyId, userId, getConversationListsAPI]);

  const handleDeleteConversation = async (
    e: React.MouseEvent<HTMLButtonElement>,
    chatdata_id: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteConversationAPI(chatdata_id); // wait for delete to complete
    getConversationListsAPI(companyId!, userId!);
  };

  const handleGoToChat = async (chatData: ChatItem) => {
    // debugger;
    useGlobalChatStore.setState({
      openModalView: true,
    });
    const resp = await getSelectedConversation(chatData?._id, chatData);
    if (resp) {
      console.log("resp message ===>", resp);
      // debugger;
      if (isMobile) setRecentChatsOpen(false);
      setMessages(resp);
    }
  };

  console.log("globalConversationList ==>", globalConversationList);
  return (
    <>
      {/* Mobile sidebar overlay */}
      {recentChatsOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setRecentChatsOpen(false)}
        />
      )}

      {/* Right Sidebar - Recent Chats */}
      <div
        className={`
          ${
            isMobile ? "fixed" : "sticky"
          } inset-y-0 right-0 z-50 w-80 bg-background border-l border-border
          transform transition-transform duration-300 ease-in-out
          ${recentChatsOpen ? "translate-x-0" : "translate-x-full"}
          ${!isMobile && !recentChatsOpen ? "hidden" : ""}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-2 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 ml-3">
                <RecentChatIcon />
                <h2 className="text-foreground text-sm">Recent Chats</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRecentChatsOpen(false)}
                className="cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {isLoadingFetchingConvoList ? (
              // Show 5 skeletons as a placeholder
              <>
                {[...Array(5)].map((_, i) => (
                  <ChatSkeleton key={i} />
                ))}
              </>
            ) : (
              Object.entries(groupedChats).map(([sectionTitle, chats]) => (
                <div key={sectionTitle}>
                  <h3 className="text-13 font-medium text-muted-foreground mb-1">
                    {sectionTitle}
                  </h3>
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <div
                        key={chat._id}
                        onClick={() => handleGoToChat(chat)}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors group
                          ${
                            selectedConversation?._id === chat._id
                              ? "bg-primary/5 border-primary"
                              : "hover:bg-muted"
                          }`}
                      >
                        {/* <Tooltip>
                          <TooltipTrigger asChild> */}
                        <span>
                          <h4 className="text-sm font-medium text-foreground truncate mb-1">
                            {chat.chatName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(chat.createdAt).toLocaleString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </span>
                        {/* </TooltipTrigger> */}
                        {/* <TooltipContent side="top">
                             <p>{chat.chatName}</p>
                           </TooltipContent> */}
                        {/* </Tooltip> */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(event) =>
                                handleDeleteConversation(event, chat._id)
                              }
                              className="cursor-pointer hidden group-hover:block text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" sideOffset={5}>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecentChats;
