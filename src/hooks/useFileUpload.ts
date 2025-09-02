import { useState } from 'react';
import { toast } from 'sonner';
import { validateFileType, formatFileSize } from '@/utils/attachments.util';

interface UseFileUploadOptions {
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  onSuccess?: (file: File) => void;
  onError?: (error: string) => void;
}

export const useFileUpload = ({
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = [],
  onSuccess,
  onError,
}: UseFileUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);

    try {
      // Validate file type
      const typeValidation = validateFileType(file, allowedTypes);
      if (!typeValidation.isValid) {
        toast.error(typeValidation.error || 'Invalid file type');
        onError?.(typeValidation.error || 'Invalid file type');
        return false;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        const error = `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxFileSize)}`;
        toast.error(error);
        onError?.(error);
        return false;
      }

      // Success case
      toast.success(`File "${file.name}" is ready for upload`);
      onSuccess?.(file);
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const results = await Promise.all(fileArray.map(handleFileUpload));
    return results.every(Boolean);
  };

  return {
    handleFileUpload,
    handleFiles,
    isUploading,
  };
};
