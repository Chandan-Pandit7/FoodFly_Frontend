import React, { useEffect, useState } from "react";
import axios from "../utils/axios.js";
import { toast } from "react-hot-toast";
import Layout from "../components/Layout.jsx";
import { capitalizeEachWord } from "../utils/StringUtils.js";
import ProfileUpdateForm from "../components/ProfileUpdateForm.jsx";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/profile/get-profile");
      console.log("data from profilepage", data);
      if (data.success) setUser(data.user);
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600 dark:text-gray-300">
        Loading profile...
      </div>
    );

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-300 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
        <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md transform transition duration-500 hover:scale-[1.02] hover:shadow-3xl">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={
                  user.image ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="User Avatar"
                className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-green-500 shadow-lg"
              />
              <span className="absolute bottom-2 right-2 bg-green-500 border-2 border-white dark:border-gray-900 w-4 h-4 rounded-full"></span>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {user.name?capitalizeEachWord(user.name):"User"}
            </h2>
            <p className="text-green-600 dark:text-green-400 font-medium mt-1">
              @{user.username}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          {/* Details Section */}
          <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-semibold">Email:</span>
              <span className="text-gray-500 dark:text-gray-400">
                {user.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">User ID:</span>
              <span className="text-gray-500 dark:text-gray-400 break-all">
                {user._id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Joined On:</span>
              <span className="text-gray-500 dark:text-gray-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-8 flex justify-center">
  {!editMode ? (
    <button
      onClick={() => setEditMode(true)}
      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-full shadow-md transition duration-300"
    >
      Edit Profile
    </button>
  ) : (
    <ProfileUpdateForm
      user={user}
      onUpdate={(updatedUser) => {
        setUser(updatedUser);
        setEditMode(false);
      }}
    />
  )}
</div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
