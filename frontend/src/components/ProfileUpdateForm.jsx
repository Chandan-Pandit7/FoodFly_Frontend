import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "../utils/axios.js";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice.js";

const ProfileUpdateForm = ({ user, onUpdate }) => {
  const [form, setForm] = useState({
    name: user.name || "",
    username: user.username || "",
    email: user.email || "",
    password: "", // optional
    image: null,
  });
  const [preview, setPreview] = useState(user.image || null);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("email", form.email);
      if (form.password) formData.append("password", form.password);
      if (form.image) formData.append("image", form.image);

      const { data } = await axios.post("/profile/update-details",formData);

      if (data.success) {
        // toast.success("Profile updated successfully!");
        dispatch(setUser(data.user));
        localStorage.setItem("user", JSON.stringify(data.user));
        onUpdate(data.user); // update parent state
      } else {
        // toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Avatar Upload */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <img
            src={preview || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full mb-2 object-cover border-2 border-green-500"
          />
          <label
            htmlFor="image"
            className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1 cursor-pointer hover:bg-green-600 transition"
          >
            Upload
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* Form Fields */}
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <input
        type="password"
        name="password"
        placeholder="New Password (leave blank if unchanged)"
        value={form.password}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <button
        type="submit"
        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
      >
        Save Changes
      </button>
    </form>
  );
};

export default ProfileUpdateForm;
