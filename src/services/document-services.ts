import { httpClient, krooloHttpClient } from "@/app/(app)/chat/utils/https";

// Define types for params where not available
interface FetchDocumentListParams {
  type?: string;
  skip?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

interface FetchFolderListParams {
  skip?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

export async function fetchDocumentList(
  params: FetchDocumentListParams,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  params.type ??= "owned";
  params.skip ??= 0;
  params.limit ??= 20;

  const { data } = await httpClient.get("v2/documents", {
    params,
    signal,
  });

  return data;
}

export async function fetchFolderList(
  params: FetchFolderListParams,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  params.skip ??= 0;
  params.limit ??= 20;

  const { data } = await httpClient.get("v2/documents/folder", {
    params,
    signal,
  });

  return data;
}

export async function fetchsidebarFolderList(
  workspaceId: string
): Promise<Record<string, unknown>> {
  const userId = localStorage.getItem("userId");

  const { data } = await krooloHttpClient.get(
    `${process.env.REACT_APP_API_URL}/sidebar`,
    {
      params: { workspaceId, userId },
    }
  );

  return data;
}

export async function duplicateFolder(
  folderId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(
    "v2/documents/folder/duplicate/" + folderId
  );
  return data;
}

export async function getContentCount(
  folderId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(
    "v2/documents/folder/" + folderId + "/content-count"
  );
  return data;
}

export async function reorderFolderList({
  workSpaceId,
  folderData,
}: {
  workSpaceId: string;
  folderData: unknown[];
}): Promise<Record<string, unknown>> {
  const { data } = await krooloHttpClient.post(
    "/document/reorder-folder-list",
    {
      workSpaceId,
      folderData,
    }
  );
  return data;
}

export async function reorderDocumnetList({
  workSpaceId,
  docsData,
  userId,
  folderId,
}: {
  workSpaceId: string;
  docsData: unknown[];
  userId: string;
  folderId: string;
}): Promise<Record<string, unknown>> {
  const { data } = await krooloHttpClient.post("/document/reorder-docs-list", {
    workSpaceId,
    docsData,
    userId,
    folderId,
  });
  return data;
}

export async function fetchDocumentDetails(
  documentId: string,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/${documentId}`, {
    signal,
  });

  return data;
}

export async function fetchPublicDocumentDetails(
  documentId: string,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`public/docs/${documentId}`, {
    signal,
  });

  return data;
}

export async function createDoc({
  title,
  workspaceId,
  parentId,
  content,
  categoryType,
  useCaseType,
  folderId,
  icon,
  banner,
  reorderIndex,
  linkedFolderId,
}: {
  title: string;
  workspaceId: string;
  parentId?: string;
  content?: string;
  categoryType?: string;
  useCaseType?: string;
  folderId?: string;
  icon?: string;
  banner?: string;
  reorderIndex?: number;
  linkedFolderId?: string;
}): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post("v2/documents", {
    workspaceId,
    title,
    parentId,
    content,
    categoryType,
    useCaseType,
    folderId,
    icon,
    banner,
    reorderIndex,
    linkedFolderId,
  });

  return data;
}

export async function createFolder({
  folderName,
  workspaceId,
  parentId,
  linkedFolderId,
}: {
  folderName: string;
  workspaceId: string;
  parentId?: string;
  linkedFolderId?: string;
}): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post("v2/documents/folder", {
    workspaceId,
    folderName,
    parentId,
    linkedFolderId,
  });

  return data;
}

export async function updateFolder(
  folderId: string,
  partial: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.patch(
    `v2/documents/folder/${folderId}`,
    partial
  );

  return data;
}

export async function deleteFolder(
  folderId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.delete(`v2/documents/folder/${folderId}`);

  return data;
}

export async function fetchFolderDetails(
  folderId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/folder/${folderId}`);

  return data;
}

export async function deleteDocument(
  documentId: string,
  permanent = false
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.delete(`v2/documents/${documentId}`, {
    params: { permanent },
  });

  return data;
}

export async function restoreDocument(
  documentId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.patch(`v2/documents/${documentId}/restore`);

  return data;
}

export async function deleteIndexedDbDocumentInstance(
  documentId: string
): Promise<Event> {
  return new Promise((resolve, reject) => {
    const DBDeleteRequest = indexedDB.deleteDatabase(documentId);
    DBDeleteRequest.addEventListener("error", reject);
    DBDeleteRequest.addEventListener("success", resolve);
  });
}

export async function updateDocument(
  documentId: string,
  partial: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.patch(
    "v2/documents/" + documentId,
    partial
  );

  return data;
}

export async function documentOwnerChangeService(
  documentId: string,
  bodyData: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(
    `v2/documents/${documentId}/owner-change`,
    bodyData
  );

  return data;
}

export async function duplicateDocument(
  documentId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(
    "v2/documents/duplicate/" + documentId
  );
  return data;
}

export async function updateSelfDocumentMembership(
  documentId: string,
  partial: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.patch(
    `v2/documents/${documentId}/update-self-membership`,
    partial
  );

  return data;
}

export async function updateDocumentMemberRole(
  documentId: string,
  userId: string,
  role: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.patch(
    `v2/documents/members/${documentId}/role`,
    {
      userId,
      role,
    }
  );

  return data;
}

export async function removeDocumentMember(
  memberId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(
    `v2/documents/member/${memberId}/remove`
  );

  return data;
}

export async function inviteDocumentMembers(
  documentId: string,
  members: string[] | Record<string, unknown>[]
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(
    `v2/documents/members/${documentId}/invite`,
    {
      members,
    }
  );

  return data;
}

export async function getDocumentProjectLinks({
  documentId,
  projectId,
}: {
  documentId: string;
  projectId: string;
}): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/link/project`, {
    params: { documentId, projectId },
  });

  return data;
}

export async function removeDocumentProjectLink(
  documentId: string,
  projectId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.delete(`v2/documents/link/project`, {
    params: { documentId, projectId },
  });

  return data;
}

export async function createDocumentProjectLink(
  documentId: string,
  projectId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(`v2/documents/link/project`, {
    documentId,
    projectId,
  });

  return data;
}

export async function getDocumentSprintLinks({
  documentId,
  sprintId,
}: {
  documentId: string;
  sprintId: string;
}): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/link/sprint`, {
    params: { documentId, sprintId },
  });

  return data;
}

