import { useQuery } from "@tanstack/react-query";

export interface ChatHistoryConversation {
  _id: string;
  chatName: string;
  companyId: string;
  enterpriseUserId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  summary: string;
}

export interface ChatHistoryUser {
  _id: string;
  email: string;
  name: string;
  profileImage: string;
}

export interface ChatHistoryItem {
  conversation: ChatHistoryConversation;
  user: ChatHistoryUser;
}

export interface ChatHistoryResponse {
  success: boolean;
  data: ChatHistoryItem[];
  timestamp: string;
}

const fetchChatHistory = async (
  companyId: string,
  tab: "inbox" | "trash" = "inbox"
): Promise<ChatHistoryResponse> => {
  if (!companyId) throw new Error("No companyId provided");
  const res = await fetch(
    `/api/all-chat-history/${tab}?companyId=${companyId}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch chat history");
  }
  return res.json();
};

export function useChatHistory(
  companyId: string | undefined,
  tab: "inbox" | "trash" = "inbox"
) {
  return useQuery<ChatHistoryResponse>({
    queryKey: ["chatHistory", companyId, tab],
    queryFn: () => fetchChatHistory(companyId!, tab),
    enabled: !!companyId,
  });
}
