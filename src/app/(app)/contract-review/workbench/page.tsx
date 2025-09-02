"use client";

import React from "react";
import Link from "next/link";
import { PdfUpload } from "@/components/contract-review/PdfUpload";
import { IssuesList } from "@/components/contract-review/IssuesList";
import { ReviewCanvas } from "@/components/contract-review/ReviewCanvas";
import { useContractReviewStore } from "@/store/contractReview";

export default function ContractReviewWorkbenchPage() {
  const { isLoading, error } = useContractReviewStore();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="w-full border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/contract-review" className="text-sm text-blue-600 hover:underline">← Back</Link>
          <h1 className="text-lg font-semibold">Contract Review Workbench</h1>
        </div>
        <PdfUpload />
      </header>

      {error ? (
        <div className="mx-4 mt-4 mb-0 p-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
          PDF parsing failed: {error}
        </div>
      ) : null}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0">
        <section className="border-r h-[calc(100vh-56px)] overflow-auto">
          <IssuesList />
        </section>
        <section className="h-[calc(100vh-56px)] overflow-auto">
          <ReviewCanvas />
        </section>
      </main>

      {isLoading ? (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
          <div className="animate-spin inline-block w-10 h-10 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" />
        </div>
      ) : null}
    </div>
  );
}
