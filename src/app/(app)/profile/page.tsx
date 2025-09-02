"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pencil, X, Save } from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { Input } from "@/components/ui/input";
import { updateAbout } from "@/app/api/enterpriseSearch/enterpriseSearch";
import { useEffect, useState, useRef } from "react";
import { toastSuccess, toastError } from "@/components/toast-varients";
import { uploadToS3 } from "@/app/api/s3/upload/uploadtos3";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/utils/user.util";

export default function UserProfilePage() {
  const { userData, setUserData } = useUserStore();
  const [about, setAbout] = useState(userData?.about);

  let bannerImage =
    "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  if (userData?.banner?.image) {
    bannerImage = userData.banner.image;
  }

  useEffect(() => {
    if (!userData) return;
    setAbout(userData.about);
  }, [userData]);

  // Banner and profile pic edit states
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null
  );
  const profilePicInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setBannerPreview(null);
    setProfilePicPreview(null);
  }, [bannerImage, userData?.profileImage]);

  const handleBannerEdit = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const handleBannerFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        setBannerPreview(ev.target?.result as string);
        // Immediately upload and update
        try {
          const updateBanner = await uploadToS3(
            file,
            "banner",
            userData?.userId!
          );
          if (updateBanner.success) {
            toastSuccess("Banner updated successfully");
            if (userData) {
              setUserData({
                ...userData,
                banner: {
                  image: updateBanner.data?.fileUrl || bannerImage,
                },
              });
            }
          } else {
            toastError("Failed to update banner");
          }
        } catch {
          toastError("An error occurred while updating the banner");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove handleBannerCancel and handleBannerSave

  const handleProfilePicEdit = () => {
    if (profilePicInputRef.current) profilePicInputRef.current.value = "";
    profilePicInputRef.current?.click();
  };

  const handleProfilePicFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        setProfilePicPreview(ev.target?.result as string);
        // Immediately upload and update
        try {
          const updateProfilePic = await uploadToS3(
            file,
            "profileImage",
            userData?.userId!
          );
          if (updateProfilePic.success) {
            toastSuccess("Profile picture updated successfully");
            if (userData) {
              setUserData({
                ...userData,
                profileImage:
                  updateProfilePic.data?.fileUrl || userData.profileImage,
              });
            }
          } else {
            toastError("Failed to update profile picture");
          }
        } catch {
          toastError("An error occurred while updating the profile picture");
        }
      };
      reader.readAsDataURL(file);
    }
    if (profilePicInputRef.current) profilePicInputRef.current.value = "";
  };

  // Remove handleProfilePicCancel and handleProfilePicSave

  if (!userData) {
    return <></>;
  }

  function getBgColor(name: string): string {
    // Example: pick a color based on the first letter
    const colors = [
      "bg-green-400",
      "bg-blue-400",
      "bg-yellow-400",
      "bg-purple-400",
      "bg-pink-400",
      "bg-orange-400",
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="relative group">
          <img
            src={bannerPreview || bannerImage}
            alt="BI"
            className="w-full h-48 md:h-64 object-cover"
          />
          {/* Banner edit pencil icon (centered, only on hover) */}
          <button
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 hover:bg-black/20"
            style={{ pointerEvents: "auto" }}
            onClick={handleBannerEdit}
            title="Edit banner"
            type="button"
          >
            <Pencil className="h-6 w-6 text-white drop-shadow" />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleBannerFileChange}
          />
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
            <div className="z-10 -mt-16 sm:-mt-24 relative group">
              {profilePicPreview || userData.profileImage ? (
                <img
                  src={profilePicPreview || userData.profileImage}
                  alt={`${userData.name || "User"}`}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-background object-cover"
                />
              ) : (
                <div
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-background flex items-center justify-center text-white text-4xl font-bold ${getBgColor(
                    userData.name
                  )}`}
                >
                  {getInitials(userData.name)}
                </div>
              )}
              {/* Profile picture edit pencil icon (centered, only on hover) */}
              <button
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ pointerEvents: "auto" }}
                onClick={handleProfilePicEdit}
                title="Edit profile picture"
                type="button"
              >
                <div className="w-full h-full flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20">
                  <Pencil className="h-4 w-4 text-white drop-shadow" />
                </div>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={profilePicInputRef}
                className="hidden"
                onChange={handleProfilePicFileChange}
              />
            </div>
            <div className="mt-4 sm:mb-4 flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-grow">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {userData.name || "User"}
                </h1>
                <p className="text-muted-foreground text-13">
                  Email: {userData.email || "N/A"}
                </p>
                <p className="text-muted-foreground text-13">
                  Designation: {userData.designation || "N/A"}
                </p>
                <p className="text-muted-foreground text-13">
                  Country: {userData.country || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <div className="flex justify-between items-end">
                <Textarea
                  className="text-muted-foreground text-13 focus-visible:ring-1 focus-visible:border-none"
                  placeholder="Add a bio..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
                <Button
                  variant="outline"
                  className="text-11 ml-2 cursor-pointer"
                  size={"sm"}
                  disabled={about === userData?.about}
                  onClick={async () => {
                    const data = await updateAbout(userData?.userId, about!);
                    if (data?.code === 200) {
                      toastSuccess("Bio updated successfully!");
                      if (userData) {
                        setUserData({
                          ...userData,
                          about: about,
                        });
                      }
                    } else {
                      toastError("Failed to update bio!");
                    }
                  }}
                >
                  Update Bio
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Reports to</h2>
                <p className="text-muted-foreground text-13">
                  Manager Email: {userData.reportingManager?.email || "N/A"}
                </p>
                <p className="text-muted-foreground text-13">
                  Manager Name: {userData.reportingManager?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
