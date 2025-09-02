import { useCallback } from "react";

import type { ChatActionsType, PlaygroundChatMessage } from "./../types/agent";
import { useAgentStore } from "./../store/agent-store";

const useChatActions = ({ setMessages }: ChatActionsType) => {
  const { chatInputRef } = useAgentStore();

  const addMessage = useCallback(
    (message: PlaygroundChatMessage) => {
      setMessages(prevMessages => [...prevMessages, message]);
    },
    [setMessages],
  );

  const focusChatInput = useCallback(() => {
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [chatInputRef]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const removeLastMessage = useCallback(() => {
    setMessages(prevMessages => prevMessages.slice(0, -1));
  }, [setMessages]);

  return {
    addMessage,
    focusChatInput,
    clearMessages,
    removeLastMessage,
  };
};

export default useChatActions;
