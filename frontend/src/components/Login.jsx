import { useState } from "react";
import axios from "../utils/axios.js";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice.js";
import { FaUtensils } from "react-icons/fa";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/login", form);

      if (data.success) {
        const userData = { ...data.user, isLoggedIn: true };
        dispatch(setUser(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Welcome back to FoodFly!");
        navigate("/home");
      } else {
        toast.error(data.message || "Incorrect username or Password ");
      }
    } catch (err) {
      toast.error("Incorrect username or password");
      // console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-orange-100 via-pink-50 to-yellow-100 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-orange-200">
        <div className="flex items-center justify-center gap-2 mb-6">
          <FaUtensils className="text-3xl text-orange-500" />
          <h1 className="text-3xl font-extrabold text-gray-800">FoodFly</h1>
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Welcome Back 🍽️
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow-md"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-5 text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-orange-500 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
