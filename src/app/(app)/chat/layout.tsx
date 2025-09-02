"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/stores/company-store";
import KrooloMainLoader from "@/components/common/kroolo-main-loader";

export default function KnowledgeBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!selectedCompany) return setChecked(true);
    const userRole = selectedCompany.role;
    // if (userRole === "User") {
    //   router.replace("/search");
    // }
    setChecked(true);
  }, [selectedCompany, router]);

  // Show a loader while checking
  if (!checked) {
    return <KrooloMainLoader />;
  }

  return <>{children}</>;
}
