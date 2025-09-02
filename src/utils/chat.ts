import {
  FileText,
  FileSpreadsheet,
  ImageIcon,
  File,
  Video,
  Music,
} from "lucide-react";

// Helper function to get file icon and type label in chatbox
export const getFileInfo = (type: string) => {
  switch (type) {
    case "spreadsheet":
      return {
        icon: FileSpreadsheet,
        label: "Spreadsheet",
        bgColor: "bg-green-100 dark:bg-green-900/20",
        iconColor: "text-green-600 dark:text-green-400",
      };
    case "document":
      return {
        icon: FileText,
        label: "Document",
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
        iconColor: "text-blue-600 dark:text-blue-400",
      };
    case "image":
      return {
        icon: ImageIcon,
        label: "Image",
        bgColor: "bg-purple-100 dark:bg-purple-900/20",
        iconColor: "text-purple-600 dark:text-purple-400",
      };
    case "video":
      return {
        icon: Video,
        label: "Video",
        bgColor: "bg-red-100 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-400",
      };
    case "audio":
      return {
        icon: Music,
        label: "Audio",
        bgColor: "bg-orange-100 dark:bg-orange-900/20",
        iconColor: "text-orange-600 dark:text-orange-400",
      };
    default:
      return {
        icon: File,
        label: "File",
        bgColor: "bg-gray-100 dark:bg-gray-800",
        iconColor: "text-gray-600 dark:text-gray-400",
      };
  }
};
