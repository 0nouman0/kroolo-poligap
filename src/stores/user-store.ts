import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserData = {
  _id: string;
  userId: string;
  name: string;
  email: string;
  profileImage: string;
  banner?: {
    image: string;
  } | null;
  dob: string;
  mobile: string;
  status: string;
  memberStatus: string;
  role: string;
  designation: string;
  country: string;
  reportingManager: {
    name: string;
    email: string;
  } | null;
  createdBy: {
    name: string;
    email: string;
  } | null;
  companyName: string;
  profileCreatedOn: string;
  createdAt: string;
  updatedAt: string;
  about?: string;
};

type UserStore = {
  userData: UserData | null;
  setUserData: (userData: UserData) => void;
  clearUserData: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userData: null,
      setUserData: (userData) => set({ userData }),
      clearUserData: () => set({ userData: null }),
    }),
    {
      name: "user-store",
    }
  )
);
