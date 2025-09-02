import type {
  ExportOptionProps,
  SelectedLlmType,
  ToollabelMapProps,
} from "@/types/agent";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getJsonMarkdown = (content: object = {}) => {
  let jsonBlock = "";
  try {
    jsonBlock = `\`\`\`json\n${JSON.stringify(content, null, 2)}\n\`\`\``;
  } catch {
    const coerced = content as unknown;
    jsonBlock = `\`\`\`\n${String(coerced)}\n\`\`\``;
  }

  return jsonBlock;
};

export const getDomainName = (url: string) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "Unknown";
  }
};

export const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  } catch {
    return null;
  }
};

export function decodeBase64Audio(
  base64String: string,
  mimeType = "audio/mpeg",
  sampleRate = 44100,
  numChannels = 1
): string {
  // Convert the Base64 string to binary
  const byteString = atob(base64String);
  const byteArray = new Uint8Array(byteString.length);

  for (let i = 0; i < byteString.length; i += 1) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  let blob: Blob;

  if (mimeType === "audio/pcm16") {
    // Convert PCM16 raw audio to WAV format
    const wavHeader = createWavHeader(
      byteArray.length,
      sampleRate,
      numChannels
    );
    const wavData = new Uint8Array(wavHeader.length + byteArray.length);
    wavData.set(wavHeader, 0);
    wavData.set(byteArray, wavHeader.length);

    blob = new Blob([wavData], { type: "audio/wav" }); // Convert PCM to WAV
  } else {
    blob = new Blob([byteArray], { type: mimeType });
  }

  return URL.createObjectURL(blob);
}

// Function to generate WAV header for PCM16
function createWavHeader(
  dataLength: number,
  sampleRate: number,
  numChannels: number
): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const blockAlign = numChannels * 2; // 16-bit PCM = 2 bytes per sample
  const byteRate = sampleRate * blockAlign;

  // "RIFF" chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataLength, true); // File size
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1 size
  view.setUint16(20, 1, true); // Audio format (1 = PCM)
  view.setUint16(22, numChannels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, byteRate, true); // Byte rate
  view.setUint16(32, blockAlign, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample (16-bit)

  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLength, true); // Data size

  return new Uint8Array(header);
}

export const EXPORT_TYPES: ExportOptionProps[] = [
  {
    id: 1,
    title: "PDF",
    icon: "export-pdf",
  },
  {
    id: 2,
    title: "Markdown",
    icon: "export-mark",
  },
];

export const LlmsList: SelectedLlmType[] = [
  {
    modelName: "Anthropic Claude 3.7",
    modelId: "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    shortName: "Anthropic Claude 3.7",
    modelIcon: "anthropic_icon",
    provider: "aws",
  },
  {
    modelName: "Claude Sonnet 4",
    modelId: "us.anthropic.claude-sonnet-4-20250514-v1:0",
    shortName: "Claude Sonnet 4",
    modelIcon: "anthropic_icon",
    provider: "aws",
  },
  {
    modelName: "GPT-4.1",
    modelId: "gpt-4.1",
    shortName: "GPT-4.1",
    modelIcon: "gpt_icon",
    provider: "openai",
  },
  {
    modelName: "GPT-4.1-nano",
    modelId: "gpt-4.1-nano",
    shortName: "GPT-4.1-nano",
    modelIcon: "gpt_icon",
    provider: "openai",
  },
  {
    modelName: "GPT-4.1-mini",
    modelId: "gpt-4.1-mini",
    shortName: "GPT-4.1-mini",
    modelIcon: "gpt_icon",
    provider: "openai",
  },
  {
    modelName: "Deepseek R1",
    modelId: "deepseek/deepseek-r1",
    shortName: "Deepseek R1",
    modelIcon: "deepseek_icon",
    provider: "openrouter",
  },
  {
    modelName: "Deepseek V3",
    modelId: "deepseek/deepseek-chat-v3-0324",
    shortName: "Deepseek V3",
    modelIcon: "deepseek_icon",
    provider: "openrouter",
  },
  {
    modelName: "Gemini 2.0",
    modelId: "google/gemini-2.0-flash-001",
    shortName: "Gemini 2.0",
    modelIcon: "gemini_icon",
    provider: "openrouter",
  },
  {
    modelName: "Gemini 2.5 Flash",
    modelId: "gemini/gemini-2.5-flash-preview-05-20",
    shortName: "Gemini 2.5 Flash",
    modelIcon: "gemini_icon",
    provider: "openrouter",
  },
  {
    modelName: "Gemini 2.5 Pro",
    modelId: "gemini/gemini-2.5-pro-preview-03-25",
    shortName: "Gemini 2.5 Pro",
    modelIcon: "gemini_icon",
    provider: "openrouter",
  },
  {
    modelName: "Llama 3.3",
    modelId: "llama-3.3-70b-versatile",
    shortName: "Llama3.3",
    modelIcon: "meta_icon",
    provider: "groq",
  },
  {
    modelName: "Llama 4 maverick",
    modelId: "meta-llama/llama-4-maverick-17b-128e-instruct",
    shortName: "Llama 4 maverick",
    modelIcon: "meta_icon",
    provider: "groq",
  },
];

