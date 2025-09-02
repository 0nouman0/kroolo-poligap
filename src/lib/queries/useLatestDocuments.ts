import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/app/(app)/chat/utils/https";

export interface LatestDocument {
  id: string;
  title: string;
  url?: string;
  createdAt?: string;
  lastUpdated?: string;
  author_email?: string;
  integration_type?: string;
}

// Fetch latest documents using Kroolo API
// Falls back to empty list if API errors; caller can handle UI fallback
async function fetchLatestDocuments(limit: number = 10): Promise<LatestDocument[]> {
  try {
    const { data } = await httpClient.get("v2/documents", {
      params: {
        type: "owned",
        limit,
        // If backend supports sorting, uncomment next line
        // sortBy: "lastUpdated",
        // order: "desc",
      },
    });

    // Try to map common shapes safely
    const items: any[] = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.documents)
      ? data.documents
      : [];

    return items.map((d: any) => ({
      id: String(d.id ?? d._id ?? crypto.randomUUID()),
      title: String(d.title ?? d.name ?? "Untitled"),
      url: d.url ?? d.link,
      createdAt: d.created_at ?? d.createdAt,
      lastUpdated: d.last_updated ?? d.lastUpdated,
      author_email: d.author_email,
      integration_type: d.integration_type,
    }));
  } catch (e) {
    // Swallow to let UI fallback
    return [];
  }
}

export function useLatestDocuments(limit: number = 10) {
  return useQuery({
    queryKey: ["latestDocuments", limit],
    queryFn: () => fetchLatestDocuments(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
