import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import ShimmerCard from "../components/ShimmerCard.jsx";
import axios from "../utils/axios.js";
import { capitalizeEachWord } from "../utils/StringUtils.js";
import Layout from "../components/Layout.jsx";
import { useSelector } from "react-redux";

const LandingPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        // ✅ 1. Show cached data immediately (if available)
        const storedRestaurants = localStorage.getItem("restaurants");
        if (storedRestaurants) {
          setRestaurants(JSON.parse(storedRestaurants));
          setLoading(false);
        }

        // ✅ 2. Fetch fresh data in background
        const { data } = await axios.get("/restaurant/all-restaurants");
        const fetchedRestaurants = data.restaurants || [];

        // ✅ 3. Update only if new restaurants are added or changed
        const oldData = storedRestaurants ? JSON.parse(storedRestaurants) : [];
        const isDifferent =
          JSON.stringify(oldData) !== JSON.stringify(fetchedRestaurants);
        if (isDifferent) {
          setRestaurants(fetchedRestaurants);
          localStorage.setItem("restaurants", JSON.stringify(fetchedRestaurants));
          if (!storedRestaurants)
            toast.success("Restaurants fetched successfully 🍽️");
        }

        if (user.isLoggedIn && user.name) {
          const firstName = user.name.split(" ")[0];
          // toast.success(`Welcome back, ${firstName}! 👋`);
        }
      } catch (err) {
        setError("Failed to fetch restaurants. Please try again later.");
        console.error(err);
        toast.error("Error fetching restaurants");
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, [user.isLoggedIn]);

  return (
    <Layout>
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-tr from-orange-400 via-red-400 to-yellow-300 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-white py-16 rounded-2xl mb-10 shadow-lg">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
            Discover & Order Your Favorite Meals 🍕
          </h1>
          <p className="text-lg md:text-xl font-light mb-8 text-white/90">
            Explore top-rated restaurants near you and satisfy your cravings with FoodFly.
          </p>
          <button
            onClick={() => navigate("/restaurants")}
            className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold text-lg hover:bg-orange-50 transition transform hover:scale-105 shadow-md"
          >
            Explore Restaurants
          </button>
        </div>
      </section>

      {/* ===== RESTAURANT LIST ===== */}
      <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-10">
        🍽️ Available Restaurants
      </h2>

      {loading && (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
          {Array(6)
            .fill("")
            .map((_, i) => (
              <ShimmerCard key={i} />
            ))}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-center text-lg font-semibold">{error}</p>
      )}

      {!loading && !error && (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
          {restaurants.map((res) => {
            const cover = res.coverImage;
            const name = capitalizeEachWord(res.name);
            const address = capitalizeEachWord(res.address);
            const contact = res.contact;

            return (
              <div
                key={res._id || res.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={cover}
                    alt={name}
                    className="w-full h-52 object-cover group-hover:opacity-90 transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-all rounded-t-2xl"></div>
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    {name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    📍 <span className="font-medium">{address}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    ☎️ <span className="font-medium">{contact}</span>
                  </p>
                  <button
                    onClick={() =>
                      navigate(`/restaurant/${encodeURIComponent(res.name)}`)
                    }
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold transition shadow-md"
                  >
                    Visit Restaurant
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== CTA SECTION ===== */}
      <div className="mt-20 text-center mb-32">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Hungry Already? 🚀
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Explore amazing dishes and order from your favorite restaurant now!
        </p>
        <button
          onClick={() => navigate("/restaurants")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition shadow-md hover:shadow-lg"
        >
          Browse Menu
        </button>
      </div>

      {/* ===== CHATBOT (COMING SOON) ===== */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Popup */}
        {isChatOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-orange-500 text-white p-3 font-semibold text-center">
              🤖 FoodFly Assistant
            </div>
            <div className="p-4 text-gray-700 dark:text-gray-300 text-sm">
              Hi there! 👋  
              I’m your virtual assistant. Soon, I’ll help you find restaurants, track orders, and answer your questions in real time.  
              <br />
              <br />
              <span className="font-semibold">Feature coming soon 🚧</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs text-center py-2">
              🚀 Launching Soon...
            </div>
          </div>
        )}

        {/* Chat Bubble Button */}
        <div
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-2xl text-2xl cursor-pointer animate-bounce hover:animate-none transition-all"
        >
          {isChatOpen ? "✖️" : "💬"}
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;
