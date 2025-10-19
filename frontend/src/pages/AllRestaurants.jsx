import React, { useEffect, useState } from "react";
import axios from "../utils/axios.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { capitalizeEachWord } from "../utils/StringUtils.js";
import Layout from "../components/Layout.jsx";
import { FaStar, FaSearch } from "react-icons/fa";

const AllRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);

      try {
        // Load from localStorage first
        // const stored = localStorage.getItem("allRestaurants");
        // if (stored) {
        //   const data = JSON.parse(stored);
        //   setRestaurants(data);
        //   setFiltered(data);
        // }

        // Always fetch fresh data from API
        const { data } = await axios.get("/restaurant/all-restaurants");
        const allRestaurants = data.restaurants || [];
        setRestaurants(allRestaurants);
        setFiltered(allRestaurants);
        localStorage.setItem("allRestaurants", JSON.stringify(allRestaurants));
      } catch (err) {
        toast.error("Failed to fetch restaurants");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Filter & search
  useEffect(() => {
    if (!restaurants.length) return;

    const timer = setTimeout(() => {
      let result = restaurants;

      if (query.trim()) {
        result = result.filter((r) =>
          r.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (filter !== "all") {
        result = result.filter((r) => r.type?.toLowerCase() === filter);
      }

      setFiltered(result);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, filter, restaurants]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-gray-100">
          Explore All Restaurants 🍴
        </h1>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div className="relative w-full md:w-1/2">
            <FaSearch className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="all">All</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-Veg</option>
          </select>
        </div>

        {/* Restaurant Grid */}
        {loading ? (
          <p className="text-center text-gray-500">Loading restaurants...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No restaurants found</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map((res) => (
              <div
                key={res._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <img
                  src={res.coverImage}
                  alt={res.name}
                  className="w-full h-44 object-cover rounded-t-2xl"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {capitalizeEachWord(res.name)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                    {capitalizeEachWord(res.address)}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" /> {res.rating || "4.2"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        res.type?.toLowerCase() === "veg"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {capitalizeEachWord(res.type || "Veg")}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/restaurant/${encodeURIComponent(res.name)}`)
                    }
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition font-semibold"
                  >
                    Visit Restaurant
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AllRestaurants;
