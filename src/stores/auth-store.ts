import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type UserDetails = {
  _id: string;
  name: string;
  email: string;
  companyId: string;
  defaultCompany: string;
  picture: string;
  banner: {
    image: string;
  };
};

type CompanyDetails = {
  _id: string;
  companyName: string;
};

type memberDetails = {
  role: "Admin" | "Owner" | "User";
};

type User = {
  userDetails: UserDetails;
  companyDetails: CompanyDetails;
  memberDetails: memberDetails[];
};

type AuthState = {
  token: string | null;
  userData: User | null;
  setToken: (token: string) => void;
  setUserData: (userData: unknown) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        userData: null,
        setToken: (token: string) => set({ token }, false, "setToken"),
        setUserData: (userData: unknown) =>
          set({ userData: userData as User }, false, "setUserData"),
        logout: () => set({ userData: null, token: null }, false, "logout"),
      }),
      { name: "auth-store" }
    ),
    { name: "AuthStore" }
  )
);
