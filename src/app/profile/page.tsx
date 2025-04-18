"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type ProfileData = {
  displayName: string;
  phoneNumber: string;
  website: string;
  instagramUsername: string;
};

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "",
    phoneNumber: "",
    website: "",
    instagramUsername: "",
  });

  useEffect(() => {
    if (userData) {
      setProfileData({
        displayName: userData.displayName || "",
        phoneNumber: userData.phoneNumber || "",
        website: userData.website || "",
        instagramUsername: userData.instagramUsername || "",
      });
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
        website: profileData.website,
        instagramUsername: profileData.instagramUsername,
        updatedAt: new Date(),
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Profile
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  isLoading={isLoading}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-md rounded-lg overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                <FaUser className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {profileData.displayName || "Your Profile"}
                </h3>
                <p className="text-sm text-gray-500">{userData?.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Input
                  label="Display Name"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  leftIcon={<FaUser />}
                  placeholder="Your display name"
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  leftIcon={<FaPhone />}
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <Input
                  label="Website"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  leftIcon={<FaGlobe />}
                  placeholder="Your website"
                />
              </div>

              <div>
                <Input
                  label="Instagram Username"
                  name="instagramUsername"
                  value={profileData.instagramUsername}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  leftIcon={<FaInstagram />}
                  placeholder="Your Instagram username"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-2">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium">{userData?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="text-sm font-medium">{userData?.isAdmin ? "Admin" : "Standard User"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Coins</p>
                    <p className="text-sm font-medium">{userData?.coins || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="text-sm font-medium">
                      {userData?.createdAt ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
} 