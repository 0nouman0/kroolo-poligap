"use client";
import React from "react";
import usePolicyHistoryStore from "@/stores/policy-history-store";

export default function PolicyHistoryPage() {
  const { history } = usePolicyHistoryStore();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Policy Analyzer History</h1>
      <p className="text-muted-foreground mb-8">Review your analysis and policy generation history.</p>
      <div className="bg-muted/50 rounded-lg p-6 border flex flex-col gap-4">
        {history.length === 0 ? (
          <div className="text-muted-foreground text-center">No history yet.</div>
        ) : (
          history.map(item => (
            <div key={item.id} className="p-4 rounded border bg-white/80 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 shadow-sm">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-1">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
                <div className="font-semibold text-lg text-foreground">{item.summary}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(item.timestamp).toLocaleString()}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
