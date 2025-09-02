import { create } from "zustand";
import { produce } from "immer";
import { toastSuccess } from "@/components/toast-varients";
import { krooloHttpClient } from "@/app/(app)/chat/utils/https";

interface SsoLoginData {
  email: string;
}

interface SsoLoginError {
  email: string;
  disabled: boolean;
  loader: boolean;
}

interface LocationData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AuthState {
  ssoLoginData: SsoLoginData;
  ssoLoginError: SsoLoginError;
  persistData: number;
  userLocationData: LocationData | null;
  fetchGeoLocationData: () => Promise<LocationData>;
  fetchSsoLoginData: (bodyData: { email?: string }) => Promise<void>;
}

const useAuthenticationStore = create<AuthState>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (set, get) => ({
    ssoLoginData: {
      email: "",
    },
    ssoLoginError: { email: "", disabled: false, loader: false },
    persistData: 0,
    userLocationData: null,

    async fetchGeoLocationData() {
      const { data } = await krooloHttpClient.get<LocationData>(
        "https://ipinfo.io/json?token=0c67937d551400"
      );

      set(
        produce((state) => {
          state.userLocationData = data;
        })
      );

      return data;
    },

    fetchSsoLoginData: async (bodyData: { email?: string }) => {
      try {
        set({ ssoLoginError: { disabled: true, loader: true, email: "" } });
        const { data } = await krooloHttpClient.post<{
          status: string;
          message: string;
        }>(`/company/sso-login`, bodyData);

        if (data.status === "SUCCESS") {
          set({ ssoLoginError: { disabled: false, loader: false, email: "" } });
          toastSuccess("SSO Login", data.message);
        } else {
          set({
            ssoLoginError: {
              disabled: false,
              loader: false,
              email: data.message,
            },
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return set({
          ssoLoginError: {
            disabled: false,
            loader: false,
            email: error.response.data.message,
          },
        });
      }
    },
  })
  //   "home-storage"
);

export default useAuthenticationStore;
