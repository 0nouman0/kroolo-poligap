import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DJANGO_API_ROUTES } from "@/constants/endpoints";
// import { KnowledgeFile, KnowledgeLink } from "@/utils/internal-knowledge.util";
import { toastSuccess, toastError } from "@/components/toast-varients";

// Types
export interface KnowledgeUploadRequest {
  external_user_id_internal: string;
  account_ids: string[];
  user_email: string;
  files: File[];
  websites: string[];
  youtubeLinks: string[];
  use_exa_ai: boolean;
}

export interface KnowledgeUploadResponse {
  status: string;
  message: string;
  data?: any;
}

// Knowledge data types
export interface KnowledgeItem {
  id: string;
  name: string;
  url?: string | null;
  status: string;
  uploaded_at: string;
}

export interface KnowledgeData {
  files: KnowledgeItem[];
  websites: KnowledgeItem[];
  youtubeLinks: KnowledgeItem[];
  is_enabled?: boolean;
}

// Delete request type
export interface KnowledgeDeleteRequest {
  itemId: string;
  external_user_id: string;
}

// Toggle knowledge request type
export interface KnowledgeToggleRequest {
  external_user_id: string;
  is_enabled: boolean;
}

// Toggle knowledge response type
export interface KnowledgeToggleResponse {
  message: string;
  is_enabled: boolean;
}

// Sitemap types
export interface SitemapUploadRequest {
  external_user_id: string;
  user_email: string;
  sitemap_url: string;
  sitemap_identifier: string;
  account_ids: string[];
  include_paths?: string[];
  exclude_paths?: string[];
}

export interface SitemapUploadResponse {
  status: string;
  message: string;
  data?: any;
}

export interface SitemapItem {
  id: string;
  sitemap_url: string;
  status: string;
  uploaded_at: string;
}

export interface SitemapData {
  sitemaps: SitemapItem[];
}

export interface SitemapDeleteRequest {
  itemId: string;
  external_user_id: string;
}

// Enhanced sitemap crawling request
export interface SitemapCrawlRequest {
  external_user_id: string;
  user_email: string;
  url: string;
  include_paths?: string[];
  exclude_paths?: string[];
  crawl_type: 'sitemap' | 'crawl' | 'individual';
  account_ids: string[];
}

export interface SitemapCrawlResponse {
  status: string;
  message: string;
  crawl_id?: string;
  pages_found?: number;
  data?: any;
}

// API function for upload
const uploadKnowledge = async (
  data: KnowledgeUploadRequest
): Promise<KnowledgeUploadResponse> => {
  // Use FormData for multipart/form-data
  const formData = new FormData();
  formData.append("external_user_id_internal", data.external_user_id_internal);
  data.account_ids.forEach((id) => formData.append("account_ids", id));
  formData.append("user_email", data.user_email);

  // Append all files with the field name "file" to match other implementations
  data.files.forEach((file) => formData.append("files", file));
  data.websites.forEach((site) => formData.append("websites", site));
  data.youtubeLinks.forEach((link) => formData.append("youtubeLinks", link));
  formData.append("use_exa_ai", String(data.use_exa_ai));

  console.log("formData ===>", formData);
  const response = await fetch(DJANGO_API_ROUTES.KNOWLEDGE_UPLOAD, {
    method: "POST",
    // Do not set Content-Type header; browser will set it for multipart/form-data
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Upload failed with status: ${response.status}`
    );
  }

  return response.json();
};

// API function for fetching knowledge data
const fetchKnowledge = async (userId: string): Promise<KnowledgeData> => {
  const response = await fetch(`${DJANGO_API_ROUTES.GET_KNOWLEDGE}${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch knowledge data: ${response.status}`
    );
  }

  return response.json();
};

// API function for deleting knowledge item
const deleteKnowledgeItem = async (
  data: KnowledgeDeleteRequest
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(
    `${DJANGO_API_ROUTES.DELETE_KNOWLEDGE_ITEM}${data.itemId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_user_id: data.external_user_id,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Delete failed with status: ${response.status}`
    );
  }

  return response.json();
};

// API function for toggling knowledge
const toggleKnowledge = async (
  data: KnowledgeToggleRequest
): Promise<KnowledgeToggleResponse> => {
  const response = await fetch(DJANGO_API_ROUTES.TOGGLE_KNOWLEDGE, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Toggle failed with status: ${response.status}`
    );
  }

  return response.json();
};

// API function for uploading sitemap
const uploadSitemap = async (
  data: SitemapUploadRequest
): Promise<SitemapUploadResponse> => {
  const response = await fetch(DJANGO_API_ROUTES.SITEMAP_UPLOAD, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Sitemap upload failed with status: ${response.status}`
    );
  }

  return response.json();
};

// Enhanced API function for sitemap crawling with include/exclude paths
const crawlSitemap = async (
  data: SitemapCrawlRequest
): Promise<SitemapCrawlResponse> => {
  const requestBody = {
    external_user_id: data.external_user_id,
    user_email: data.user_email,
    url: data.url,
    crawl_type: data.crawl_type,
    account_ids: data.account_ids,
    ...(data.include_paths && data.include_paths.length > 0 && {
      include_paths: data.include_paths
    }),
    ...(data.exclude_paths && data.exclude_paths.length > 0 && {
      exclude_paths: data.exclude_paths
    })
  };

  const response = await fetch(DJANGO_API_ROUTES.SITEMAP_UPLOAD, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Sitemap crawl failed with status: ${response.status}`
    );
  }

  return response.json();
};

// API function for fetching sitemaps
const fetchSitemaps = async (
  userId: string,
  userEmail: string
): Promise<SitemapData> => {
  const params = new URLSearchParams({
    account_ids: userId,
    external_user_id: userId,
    user_email: userEmail,
  });

  const response = await fetch(
    `${DJANGO_API_ROUTES.GET_SITEMAPS}${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch sitemaps: ${response.status}`
    );
  }

  return response.json();
};

