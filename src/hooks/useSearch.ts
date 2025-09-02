"use client";
import { DJANGO_API_ROUTES } from "@/constants/endpoints";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/stores/user-store";
import { useIntegrationStore } from "@/stores/integration-store";
import { useMemo } from "react";
// import { useState, useEffect } from "react";

export type SearchResult = {
  id: string;
  title: string;
  content_preview: string;
  file_url: string;
  author_email: string;
  integration_type: string;
  relevance_score: number;
  sync_status: boolean;
  updated_at: string | null;
  account_id: string;
};

export type SearchSummary = {
  total: number;
  by_source: Record<string, number>;
  search_time_ms: number;
  rbac_user: string;
  search_method: string;
};

export type SearchClientResponse = {
  results: SearchResult[];
  summary: SearchSummary;
};

const fetchSearch = async (
  query: string,
  email: string,
  external_user_id: string,
  account_ids: string[],
  apps: string[]
) => {
  const response = await fetch(DJANGO_API_ROUTES.SEARCH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
      user_email: email,
      external_user_id,
      account_ids: account_ids,
      apps,
    }),
  });
  const data = await response.json();
  console.log("search data ==>", data);
  return data.results;
};

// Custom hook for debounced search, debounceMs: number = 300
export const useSearch = (query: string) => {
  // const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setDebouncedQuery(query);
  //   }, debounceMs);

  //   return () => {
  //     clearTimeout(handler);
  //   };
  // }, [query, debounceMs]);

  const { userData } = useUserStore.getState();
  const external_user_id = userData?.userId || "";
  // Get Google Drive account_id from the integration store
  const integrationStore = useIntegrationStore.getState();
  let account_ids = [...integrationStore.connectedAccountIds];
  let apps = [...integrationStore.connectedIntegrations.map((i) => i.name)];

  // Add internal knowledge management if enabled
  const isEnabled = integrationStore.isEnabled;
  if (isEnabled) {
    account_ids.push(external_user_id + "_internal");
    account_ids.push(external_user_id + "_site");
    apps.push("knowledge_management");
  }

  const userEmail = userData?.email || "";
  const stableAccounts = useMemo(
    () => account_ids,
    [JSON.stringify(account_ids)]
  );

  const stableApps = useMemo(() => apps, [JSON.stringify(apps)]);

  return useQuery({
    queryKey: [
      "search",
      query,
      userEmail,
      external_user_id,
      stableAccounts,
      apps,
      isEnabled,
    ],
    queryFn: () =>
      fetchSearch(query, userEmail, external_user_id, account_ids, apps),
    enabled: Boolean(
      query?.trim() &&
        account_ids?.length &&
        apps?.length &&
        userEmail &&
        external_user_id
    ),
    staleTime: 1000 * 60 * 60 * 1, // 1 hours
  });
};

export { fetchSearch };
