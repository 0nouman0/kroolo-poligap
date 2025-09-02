import { useQuery } from "@tanstack/react-query";
import { fetchUserProfileDetails } from "@/app/api/enterpriseSearch/enterpriseSearch";

export function useUserProfileDetails(userId: string, companyId: string) {
  return useQuery({
    queryKey: ["userProfileDetails", userId],
    queryFn: () => fetchUserProfileDetails(userId, companyId),
    enabled: !!userId,
  });
}