// API function for deleting sitemap
const deleteSitemap = async (
  data: SitemapDeleteRequest
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(
    `${DJANGO_API_ROUTES.DELETE_SITEMAP}${data.itemId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_user_id: data.external_user_id,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
        `Sitemap delete failed with status: ${response.status}`
    );
  }

  return response.json();
};

// Upload hook
export const useKnowledgeUpload = () => {
  return useMutation({
    mutationFn: uploadKnowledge,
    onSuccess: (data) => {
      console.log("Knowledge upload successful:", data);
      toastSuccess(
        "Knowledge Upload Successful",
        "Your knowledge base has been updated successfully."
      );
    },
    onError: (error: Error) => {
      console.error("Knowledge upload failed:", error);
      toastError(
        "Upload Failed",
        error.message || "Failed to upload knowledge base. Please try again."
      );
    },
  });
};

// Fetch hook
export const useKnowledgeData = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["knowledge", userId],
    queryFn: () => fetchKnowledge(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Delete hook
export const useKnowledgeDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteKnowledgeItem,
    onSuccess: (data, variables) => {
      console.log("Knowledge item deleted successfully:", data);
      toastSuccess(
        "Item Deleted",
        "Knowledge item has been deleted successfully."
      );

      // Invalidate and refetch knowledge data
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
    onError: (error: Error) => {
      console.error("Knowledge delete failed:", error);
      toastError(
        "Delete Failed",
        error.message || "Failed to delete knowledge item. Please try again."
      );
    },
  });
};

// Toggle knowledge hook with optimistic updates and debouncing
export const useKnowledgeToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleKnowledge,
    onMutate: async (newToggleData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["knowledge"] });

      // Snapshot the previous value
      const previousKnowledge = queryClient.getQueryData(["knowledge"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["knowledge"], (old: any) => {
        if (old) {
          return {
            ...old,
            is_enabled: newToggleData.is_enabled,
          };
        }
        return old;
      });

      // Return a context object with the snapshotted value
      return { previousKnowledge };
    },
    onSuccess: (data) => {
      console.log("Knowledge toggle successful:", data);
      // The optimistic update will be automatically replaced with the real data
      // No need for additional invalidation since we're using optimistic updates
    },
    onError: (error: Error, variables, context) => {
      console.error("Knowledge toggle failed:", error);

      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousKnowledge) {
        queryClient.setQueryData(["knowledge"], context.previousKnowledge);
      }

      toastError(
        "Toggle Failed",
        error.message ||
          "Failed to update knowledge settings. Please try again."
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
};

// Sitemap upload hook
export const useSitemapUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadSitemap,
    onSuccess: (data) => {
      console.log("Sitemap upload successful:", data);
      toastSuccess(
        "Sitemap Upload Successful",
        "Your sitemap has been uploaded successfully."
      );

      // Invalidate and refetch sitemap data
      queryClient.invalidateQueries({ queryKey: ["sitemaps"] });
    },
    onError: (error: Error) => {
      console.error("Sitemap upload failed:", error);
      toastError(
        "Upload Failed",
        error.message || "Failed to upload sitemap. Please try again."
      );
    },
  });
};

// Fetch sitemaps hook
export const useSitemapsData = (
  userId: string | undefined,
  userEmail: string | undefined
) => {
  return useQuery({
    queryKey: ["sitemaps", userId, userEmail],
    queryFn: () => fetchSitemaps(userId!, userEmail!),
    enabled: !!userId && !!userEmail,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Delete sitemap hook
export const useSitemapDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSitemap,
    onSuccess: (data, variables) => {
      console.log("Sitemap deleted successfully:", data);
      toastSuccess("Sitemap Deleted", "Sitemap has been deleted successfully.");

      // Invalidate and refetch sitemap data
      queryClient.invalidateQueries({ queryKey: ["sitemaps"] });
    },
    onError: (error: Error) => {
      console.error("Sitemap delete failed:", error);
      toastError(
        "Delete Failed",
        error.message || "Failed to delete sitemap. Please try again."
      );
    },
  });
};

// Enhanced sitemap crawling hook
export const useSitemapCrawl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: crawlSitemap,
    onSuccess: (data) => {
      console.log("Sitemap crawl successful:", data);
      toastSuccess(
        "Crawl Started",
        `Successfully started crawling. ${data.pages_found ? `Found ${data.pages_found} pages.` : ""}`
      );

      // Invalidate and refetch sitemap data
      queryClient.invalidateQueries({ queryKey: ["sitemaps"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
    onError: (error: Error) => {
      console.error("Sitemap crawl failed:", error);
      toastError(
        "Crawl Failed",
        error.message || "Failed to start crawling. Please try again."
      );
    },
  });
};
