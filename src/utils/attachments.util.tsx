import React from 'react';
import Image from 'next/image';

import {
  AUDIO_EXTENSION,
  EXCEL_EXTENSION,
  IMAGE_EXTENSION,
  MS_WORD_EXTENSION,
  PDF_EXTENSION,
  PPT_EXTENSION,
  TXT_EXTENSION,
  VIDEO_EXTENSION,
} from "@/constants/app.constant";

// Use direct image paths instead of SVG imports
const getFileIconPath = (fileType: string): string => {
  if (!fileType) {
    return "/assets/file-types/unknown-format.svg";
  }

  const fileTypeLower = fileType.toLowerCase();
  
  if (IMAGE_EXTENSION.includes(fileTypeLower)) {
    return "/assets/file-types/image.svg";
  } else if (PDF_EXTENSION.includes(fileTypeLower)) {
    return "/assets/file-types/pdf.svg";
  } else if (TXT_EXTENSION.includes(fileTypeLower)) {
    return "/assets/file-types/txt.svg";
  } else if (MS_WORD_EXTENSION.includes(fileTypeLower)) {
    return "/assets/file-types/docx.svg";
  } else if (EXCEL_EXTENSION.includes(fileTypeLower)) {
    return "/assets/file-types/excel.svg";
  } else if (PPT_EXTENSION.includes(fileTypeLower)) {
    return "/assets/file-types/ppt.svg";
  } else if (AUDIO_EXTENSION.includes(fileTypeLower)) {
    return "/assets/file-types/audio.svg";
  } else if (VIDEO_EXTENSION.includes(fileTypeLower)) {
    return "/assets/file-types/video.svg";
  }
  
  return "/assets/file-types/unknown-format.svg";
};

export const FileIcon = ({ fileType, width = 24, height = 24 }: { 
  fileType: string; 
  width?: number; 
  height?: number; 
}) => {
  const iconPath = getFileIconPath(fileType);
  
  return (
    <Image
      src={iconPath}
      alt={`${fileType} file icon`}
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      onError={(e) => {
        // Fallback to unknown format if icon fails to load
        (e.target as HTMLImageElement).src = "/assets/file-types/unknown-format.svg";
      }}
    />
  );
};

// File upload validation and error handling
export function validateFileType(file: File, allowedTypes: string[] = []): { isValid: boolean; error?: string } {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension) {
    return { isValid: false, error: "Invalid file format" };
  }

  // If no allowed types specified, use default allowed types (exclude images)
  const defaultAllowedTypes = [
    ...PDF_EXTENSION,
    ...TXT_EXTENSION,
    ...MS_WORD_EXTENSION,
    ...EXCEL_EXTENSION,
    ...PPT_EXTENSION,
    ...AUDIO_EXTENSION,
    ...VIDEO_EXTENSION,
  ];
  
  const typesToCheck = allowedTypes.length > 0 ? allowedTypes : defaultAllowedTypes;
  
  if (!typesToCheck.includes(fileExtension)) {
    const disallowedTypes = IMAGE_EXTENSION;
    if (disallowedTypes.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: "Image files are not supported for upload. Please upload documents, PDFs, or other supported file types." 
      };
    }
    return { 
      isValid: false, 
      error: `File type .${fileExtension} is not supported. Please upload a supported file type.` 
    };
  }
  
  return { isValid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
