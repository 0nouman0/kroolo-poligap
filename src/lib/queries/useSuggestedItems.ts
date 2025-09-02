import { DJANGO_API_ROUTES } from "@/constants/endpoints";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useUserStore } from "@/stores/user-store";
import { useIntegrationStore } from "@/stores/integration-store";

export interface SuggestedItem {
  id: string;
  title: string;
  url: string;
  integration_type: string;
  author_email: string;
  created_at: string;
  last_updated: string;
  account_id: string;
  file_type: string;
}

const fetchSuggestedItems = async (
  account_ids: string[],
  external_user_id: string,
  user_email: string
): Promise<SuggestedItem[]> => {
  const res = await fetch(DJANGO_API_ROUTES.SUGGESTED, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_ids,
      external_user_id,
      user_email,
      limit: 10,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch suggested items");
  }

  const data = await res.json();
  return data.suggested_documents;
};

export function useSuggestedItems() {
  const { userData } = useUserStore.getState();
  const external_user_id = userData?.userId || "";
  const user_email = userData?.email || "";

  const account_ids = useIntegrationStore.getState().connectedAccountIds;

  return useQuery({
    queryKey: ["suggestedItems", account_ids, external_user_id, user_email],
    queryFn: () => {
      if (
        !account_ids ||
        account_ids.length === 0 ||
        !external_user_id ||
        !user_email
      )
        return [];
      return fetchSuggestedItems(account_ids, external_user_id, user_email);
    },
    enabled:
      Array.isArray(account_ids) &&
      account_ids.length > 0 &&
      !!external_user_id &&
      !!user_email, // Only run query when account_id is available
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
  });
}

// New: Dynamic Suggestions Hook
interface DynamicSuggestionItem {
  text: string; // e.g., "new"
  type: "recent_search"; // e.g., "recent_search"
  score: number; // e.g., 8.1
  icon: string; // e.g., "🕒"
  description: string; // e.g., "Recent search (1 results)"
}

// --------------------------------------------------
const fetchDynamicSuggestions = async (
  query: string,
  account_ids: string[],
  external_user_id: string,
  user_email: string
): Promise<DynamicSuggestionItem[]> => {
  const res = await fetch(DJANGO_API_ROUTES.DYNAMIC_SUGGESTIONS_MULTI_ACCOUNT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_ids,
      external_user_id,
      user_email,
      partial_query: query,
      limit: 10,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch dynamic suggestions");
  }
  const data = await res.json();
  return data.immediate_suggestions || [];
};

export function useDynamicSuggestions(query: string, debounceMs: number = 300) {
  const { userData } = useUserStore.getState();
  const external_user_id = userData?.userId || "";
  const user_email = userData?.email || "";

  const account_ids = useIntegrationStore.getState().connectedAccountIds;

  const debouncedQuery = useDebounce(query, debounceMs);
  return useQuery({
    queryKey: [
      "dynamicSuggestions",
      debouncedQuery,
      external_user_id,
      user_email,
      account_ids,
    ],
    queryFn: () => {
      if (
        !debouncedQuery ||
        debouncedQuery.trim().length === 0 ||
        !account_ids ||
        account_ids.length === 0 ||
        !external_user_id ||
        !user_email
      )
        return [];
      return fetchDynamicSuggestions(
        debouncedQuery,
        account_ids,
        external_user_id,
        user_email
      );
    },
    enabled:
      !!debouncedQuery &&
      debouncedQuery.trim().length > 0 &&
      Array.isArray(account_ids) &&
      account_ids.length > 0 &&
      !!external_user_id &&
      !!user_email,
    staleTime: 1000 * 60 * 60 * 1, // 1 hours
  });
}
