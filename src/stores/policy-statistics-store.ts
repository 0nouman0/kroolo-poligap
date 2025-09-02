import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PolicyStatisticsState {
  stats: {
    totalAnalyses: number;
    successfulAnalyses: number;
    failedAnalyses: number;
    complianceRate: number;
    lastUpdated: string;
  };
  setStats: (newStats: Partial<PolicyStatisticsState["stats"]>) => void;
}

const usePolicyStatisticsStore = create<PolicyStatisticsState>()(
  persist(
    (set) => ({
      stats: {
        totalAnalyses: 0,
        successfulAnalyses: 0,
        failedAnalyses: 0,
        complianceRate: 0,
        lastUpdated: '',
      },
      setStats: (newStats) => set((state) => ({
        stats: { ...state.stats, ...newStats },
      })),
    }),
    {
      name: 'policy-statistics-storage',
    }
  )
);

export default usePolicyStatisticsStore;
