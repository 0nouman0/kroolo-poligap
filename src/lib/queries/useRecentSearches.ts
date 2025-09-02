// lib/queries/useRecentSearches.ts
import { DJANGO_API_ROUTES } from "@/constants/endpoints";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/stores/user-store";
import { useIntegrationStore } from "@/stores/integration-store";

type RecentSearch = {
  query: string;
  searched_at: string;
  results_count: number;
  link?: string;
  document_title?: string;
  integration?: string;
  has_document?: boolean;
};

const fetchRecentSearches = async (
  account_ids: string[],
  external_user_id: string,
  user_email: string
): Promise<RecentSearch[]> => {
  const res = await fetch(DJANGO_API_ROUTES.RECENT, {
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
    throw new Error("Failed to fetch recent searches");
  }
  const data = await res.json();
  console.log("data ==> 🔥", data);
  return data.data;
};

export function useRecentSearches() {
  const { userData } = useUserStore.getState();
  const external_user_id = userData?.userId || "";
  const user_email = userData?.email || "";

  const account_ids = useIntegrationStore.getState().connectedAccountIds;

  return useQuery({
    queryKey: ["recentSearches", account_ids, external_user_id, user_email],
    queryFn: () => {
      if (
        !account_ids ||
        account_ids.length === 0 ||
        !external_user_id ||
        !user_email
      )
        return [];
      return fetchRecentSearches(account_ids, external_user_id, user_email);
    },
    enabled:
      Array.isArray(account_ids) &&
      account_ids.length > 0 &&
      !!external_user_id &&
      !!user_email,
    // staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });
}
