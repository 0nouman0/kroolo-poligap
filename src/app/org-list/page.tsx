"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  isCompanyExist,
  importCompanies,
  validateUser,
  addUser,
} from "@/app/api/enterpriseSearch/enterpriseSearch";
import { toastInfo } from "@/components/toast-varients";
import { Button } from "@/components/ui/button";
import LoginSidePanel from "@/components/common/sso-login-side-panel";
import { useCompanyStore } from "@/stores/company-store";

type Company = {
  color: string | undefined;
  companyId: string;
  companyName: string;
  role: string;
};

const COLORS = [
  "#7164FF", // purple
  "#FFD600", // yellow
  "#FF4A4A", // red
  "#34A853", // green
];

export default function OrgListPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setSelectedCompany = useCompanyStore(
    (state) => state.setSelectedCompany
  );
  // const [selected, setSelected] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Access localStorage only on client side
        const accessToken =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        const userId =
          typeof window !== "undefined"
            ? localStorage.getItem("user_id")
            : null;

        if (accessToken) {
          const res = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL +
              "/api/v1/enterprise-search/get-user-company-list",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const data = await res.json();
          if (Array.isArray(data.data)) {
            setCompanies(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data.data.map((company: any) => ({
                ...company,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
              }))
            );
            if (data.data.length > 0) {
              setSelectedCompanyId(data.data[0].companyId); // default select first
            }
          }
        }

        // Optionally, fetch user email
        if (userId && accessToken) {
          const userDetailsRes = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL +
              "/api/v1/enterprise-search/user-details",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const userDetails = await userDetailsRes.json();
          if (userDetails?.data?.userDetails?.email) {
            setUserEmail(userDetails.data.userDetails.email);
          }
        }
      } catch (error) {
        console.error("Error fetching companies or email:", error);
      }
    };
    fetchData();
  }, []);

  const handleContinueWithCompany = async () => {
    const selectedCompany = companies.find(
      (c) => c.companyId === selectedCompanyId
    );
    if (!selectedCompany) return;

    // Access localStorage only on client side
    const userId =
      typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
    if (!userId) return;

    setIsLoading(true);
    try {
      const existsResp = await isCompanyExist(selectedCompany.companyId);

      if (existsResp.code !== 200) {
        // company doesn't exist: owner can import
        if (
          selectedCompany.role === "Owner" ||
          selectedCompany.role === "Admin"
        ) {
          const accessToken =
            typeof window !== "undefined"
              ? localStorage.getItem("accessToken")
              : null;
          const userDetailsRes = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL +
              "/api/v1/enterprise-search/user-details",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const userDetailsData = await userDetailsRes.json();
          console.log("userDetailsData ==> 🔥", userDetailsData);
          await importCompanies(
            userDetailsData.data.companies,
            accessToken || ""
          );
          // Set the selected company in the store before redirecting
          setSelectedCompany({
            companyId: selectedCompany.companyId,
            name: selectedCompany.companyName,
            role: selectedCompany.role,
          });

          // // --- New: Send payload to FastAPI ---
          // try {
          //   // Fetch member info
          //   const memberRes = await fetch("/api/users/get-member", {
          //     method: "POST",
          //     headers: { "Content-Type": "application/json" },
          //     body: JSON.stringify({ userId, companyId: selectedCompany.companyId }),
          //   });
          //   if (!memberRes.ok) throw new Error("Failed to fetch member");
          //   const { member } = await memberRes.json();

          //   // Fetch user info
          //   const userRes = await fetch("/api/users/get-user", {
          //     method: "POST",
          //     headers: { "Content-Type": "application/json" },
          //     body: JSON.stringify({ userId }),
          //   });
          //   if (!userRes.ok) throw new Error("Failed to fetch user");
          //   const { user } = await userRes.json();

          //   const fastApiPayload = {
          //     user_id: userId,
          //     company_id: selectedCompany.companyId,
          //     email: user?.email,
          //     mobile: user?.mobile || "0000000000",
          //     name: user?.name,
          //     designation: user?.designation,
          //     role: member?.role,
          //     status: member?.status,
          //   };

          //   console.log("Sending payload to FastAPI:", fastApiPayload);

          //   const response = await fetch(
          //     `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/v1/users/register`,
          //     {
          //       method: "POST",
          //       headers: {
          //         "Content-Type": "application/json",
          //       },
          //       body: JSON.stringify(fastApiPayload),
          //     }
          //   );

          //   if (!response.ok) throw new Error("Failed to send payload");
          //   const data = await response.json();
          //   console.log("FastAPI Response:", data);
          // } catch (error) {
          //   console.error("Error sending payload to FastAPI:", error);
          // }

          router.push("/");
        } else {
          toastInfo(
            "You're not authorized to access from this organisation.",
            "Please contact your admin."
          );
        }
      } else {
        // company exists: validate user
        const validateUserResp = await validateUser(userId);
        if (validateUserResp.code === 200) {
          // Set the selected company in the store before redirecting
          setSelectedCompany({
            companyId: selectedCompany.companyId,
            name: selectedCompany.companyName,
            role: selectedCompany.role,
          });

          // // --- New: Send payload to FastAPI ---
          // try {
          //   // Fetch member info
          //   const memberRes = await fetch("/api/users/get-member", {
          //     method: "POST",
          //     headers: { "Content-Type": "application/json" },
          //     body: JSON.stringify({ userId, companyId: selectedCompany.companyId }),
          //   });
          //   if (!memberRes.ok) throw new Error("Failed to fetch member");
          //   const { member } = await memberRes.json();

          //   // Fetch user info
          //   const userRes = await fetch("/api/users/get-user", {
          //     method: "POST",
          //     headers: { "Content-Type": "application/json" },
          //     body: JSON.stringify({ userId }),
          //   });
          //   if (!userRes.ok) throw new Error("Failed to fetch user");
          //   const { user } = await userRes.json();

          //   const fastApiPayload = {
          //     user_id: userId,
          //     company_id: selectedCompany.companyId,
          //     email: user?.email,
          //     mobile: user?.mobile || "0000000000",
          //     name: user?.name,
          //     designation: user?.designation,
          //     role: member?.role,
          //     status: member?.status,
          //   };

          //   console.log("Sending payload to FastAPI:", fastApiPayload);

          //   const response = await fetch(
          //     `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/v1/users/register`,
          //     {
          //       method: "POST",
          //       headers: {
          //         "Content-Type": "application/json",
          //       },
          //       body: JSON.stringify(fastApiPayload),
          //     }
          //   );

          //   if (!response.ok) throw new Error("Failed to send payload");
          //   const data = await response.json();
          //   console.log("FastAPI Response:", data);
          // } catch (error) {
          //   console.error("Error sending payload to FastAPI:", error);
          // }

          router.push("/");
        } else {
          const userDetailsResp = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enterprise-search/get-company-user-details/${selectedCompany.companyId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          const userDetailsJson = await userDetailsResp.json();
          await addUser(
            userId,
            userDetailsJson.data,
            selectedCompany.companyId
          );
          // Set the selected company in the store before redirecting
          setSelectedCompany({
            companyId: selectedCompany.companyId,
            name: selectedCompany.companyName,
            role: selectedCompany.role,
          });
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Error during company continue flow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen">
      {/* Left side */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-semibold text-center">Choose Account</h2>
          <p className="text-center text-gray-500 text-sm">
            {`Looks like there ${companies.length === 1 ? "is" : "are"} ${
              companies.length === 1 ? "an" : "a few"
            } account${companies.length === 1 ? "" : "s"} tied to `}
            <br />
            <span className="font-medium">
              {userEmail ? userEmail : "Loading email..."}
            </span>
          </p>

          <div className="space-y-3">
            {companies.map((company) => (
              <div
                // key={company.name}
                key={company.companyId}
                onClick={() => setSelectedCompanyId(company.companyId)}
                className={`flex items-center justify-between border rounded-lg px-4 py-2 cursor-pointer transition ${
                  selectedCompanyId === company.companyId
                    ? "border-[#7164FF]"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm`}
                    style={{ backgroundColor: company.color }}
                  >
                    {company.companyName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{company.companyName}</p>
                    <p className="text-xs text-gray-500">{company.role}</p>
                  </div>
                </div>
                {selectedCompanyId === company.companyId && (
                  <svg
                    className="w-4 h-4 text-[#7164FF]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleContinueWithCompany}
            disabled={!selectedCompanyId || isLoading}
            className="w-full h-10 bg-[#7164FF] text-white font-medium rounded-md hover:bg-[#5b4fe0] transition cursor-pointer"
          >
            {isLoading ? "Preparing..." : "Continue"}
          </Button>
        </div>
      </div>
      <LoginSidePanel />
    </div>
  );
}
