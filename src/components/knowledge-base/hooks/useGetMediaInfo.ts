export type MediaItem = {
  fileType?: string;
  fileSize?: string;
  [key: string]: unknown;
};

type MediaInfoResult = {
  sources: { count: number };
  files: { count: number; size: number; sizeFormatted?: string };
  link: { count: number };
  youtube: { count: number };
  total_count: number;
  total_size: number;
  total_size_formatted: string;
};

const parseSizeToBytes = (sizeStr: string | undefined): number => {
  if (!sizeStr || typeof sizeStr !== "string") return 0;

  const parts = sizeStr.trim().split(/\s+/);
  if (parts.length < 2) return 0;

  const value = parseFloat(parts[0]);
  if (isNaN(value)) return 0;

  const unit = parts[parts.length - 1].toLowerCase();

  const multipliers: Record<string, number> = {
    byte: 1,
    bytes: 1,
    b: 1,
    kb: 1024,
    k: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    tb: 1024 * 1024 * 1024 * 1024,
  };

  return value * (multipliers[unit] || 0);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0.00 KB";

  const units = ["KB", "MB", "GB", "TB"];
  const sizes = [
    1024,
    1024 * 1024,
    1024 * 1024 * 1024,
    1024 * 1024 * 1024 * 1024,
  ];

  let unitIndex = 0;
  for (let i = 0; i < sizes.length; i++) {
    if (bytes < sizes[i]) break;
    unitIndex = i;
  }

  const size = (bytes / sizes[unitIndex]).toFixed(2);
  return `${size} ${units[unitIndex]}`;
};

export const useGetMediaInfo = (
  mediaArray: MediaItem[] = []
): MediaInfoResult => {
  if (!mediaArray || !Array.isArray(mediaArray)) {
    return {
      sources: { count: 0 },
      files: { count: 0, size: 0, sizeFormatted: "0.00 KB" },
      link: { count: 0 },
      youtube: { count: 0 },
      total_count: 0,
      total_size: 0,
      total_size_formatted: "0.00 KB",
    };
  }

  const result: MediaInfoResult = {
    sources: { count: 0 },
    files: { count: 0, size: 0 },
    link: { count: 0 },
    youtube: { count: 0 },
    total_count: 0,
    total_size: 0,
    total_size_formatted: "0.00 KB",
  };

  mediaArray.forEach((item) => {
    const fileType = item.fileType;

    if (fileType === "Project" || fileType === "Doc") {
      result.sources.count++;
    } else if (fileType === "link") {
      result.link.count++;
    } else if (fileType === "youtube") {
      result.youtube.count++;
    } else if (
      fileType &&
      !["Project", "link", "youtube", "Doc"].includes(fileType)
    ) {
      result.files.count++;

      if (item.fileSize) {
        const sizeInBytes = parseSizeToBytes(item.fileSize as string);
        result.files.size += sizeInBytes;
      }
    }
  });

  result.total_count =
    result.sources.count +
    result.files.count +
    result.link.count +
    result.youtube.count;
  result.total_size = result.files.size;
  result.total_size_formatted = formatFileSize(result.total_size);
  result.files.sizeFormatted = formatFileSize(result.files.size);

  return result;
};

export default useGetMediaInfo;