export const LanguagesList = [
  { code: "ar", name: "Arabic" },
  { code: "as", name: "Assamese" },
  { code: "bn", name: "Bengali" },
  { code: "ceb", name: "Cebuano" },
  { code: "zh", name: "Chinese" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "id", name: "Indonesian" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "kn", name: "Kannada" },
  { code: "ko", name: "Korean" },
  { code: "ms", name: "Malay" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "ne", name: "Nepali" },
  { code: "no", name: "Norwegian" },
  { code: "or", name: "Odia" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "pa", name: "Punjabi" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sa", name: "Sanskrit" },
  { code: "es", name: "Spanish" },
  { code: "sv", name: "Swedish" },
  { code: "tl", name: "Tagalog" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "vi", name: "Vietnamese" },
];

interface FileIconProps {
  fileType: string;
}

export const uploadMemeTypes = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

export const PDF_EXTENSION = ["pdf"];
export const GIF_EXTENSION = ["gif"];
export const SVG_EXTENSION = ["svg", "svgz"];
export const OTHER_IMG_EXTENSION = [
  "webp",
  "ico",
  "tif",
  "tiff",
  "psd",
  "raw",
  "bmp",
];
export const PNG_EXTENSION = ["png", "apng"];
export const JPEG_EXTENSION = ["jpg", "jpeg", "jpe", "jif", "jfif", "jfi"];
export const VIDEO_EXTENSION = [
  "mov",
  "mp4",
  "m4v",
  "3gp",
  "3g2",
  "mj2",
  "mkv",
  "webm",
  "wmv",
  "avi",
  "avchd",
  "flv",
  "f4v",
  "f4p",
  "f4a",
  "f4b",
];
export const AUDIO_EXTENSION = [
  "mp3",
  "wav",
  "ogg",
  "flac",
  "aac",
  "wma",
  "m4a",
  "aiff",
  "alac",
  "amr",
  "mid",
  "midi",
];

export const TXT_EXTENSION = ["txt", "rtf"];
export const MS_WORD_EXTENSION = [
  "doc",
  "dot",
  "wbk",
  "docx",
  "docm",
  "dotx",
  "dotm",
  "docb",
  "odt",
];
export const PPT_EXTENSION = [
  "ppt",
  "pot",
  "pps",
  "pptx",
  "pptm",
  "potx",
  "potm",
  "ppam",
  "ppsx",
  "ppsm",
  "sldx",
  "sldm",
  "ods",
];
export const EXCEL_EXTENSION = [
  "xls",
  "xlt",
  "xlm",
  "xlsx",
  "xlsm",
  "xltx",
  "xltm",
  "xlsb",
  "xla",
  "xlam",
  "xll",
  "xlw",
  "ods",
  "csv",
];

export const IMAGE_EXTENSION = [
  GIF_EXTENSION,
  OTHER_IMG_EXTENSION,
  SVG_EXTENSION,
  PNG_EXTENSION,
  JPEG_EXTENSION,
].flat();

export const FileIcon = ({ fileType }: FileIconProps) => {
  const lowerCaseFileType = fileType.toLowerCase();

  if (IMAGE_EXTENSION.includes(lowerCaseFileType)) {
    return "image_icon";
  } else if (PDF_EXTENSION.includes(lowerCaseFileType)) {
    return "pdf_icon";
  } else if (TXT_EXTENSION.includes(lowerCaseFileType)) {
    return "txt_icon";
  } else if (MS_WORD_EXTENSION.includes(lowerCaseFileType)) {
    return "docx_icon";
  } else if (EXCEL_EXTENSION.includes(lowerCaseFileType)) {
    return "csv_icon";
  } else if (PPT_EXTENSION.includes(lowerCaseFileType)) {
    return "ppt_icon";
  } else if (AUDIO_EXTENSION.includes(lowerCaseFileType)) {
    return "audio_icon";
  } else if (VIDEO_EXTENSION.includes(lowerCaseFileType)) {
    return "video_icon";
  }

  return "unknown_icon";
};
export const ToolLabelMap = ({ tool_name }: ToollabelMapProps) => {
  const type = tool_name.toLowerCase();
  if (type === "web_search_using_tavily") {
    return "Searching";
  } else if (type === "asearch_knowledge_base") {
    return "Searching Knowledge base";
  } else if (type === "think") {
    return "Thinking";
  } else if (type === "analyse") {
    return "Analysing";
  } else if (type === "search_user_files") {
    return "Searching User Files";
  } else if (type === "search_kroolo_help_centre") {
    return "Searching Help Centre";
  }
  return "Searching";
};
