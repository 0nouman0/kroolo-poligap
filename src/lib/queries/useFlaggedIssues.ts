import { useCompanyStore } from "@/stores/company-store";
import { useQuery } from "@tanstack/react-query";

export const fetchFlaggedIssues = async (companyId: string) => {
  const params = new URLSearchParams({ companyId });
  const res = await fetch(`/api/flagged-issues?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch flagged issues");
  return res.json();
};

export function useFlaggedIssues() {
  const selectedCompany = useCompanyStore((s) => s.selectedCompany);
  const companyId = selectedCompany?.companyId;
  return useQuery({
    queryKey: ["flagged-issues", companyId],
    queryFn: () => fetchFlaggedIssues(companyId!),
    enabled: !!companyId,
  });
}
