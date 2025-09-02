"use client";

import React from "react";
import { useContractReviewStore } from "@/store/contractReview";

export const IssuesList: React.FC = () => {
  const { issues, applyFix } = useContractReviewStore();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-base font-semibold">Issues</h2>
      {issues.length === 0 ? (
        <p className="text-sm text-muted-foreground">Upload a contract to begin analysis.</p>
      ) : null}
      <ul className="space-y-3">
        {issues.map((issue) => (
          <li key={issue.id} className="border rounded-md p-3">
            <div className="flex items-start justify-between gap-3">
              <div className={`text-sm ${issue.resolved ? "line-through text-gray-400" : ""}`}>
                <p className="font-medium">{issue.title}</p>
                <p className="opacity-80 mt-1">{issue.description}</p>
                {issue.location ? (
                  <p className="opacity-60 mt-1 text-xs">Section: {issue.location}</p>
                ) : null}
              </div>
              <button
                disabled={issue.resolved}
                onClick={() => applyFix(issue.id)}
                className={`px-2.5 py-1.5 text-xs rounded-md border ${
                  issue.resolved
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                }`}
                aria-label={`Quick fix for ${issue.title}`}
              >
                Quick Fix
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
