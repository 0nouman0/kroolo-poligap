import type {
  MessageListProps,
  MessageWrapperProps,
  ToolCallProps,
} from "@/types/agent";
import React, { memo } from "react";

import ChatBlankState from "../Chat-Components/ChatBlankState";
import { AgentMessage, UserMessage } from "./MessageItem";

const AgentMessageWrapper = ({
  message,
  exportReactComponentAsPDF,
  handleCreateProject,
  handleCreateDoc,
}: MessageWrapperProps) => {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 bg-[var(--modal-color)] bg-opacity-80 backdrop-blur-md px-3 pt-2">
        <UserMessage message={message} />
      </div>
      <AgentMessage
        message={message}
        exportReactComponentAsPDF={exportReactComponentAsPDF}
        handleCreateProject={handleCreateProject}
        handleCreateDoc={handleCreateDoc}
      />
    </div>
  );
};

const ToolComponent = memo(({ tools }: ToolCallProps) => (
  <div className="bg-accent cursor-default rounded-full px-2 py-1.5 text-xs">
    <p className="font-dmmono text-primary/80 uppercase">{tools.tool_name}</p>
  </div>
));
ToolComponent.displayName = "ToolComponent";
const Messages = ({
  messages,
  isGlobalAgent,
  exportReactComponentAsPDF,
  handleCreateProject,
  handleCreateDoc,
}: MessageListProps) => {
  const messagesArray = messages || [];

  if (messagesArray.length === 0) {
    return <ChatBlankState isGlobalAgent={isGlobalAgent} />;
  }

  return (
    <>
      {messagesArray.map((message, index) => {
        const key = `${message.created_at}-${index}`;
        const isLastMessage = index === messagesArray.length - 1;

        return (
          <AgentMessageWrapper
            key={key}
            message={message}
            exportReactComponentAsPDF={exportReactComponentAsPDF}
            isLastMessage={isLastMessage}
            handleCreateProject={handleCreateProject}
            handleCreateDoc={handleCreateDoc}
          />
        );
      })}
    </>
  );
};

export default Messages;
