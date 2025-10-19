import { useState } from "react";
import axios from "../utils/axios.js";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaUtensils, FaCamera } from "react-icons/fa";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  // handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      if (form.image) formData.append("image", form.image);

      const { data } = await axios.post("/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        toast.success("Signup successful! Please log in.");
        navigate("/login");
      } else {
        toast.error(data.message || "Signup failed!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Signup failed! Check console for details.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-orange-100 via-pink-50 to-yellow-100 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-orange-200">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <FaUtensils className="text-3xl text-orange-500" />
          <h1 className="text-3xl font-extrabold text-gray-800">FoodFly</h1>
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Create Your Account ✨
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-24 h-24">
              <img
                src={preview || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-orange-300 shadow-md"
              />
              <label
                htmlFor="image"
                className="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-2 cursor-pointer hover:bg-orange-600 transition"
              >
                <FaCamera className="h-4 w-4" />
              </label>
              <input
                id="image"
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            <p className="text-xs text-gray-500">Upload a profile picture</p>
          </div>

          {/* Full Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          {/* Passwords */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow-md"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
