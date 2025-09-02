// Interfaces
export interface KnowledgeFile {
  id: string;
  file: File;
}

export interface KnowledgeLink {
  id: string;
  url: string;
  title?: string;
  favicon?: string;
  status?: string;
  uploaded_at?: string;
}

// Utility Functions
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
};

// YouTube URL validation
export const isValidYoutubeUrl = (url: string): boolean => {
  return !!url.match(
    /^(https?:\/\/)?(www\.|music\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(?!channel\/)(?!@)(.+)?$/
  );
};

// YouTube link handler
export const handleScrapYoutube = async (
  youtubeInput: string,
  setYoutubeInput: (v: string) => void,
  setYoutubeLinks: React.Dispatch<React.SetStateAction<KnowledgeLink[]>>,
  youtubeLinks: KnowledgeLink[],
  toastWarning: (message: string) => void
) => {
  if (!isValidYoutubeUrl(youtubeInput)) {
    toastWarning("Invalid Youtube URL. Enter a valid youtube URL.");
    return;
  }
  try {
    const res = await fetch(
      `https://noembed.com/embed?dataType=json&url=${youtubeInput}`
    );
    const data = await res.json();
    setYoutubeLinks([
      ...youtubeLinks,
      {
        id: crypto.randomUUID(),
        url: data?.url || youtubeInput,
        title: data?.title || undefined,
      },
    ]);
    setYoutubeInput("");
  } catch (e) {
    toastWarning("Failed to fetch YouTube metadata.");
    setYoutubeLinks([
      ...youtubeLinks,
      { id: crypto.randomUUID(), url: youtubeInput },
    ]);
    setYoutubeInput("");
  }
};

// Website URL validation
export const validateURL = (string: string): boolean => {
  const res = string.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g
  );
  return res !== null;
};

// Convert to HTTPS URL helper
export const convertToHttpsUrl = (inputUrl: string): string => {
  const pattern =
    /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+)(.*)$/;
  const replacement = "https://$3$5";
  return inputUrl.replace(pattern, replacement);
};

// Website link handler
export const handleScrapUrl = async (
  websiteInput: string,
  setWebsiteInput: (v: string) => void,
  setWebsites: React.Dispatch<React.SetStateAction<KnowledgeLink[]>>,
  websites: KnowledgeLink[],
  toastWarning: (message: string) => void
) => {
  if (!validateURL(websiteInput)) {
    toastWarning("Invalid website URL. Enter a valid website URL.");
    return;
  }
  const link = websiteInput?.replace(/^(https?:\/\/)?(www\.)?/, "");
  const fileName = link?.split(/[./]/)[0];
  const data: { [key: string]: any } = {
    fileUrl: convertToHttpsUrl(websiteInput),
    fileName: fileName?.charAt(0)?.toUpperCase() + fileName?.slice(1),
    fileType: "link",
  };
  // Use Google S2 favicon service
  const domain =
    websiteInput.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i)?.[1] || link;
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  setWebsites([
    ...websites,
    {
      id: crypto.randomUUID(),
      url: convertToHttpsUrl(websiteInput),
      title: data.fileName,
      favicon,
    },
  ]);
  setWebsiteInput("");
};

// Helper to extract extension from file name
export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
};
