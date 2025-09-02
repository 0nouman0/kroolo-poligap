"use client";
import React from "react";
import usePolicyStatisticsStore from "@/stores/policy-statistics-store";

export default function PolicyStatisticsPage() {
  const { stats } = usePolicyStatisticsStore();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Policy Analyzer Statistics</h1>
      <p className="text-muted-foreground mb-8">Usage, compliance, and AI analysis statistics.</p>
      <div className="bg-muted/50 rounded-lg p-6 border grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Total Analyses</div>
          <div className="text-2xl font-bold text-primary">{stats.totalAnalyses}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Successful Analyses</div>
          <div className="text-2xl font-bold text-green-600">{stats.successfulAnalyses}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Failed Analyses</div>
          <div className="text-2xl font-bold text-red-600">{stats.failedAnalyses}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Compliance Rate</div>
          <div className="text-2xl font-bold text-blue-600">{stats.complianceRate}%</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs text-muted-foreground mb-1">Last Updated</div>
          <div className="text-base font-mono">{new Date(stats.lastUpdated).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
