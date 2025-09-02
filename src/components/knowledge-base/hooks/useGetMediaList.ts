// Define the media item interface
interface MediaItem {
  fileType?: string;
  [key: string]: unknown;
}

// Define the filter type union
type MediaFilterType = "sources" | "link" | "youtube" | "files";

export const useGetMediaList = (
  mediaArray: MediaItem[] = [],
  type: MediaFilterType
): MediaItem[] => {
  if (!mediaArray || !Array.isArray(mediaArray)) {
    return [];
  }

  switch (type) {
    case "sources":
      return mediaArray.filter(
        (item) => item.fileType === "Project" || item.fileType === "Doc"
      );

    case "link":
      return mediaArray.filter((item) => item.fileType === "link");

    case "youtube":
      return mediaArray.filter((item) => item.fileType === "youtube");

    default:
      return mediaArray.filter((item) => {
        const fileType = item.fileType;
        return (
          fileType && !["Project", "link", "youtube", "Doc"].includes(fileType)
        );
      });
  }
};

export default useGetMediaList;
