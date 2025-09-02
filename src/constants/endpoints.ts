const BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_BASE_URL;
const BASE_URL_WS = process.env.NEXT_PUBLIC_BASE_URL_WS;
// Enterprise Search Django API Routes
export const DJANGO_API_ROUTES = {
  INGEST: `${BASE_URL}/ingest`,
  SEARCH: `${BASE_URL}/search`,
  SUGGESTED: `${BASE_URL}/suggested-documents`,
  RECENT: `${BASE_URL}/recent-searches`,
  TRENDING: `${BASE_URL}/trending-documents`,
  DYNAMIC_SUGGESTIONS_MULTI_ACCOUNT: `${BASE_URL}/dynamic-suggestions`,

  FETCH_FILES: `${BASE_URL}/fetch-by-account`,

  DISCONNECT_ACCOUNT: `${BASE_URL}/disconnect`,
  // websocket - ensure this matches FastAPI endpoint structure
  INGESTION_WEBSOCKET: `${BASE_URL_WS}/ws/ingestion`,
  // Internal Knowledge Base
  KNOWLEDGE_UPLOAD: `${BASE_URL}/knowledge/upload`,
  GET_KNOWLEDGE: `${BASE_URL}/knowledge?external_user_id=`,
  DELETE_KNOWLEDGE_ITEM: `${BASE_URL}/knowledge/`,
  TOGGLE_KNOWLEDGE: `${BASE_URL}/knowledge/settings`,
  // Sitemap
  SITEMAP_UPLOAD: `${BASE_URL}/sitemap/upload`,
  GET_SITEMAPS: `${BASE_URL}/sitemap/list?account_ids=`,
  DELETE_SITEMAP: `${BASE_URL}/knowledge/sitemap/`,
};
