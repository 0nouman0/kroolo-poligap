import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Company = {
  companyId: string;
  name: string;
  role: string;
};

interface ErrorResponse {
  error_code: string;
  user_facing_error: string;
}

interface LoginResponse {
  login_url: string;
}

type CompanyStore = {
  companies: Company[];
  selectedCompany: Company | null;
  setCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company) => void;
  SsoLoginApi: (email: string) => Promise<ErrorResponse | null>;
};

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      companies: [],
      selectedCompany: null,
      setCompanies: (companies: Company[]): void =>
        set({
          companies,
          selectedCompany: companies.length > 0 ? companies[0] : null,
        }),
      setSelectedCompany: (company: Company): void =>
        set({ selectedCompany: company }),

      SsoLoginApi: async (email: string): Promise<ErrorResponse | null> => {
        try {
          const urlObject = new URL(window.location.href);
          const url = urlObject.origin + "/login/sso/callback";
          const encodedUrl = btoa(url);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}/api/fe/v3/login/check?email=${email}`
          );

          // console.log("response>>>>>>>>>>>>.", response);

          if (response.status === 200) {
            const redirectUrl = `${process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}/api/fe/v3/login/saml?email=${email}&rt=${encodedUrl}`;
            window.location.href = redirectUrl;

            return null;
          } else {
            const error = (await response.json()) as { error_code: string };
            let customMessage = "Something went wrong. Please try again later.";

            if (error.error_code === "org_not_found") {
              customMessage =
                "This email is not linked with SSO, please login without SSO.";
            }

            return {
              error_code: error.error_code,
              user_facing_error: customMessage,
            };
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          return {
            error_code: "network_error",
            user_facing_error: "Something went wrong",
          };
        }
      },
    }),
    {
      name: "company-store", // unique name for localStorage
    }
  )
);
