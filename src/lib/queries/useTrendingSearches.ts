// lib/queries/useTrendingSearches.ts
import { DJANGO_API_ROUTES } from "@/constants/endpoints";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/stores/user-store";
import { useIntegrationStore } from "@/stores/integration-store";

export interface TrendingDocument {
  id: string;
  title: string;
  url: string;
  integration_type: string;
  author_email: string;
  created_at: string;
  last_updated: string;
  account_id: string;
  file_type: string;
  content_preview: string;
  trending_context: {
    trending_query: string;
    search_count: number;
    last_searched: string;
  };
}

const fetchTrendingSearches = async (
  account_ids: string[],
  external_user_id: string,
  user_email: string
): Promise<TrendingDocument[]> => {
  const res = await fetch(DJANGO_API_ROUTES.TRENDING, {
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
    throw new Error("Failed to fetch trending searches");
  }

  const data = await res.json();
  return data.documents;
};

export function useTrendingSearches() {
  const { userData } = useUserStore.getState();
  const external_user_id = userData?.userId;
  const user_email = userData?.email;

  const account_ids = useIntegrationStore.getState().connectedAccountIds;

  return useQuery({
    queryKey: ["trendingSearches", account_ids, external_user_id, user_email],
    queryFn: () => {
      if (
        !account_ids ||
        account_ids.length === 0 ||
        !external_user_id ||
        !user_email
      )
        return [];
      return fetchTrendingSearches(account_ids, external_user_id, user_email);
    },
    enabled:
      Array.isArray(account_ids) &&
      account_ids.length > 0 &&
      !!external_user_id &&
      !!user_email,
    staleTime: 1000 * 60 * 60 * 1, // 1 hours
  });
}
