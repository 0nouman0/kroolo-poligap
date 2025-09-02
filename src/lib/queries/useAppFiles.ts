import { DJANGO_API_ROUTES } from "@/constants/endpoints";
import { useIntegrationStore } from "@/stores/integration-store";
import { useUserStore } from "@/stores/user-store";
import { useQuery } from "@tanstack/react-query";

export interface DriveFile {
  id: string;
  title: string;
  file_url: string;
  integration_type: string;
  author_email: string;
  created_at: string;
  updated_at: string;
  file_type: string;
  file_size: number;
  content_preview: string;
  access_control: {
    account_id: string;
    external_user_id: string;
    authorized_emails: string[];
    permission_level: string;
    created_by: string;
    last_updated: string;
  };
  folder_structure: {
    folder_path: string;
    folder_names: string[];
    parent_folder_id: string;
    parent_folder_name: string;
    folder_breadcrumb: string;
    folder_depth: number;
    is_in_folder: boolean;
    is_folder: boolean;
    workspace_info: Record<string, any>;
    hierarchy_info: Record<string, any>;
    drive_id: string;
    drive_name: string;
  };
}

// Extend or adjust these as you learn the real API shape for each integration
export interface DropboxFile extends DriveFile {
  // Dropbox-specific fields can go here
}
export interface SharePointFile extends DriveFile {
  // SharePoint-specific fields can go here
}
export interface ConfluenceFile extends DriveFile {
  // Confluence-specific fields can go here
}
export interface JiraFile extends DriveFile {
  // Jira-specific fields can go here
}
export interface Document360File extends DriveFile {
  // Document360-specific fields can go here
}
export interface SlackFile extends DriveFile {
  // Slack-specific fields can go here
}
export interface ZendeskFile extends DriveFile {
  // Zendesk-specific fields can go here
}

export type AppFile =
  | DriveFile
  | DropboxFile
  | SharePointFile
  | ConfluenceFile
  | JiraFile
  | Document360File
  | SlackFile
  | ZendeskFile;

export interface FilesResponse {
  account_id: string;
  total: number;
  data: DriveFile[];
  rbac_structure?: string;
}

const fetchAppsFiles = async (account_id: string) => {
  const { userData } = useUserStore.getState();
  const external_user_id = userData?.userId || "";
  const user_email = userData?.email || "";

  const res = await fetch(DJANGO_API_ROUTES.FETCH_FILES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_ids: [account_id],
      external_user_id,
      user_email,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch drive files");
  }
  const data = await res.json();
  return data.data;
};

export function useAppFiles(account_id: string) {
  return useQuery({
    queryKey: ["driveFiles", account_id],
    queryFn: () => fetchAppsFiles(account_id),
    enabled: !!account_id,
  });
}
