"use client";

import { StickToBottom } from "use-stick-to-bottom";

import type { PlaygroundChatMessage } from "./../types/agent";
import Messages from "./Messages";
import ScrollToBottom from "./ScrollToBottom";

const MessageArea = ({
  messages,
  isGlobalAgent,
  exportReactComponentAsPDF,
  handleCreateProject,
  handleCreateDoc,
}: {
  handleCreateProject?: (content: PlaygroundChatMessage) => void;
  handleCreateDoc?: (content: PlaygroundChatMessage) => Promise<void>;
  messages: PlaygroundChatMessage[];
  isGlobalAgent: boolean;
  exportReactComponentAsPDF?: (
    component: React.ReactElement,
    options: {
      title: string;
      fileName: string;
      fileFormat: string;
    },
    
  ) => Promise<void>;
}) => {
  const messagesArray = messages || [];
  
  return (
    <StickToBottom
      className='relative mb-4 flex max-h-[calc(100vh-64px)] min-h-0 flex-grow flex-col'
      resize='smooth'
      initial='smooth'>
      <StickToBottom.Content
        className={`flex min-h-full flex-col ${messagesArray.length === 0 ? "justify-center" : "justify-start"} `}>
        <div className='mx-auto w-full space-y-2 pb-4'>
          <Messages
            exportReactComponentAsPDF={exportReactComponentAsPDF}
            messages={messagesArray}
            isGlobalAgent={isGlobalAgent}
            handleCreateProject={handleCreateProject}
            handleCreateDoc={handleCreateDoc}
          />
        </div>
      </StickToBottom.Content>
      <ScrollToBottom />
    </StickToBottom>
  );
};

export default MessageArea;
