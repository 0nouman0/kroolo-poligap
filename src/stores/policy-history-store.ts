import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PolicyHistoryItem {
  id: string;
  type: "analysis" | "generation";
  status: "success" | "failure";
  timestamp: string;
  summary: string;
}

interface PolicyHistoryState {
  history: PolicyHistoryItem[];
  addHistory: (item: PolicyHistoryItem) => void;
}

const usePolicyHistoryStore = create<PolicyHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (item) => set((state) => ({ history: [item, ...state.history] })),
    }),
    {
      name: 'policy-history-storage',
    }
  )
);

export default usePolicyHistoryStore;