export async function removeDocumentSprintLink(
  documentId: string,
  sprintId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.delete(`v2/documents/link/sprint`, {
    params: { documentId, sprintId },
  });

  return data;
}

export async function createDocumentSprintLink(
  documentId: string,
  sprintId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(`v2/documents/link/sprint`, {
    documentId,
    sprintId,
  });

  return data;
}

export async function getDocumentTaskLinks({
  documentId,
  taskId,
}: {
  documentId: string;
  taskId: string;
}): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/link/task`, {
    params: { documentId, taskId },
  });

  return data;
}

export async function removeDocumentTaskLink(
  documentId: string,
  taskId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.delete(`v2/documents/link/task`, {
    params: { documentId, taskId },
  });

  return data;
}

export async function createDocumentTaskLink(
  documentId: string,
  taskId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(`v2/documents/link/task`, {
    documentId,
    taskId,
  });

  return data;
}

export async function getDocumentPortfolioLinks({
  documentId,
  portfolioId,
}: {
  documentId: string;
  portfolioId: string;
}): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/link/portfolio`, {
    params: { documentId, portfolioId },
  });

  return data;
}

export async function removeDocumentPortfolioLink(
  documentId: string,
  portfolioId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.delete(`v2/documents/link/portfolio`, {
    params: { documentId, portfolioId },
  });

  return data;
}

export async function createDocumentPortfolioLink(
  documentId: string,
  portfolioId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(`v2/documents/link/portfolio`, {
    documentId,
    portfolioId,
  });

  return data;
}

export async function getCategories(): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/template-categories`);
  return data;
}

export async function getTemplateById(
  categoryId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/templates/${categoryId}`);
  return data;
}

export async function getFavourites(): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/template-favourite`);
  return data;
}

export async function addToFovourites(
  templateId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(
    `v2/documents/template-favourite/addFavourite/${templateId}`
  );
  return data;
}

export async function removeFromFavourites(
  templateId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(
    `v2/documents/template-favourite/removeFavourite/${templateId}`
  );
  return data;
}

export async function countFavourites(): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(
    `v2/documents/template-favourite/favourites`
  );
  return data;
}

export async function updateTemplate(
  templateId: string,
  partial: Record<string, unknown>
): Promise<void> {
  await httpClient.patch(`v2/documents/templates/${templateId}`, partial);
}

export async function updateMember(
  partial: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.patch(
    "v2/documents/members/bulkUpdate",
    partial
  );

  return data;
}

export async function fetchDocumentVersions(
  documentId: string,
  { signal }: { signal?: AbortSignal } = {}
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/versions/${documentId}`, {
    signal,
  });

  return data;
}

export async function createDocumentVersion(
  payload: Record<string, unknown> & { documentId: string }
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(
    `v2/documents/versions/${payload.documentId}`,
    payload
  );

  return data;
}

export async function publishDocumentVersion(
  documentId: string,
  partial: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.patch(
    `v2/documents/publish/${documentId}`,
    partial
  );

  return data;
}

export async function updateDocumentVersion(
  documentId: string,
  versionId: string,
  partial: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.patch(
    `v2/documents/versions/${documentId}/${versionId}`,
    partial
  );

  return data;
}

export async function deleteDocumentVersion(
  documentId: string,
  versionId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.delete(
    `v2/documents/versions/${documentId}/${versionId}`
  );

  return data;
}

export async function createDocumentBoardLink(
  documentId: string,
  boardId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(`v2/documents/link/board`, {
    documentId,
    boardId,
  });

  return data;
}

export async function removeDocumentBoardLink(
  documentId: string,
  boardId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.delete(`v2/documents/link/board`, {
    params: { documentId, boardId },
  });

  return data;
}

export async function getDocumentBoardLinks({
  documentId,
  boardId,
}: {
  documentId: string;
  boardId: string;
}): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/link/board`, {
    params: { documentId, boardId },
  });

  return data;
}

export async function getDocumentItemLinks({
  documentId,
  itemId,
}: {
  documentId: string;
  itemId: string;
}): Promise<Record<string, unknown>> {
  const { data } = await httpClient.get(`v2/documents/link/board-item`, {
    params: { documentId, boardItemId: itemId },
  });

  return data;
}

export async function removeDocumentItemLink(
  documentId: string,
  itemId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.delete(`v2/documents/link/board-item`, {
    params: { documentId, boardItemId: itemId },
  });

  return data;
}

export async function createDocumentItemLink(
  documentId: string,
  itemId: string
): Promise<Record<string, unknown>> {
  const { data } = await httpClient.post(`v2/documents/link/board-item`, {
    documentId,
    boardItemId: itemId,
  });

  return data;
}
