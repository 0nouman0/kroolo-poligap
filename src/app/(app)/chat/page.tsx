"use client";
import { useEffect, useState } from "react";
import { ChatArea } from "./components";
import type { SelectedLanguageType, MediaTypeProps } from "./types/agent";
import RecentChats from "./recent-chats";
import { Button } from "@/components/ui/button";
import RecentChatIcon from "@/assets/icons/doc-comment-icon.svg";
import useGlobalChatStore from "./store/global-chat-store";
import { useCompanyStore } from "@/stores/company-store";
import { useUserStore } from "@/stores/user-store";

const AgentChat = () => {
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const companyId = selectedCompany?.companyId;
  const { userData } = useUserStore();
  const userId = userData?.userId;

  // recent chats
  const [isMobile, setIsMobile] = useState(false);

  // State and constants
  const [recentChatsOpen, setRecentChatsOpen] = useState(true);

  // Get messages and setMessages from global store
  const messages = useGlobalChatStore((state) => state.messages);
  const setMessages = useGlobalChatStore((state) => state.setMessages);

  const [inputMessage, setInputMessage] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4.1-mini");
  const [selectedLanguage, setSelectedLanguage] =
    useState<SelectedLanguageType>({ code: "en", name: "English" });

  const [medias] = useState<MediaTypeProps[] | undefined>(undefined);

  const {
    createConversationAPI,
    selectedConversation,
    generateConversationTitle,
  } = useGlobalChatStore();

  console.log("selectedConversation ==> ", selectedConversation);

  // Constants (customize as needed)
  const agent_id = "123";
  const agno_id = "Global_chat";
  const agent_name = undefined;
  const isTrained = false;
  const enabledKnowledge = false;
  const isPublic = false;
  const publicCompanyId = undefined;
  const publicUserId = undefined;
  const user_description = undefined;
  const user_instructions = undefined;
  const exportReactComponentAsPDF = undefined;

  // Handler stubs (customize as needed)
  const handleCreateChat = async () => {
    const conversation = await createConversationAPI({ companyId, userId });
    setMessages([]);

    return conversation;
  };

  const handleCreateProject = undefined;
  const handleCreateDoc = undefined;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setRecentChatsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleRecentChats = () => {
    setRecentChatsOpen(!recentChatsOpen);
  };

  return (
    <main className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0 relative">
        {(!recentChatsOpen || isMobile) && (
          <div className="absolute top-4 right-4 z-30">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRecentChats}
              className="shadow-lg cursor-pointer"
            >
              <RecentChatIcon />
            </Button>
          </div>
        )}
        <ChatArea
          agent_id={agent_id}
          isTrained={isTrained}
          agno_id={agno_id}
          user_description={user_description}
          user_instructions={user_instructions}
          messages={messages}
          medias={medias}
          isPublic={isPublic}
          publicCompanyId={publicCompanyId}
          publicUserId={publicUserId}
          exportReactComponentAsPDF={exportReactComponentAsPDF}
          isGlobalAgent={true}
          generateTitle={generateConversationTitle}
          handleCreateProject={handleCreateProject}
          handleCreateDoc={handleCreateDoc}
          enabledKnowledge={enabledKnowledge}
          agent_name={agent_name}
          setMessages={setMessages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          selectedLanguage={selectedLanguage}
          selectedModel={selectedModel}
          setSelectedLanguage={setSelectedLanguage}
          setSelectedModel={setSelectedModel}
          handleCreateConversation={handleCreateChat}
          selectedConversation={selectedConversation}
        />
      </div>
      <RecentChats
        isMobile={isMobile}
        setRecentChatsOpen={setRecentChatsOpen}
        recentChatsOpen={recentChatsOpen}
        setMessages={setMessages}
      />
    </main>
  );
};

export default AgentChat;
