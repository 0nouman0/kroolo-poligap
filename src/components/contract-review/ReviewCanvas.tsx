"use client";

import React from "react";
import { useContractReviewStore } from "@/store/contractReview";

export const ReviewCanvas: React.FC = () => {
  const { structuredDoc } = useContractReviewStore();

  if (!structuredDoc) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground p-6">
        Upload a PDF to see the restructured contract here.
      </div>
    );
  }

  return (
    <div className="p-6">
      <article className="prose max-w-none">
        <header className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold">{structuredDoc.title || "Contract"}</h1>
          {structuredDoc.meta?.counterparties ? (
            <p className="text-sm text-gray-600">Parties: {structuredDoc.meta.counterparties.join(", ")}</p>
          ) : null}
          {structuredDoc.meta?.effectiveDate ? (
            <p className="text-sm text-gray-600">Effective Date: {structuredDoc.meta.effectiveDate}</p>
          ) : null}
        </header>

        {structuredDoc.sections.map((sec) => (
          <section key={sec.key} className="mb-6">
            <h2 className="text-lg font-semibold">{sec.title}</h2>
            {sec.paragraphs.map((p, idx) => (
              <p key={idx} className="mt-2 whitespace-pre-wrap">{p}</p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
};
