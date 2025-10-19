import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios.js";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/userSlice.js";
import { capitalizeEachWord } from "../utils/StringUtils.js"; // ensure this util exists

const Navbar = () => {
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user); // ⚡ Fix: access user slice, not whole state

  // Fetch cart items whenever user changes
  const fetchCartItems = async () => {
    if (!user?.isLoggedIn) return;
    try {
      const response = await axios.get("/cart/view-cart-items");
      const cartItems = response.data.cart || [];
      const totalItems = cartItems.reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );
      setCartCount(totalItems);
    } catch (err) {
      console.error(err);
      toast.error("Unable to fetch cart items");
    }
  };

  useEffect(() => {
    fetchCartItems();

    // Listen to localStorage changes if cart updated elsewhere
    const handleStorage = () => fetchCartItems();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user?.isLoggedIn]); // ⚡ Fix: only run effect if login status changes

  const handleLogout = async () => {
    try {
      await axios.get("/profile/logout");
      dispatch(logoutUser());
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed");
    }
  };

  return (
    <header className="bg-gradient-to-r from-pink-400 to-pink-600 dark:from-pink-900 dark:to-pink-700 shadow-md py-4 px-6 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300">
      <h1
        onClick={() => navigate("/")}
        className="text-4xl font-bold text-white cursor-pointer select-none"
      >
        🍴 FoodFly
      </h1>

      <div className="flex items-center gap-4 relative">
        {/* Greeting */}
        {user?.isLoggedIn && (
          <h2 className="text-lg sm:text-xl font-serif font-semibold  text-blue-400 underline decoration-dotted">
            Hello, {user.name ? capitalizeEachWord(user.name.split(" ")[0]) : "Foodie"}!
          </h2>
        )}

        {/* Avatar & Dropdown */}
        {user?.isLoggedIn && (
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white cursor-pointer">
              <img
                src={user.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="User Avatar"
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></span>
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-fadeIn">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition"
                >
                  Profile
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 flex justify-between items-center transition"
                >
                  View Cart
                  {cartCount > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition"
                >
                  Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login/Signup */}
        {!user?.isLoggedIn && (
          <>
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-pink-600 px-4 py-1 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-white text-pink-600 px-4 py-1 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Signup
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
