"use client";

import React, { useRef } from "react";
import { useContractReviewStore } from "@/store/contractReview";

export const PdfUpload: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { ingestPdf } = useContractReviewStore();

  const onSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await ingestPdf(file);
    // reset input to allow re-uploading same file
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={onSelect}
        className="hidden"
        id="pdf-input"
      />
      <label
        htmlFor="pdf-input"
        className="cursor-pointer px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
      >
        Upload PDF
      </label>
    </div>
  );
};
