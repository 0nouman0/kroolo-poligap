import React from "react";
import { X } from "lucide-react";

import type { FileCardProps } from "./../../types/agent";
import Icon from "./../../ui/icon";
import { FileIcon } from "./../../utils/utils";

export const MediaCard: React.FC<FileCardProps> = ({
  file,
  onClose,
  onClick,
  className = "",
}) => {
  console.log("in MediaCard file ==>", file);
  const IconType = FileIcon({ fileType: file.fileType });

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.(file);
  };

  const handleClick = () => {
    onClick?.(file);
  };

  return (
    <div
      className={`relative max-w-56 cursor-pointer rounded-xl border border-[var(--card-border-color)] bg-transparent p-1.5 pr-1 ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg`}
        >
          <Icon type={IconType} size="lg" />
        </div>

        <div className="min-w-0 flex-1 truncate px-1">
          <h3
            className="truncate text-[11px] font-medium text-[var(--text-color)]"
            title={file.fileName}
          >
            {file.fileName}
          </h3>
          <p className="text-[11px] text-[var(--secondary-text-color)]">
            {file.fileType}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="bg-black dark:bg-white rounded-full p-1 transition-colors"
          aria-label="Close"
        >
          <X className="h-2 w-2 text-white dark:text-black" />
        </button>
      </div>
    </div>
  );
};

export const MediaCardSkeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`relative w-56 mr-2 mb-2 h-[46.5px] cursor-pointer rounded-xl border border-[var(--card-border-color)] bg-transparent p-1.5 pr-1 ${className}`}
    >
      <div className="flex items-start">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--skeleton-background)] animate-pulse" />
        <div className="min-w-0 flex-1 truncate px-1">
          <div className="h-3.5 bg-[var(--skeleton-background)] rounded mb-0.5 w-4/5 animate-pulse" />
          <div className="h-3.5 bg-[var(--skeleton-background)] rounded w-2/5 animate-pulse" />
        </div>
        <div className="bg-[var(--skeleton-background)] rounded-full p-0.5 h-5 w-5 animate-pulse" />
      </div>
    </div>
  );
};
