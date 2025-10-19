import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "../utils/axios.js";
import { useSelector } from "react-redux";
import { capitalizeEachWord } from "../utils/StringUtils.js";
import Layout from "../components/Layout.jsx";
import { FaStar, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";

const SingleRestaurantPage = () => {
  const { name } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewImages, setReviewImages] = useState([]);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem("restaurants") || "[]");
      const found = stored.find(
        (r) => r.name.toLowerCase() === decodeURIComponent(name).toLowerCase()
      );

      if (found) {
        setRestaurant(found);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `/restaurant/get-restaurant/${encodeURIComponent(name)}`
        );
        setRestaurant(res.data.data);
        if (res.data.data) {
          localStorage.setItem(
            "restaurants",
            JSON.stringify([...stored, res.data.data])
          );
        }
      } catch (err) {
        toast.error("Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [name]);

  const handleAddToCart = async (dish, category) => {
    try {
      if (!user?.isLoggedIn)
        return toast.error("Please log in to add items to cart");

      const response = await axios.get(`/cart/add-cart/${dish._id}`, {
        params: { restaurant_name: restaurant.name, category },
      });

      toast.success(response.data.message || "Item added to cart");

      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = storedCart.findIndex((item) => item._id === dish._id);
      let updated;
      if (existing !== -1)
        updated = storedCart.map((i, idx) =>
          idx === existing ? { ...i, quantity: i.quantity + 1 } : i
        );
      else
        updated = [
          ...storedCart,
          {
            _id: dish._id,
            restaurant_name: restaurant.name,
            food: dish,
            quantity: 1,
          },
        ];

      localStorage.setItem("cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add item to cart");
    }
  };

  // 🟢 Handle Review Submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user?.isLoggedIn)
      return toast.error("Please log in to submit a review");

    if (!reviewText.trim())
      return toast.error("Please write a review before submitting");

    try {
      const formData = new FormData();
      formData.append("restaurant_name", restaurant.name);
      formData.append("rating", rating);
      formData.append("message", reviewText);
      reviewImages.forEach((file) => formData.append("images", file));

      const res = await axios.post("/restaurant/add-review", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message || "Review added successfully!");

      // ✅ Backend returns full updated restaurant
      const updatedRestaurant = res.data.restaurant;
      if (updatedRestaurant) {
        setRestaurant(updatedRestaurant);

        const stored = JSON.parse(localStorage.getItem("restaurants") || "[]");
        const updatedList = stored.map((r) =>
          r.name === updatedRestaurant.name ? updatedRestaurant : r
        );
        localStorage.setItem("restaurants", JSON.stringify(updatedList));
      }

      // Reset form
      setReviewText("");
      setRating(5);
      setReviewImages([]);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message); // show backend error
    } else {
      toast.error("Something went wrong! Please try again.");
    }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-gray-500 text-lg animate-pulse">
          Loading restaurant...
        </p>
      </div>
    );

  if (!restaurant)
    return (
      <div className="text-center text-red-500 mt-10 text-lg">
        Restaurant not found.
      </div>
    );

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative w-full h-80 md:h-[400px] overflow-hidden rounded-b-3xl">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white bg-gradient-to-t from-black/80 via-black/20">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            {capitalizeEachWord(restaurant.name)}
          </h1>
          <div className="flex flex-wrap gap-4 mt-3 text-sm md:text-base">
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt /> {capitalizeEachWord(restaurant.address)}
            </span>
            <span className="flex items-center gap-1">
              <FaPhone /> {restaurant.contact}
            </span>
            <span className="flex items-center gap-1">
              <FaEnvelope /> {restaurant.email}
            </span>
            <span className="bg-yellow-400 text-black font-semibold px-3 py-1 rounded-full">
              ⭐ {restaurant.rating || "4.3"}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100 text-center">
          🍽️ Explore Our Menu
        </h2>

        {restaurant.cusines?.map((cuisine) => (
          <div key={cuisine._id} className="mb-12">
            <h3 className="text-2xl font-semibold text-blue-600 mb-5 border-b pb-2">
              {capitalizeEachWord(cuisine.category)}
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {cuisine.food.map((dish) => (
                <div
                  key={dish._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {capitalizeEachWord(dish.name)}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          dish.veg
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {dish.veg ? "Veg" : "Non-Veg"}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                      {capitalizeEachWord(dish.description)}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ₹{dish.price}
                    </p>
                  </div>

                  {dish.images?.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {dish.images.map((img) => (
                        <img
                          key={img._id}
                          src={img.url}
                          alt="Dish"
                          className="w-24 h-24 object-cover rounded-lg shadow-sm"
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleAddToCart(dish, cuisine.category)}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition"
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 🟢 Add Review Section */}
      <div className="max-w-3xl mx-auto px-6 py-10 bg-white dark:bg-gray-900 rounded-2xl shadow-md mb-10">
        <h2 className="text-2xl font-bold mb-5 text-center text-gray-800 dark:text-gray-100">
          ✍️ Write a Review
        </h2>
        {!user?.isLoggedIn ? (
          <p className="text-center text-gray-500">
            Please log in to write a review.
          </p>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-5">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200">
                Rating:
              </label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    onClick={() => setRating(star)}
                    className={`cursor-pointer text-2xl ${
                      star <= rating ? "text-yellow-400" : "text-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200">
                Review:
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="4"
                placeholder="Share your experience..."
                className="w-full mt-2 p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="font-semibold text-white-700 dark:text-gray-200">
                Upload Images (optional):
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setReviewImages([...e.target.files])}
                className="mt-2 w-full border dark:border-gray-700 p-2 rounded-lg dark:bg-gray-800"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-700 transition"
            >
              🚀 Submit Review
            </button>
          </form>
        )}
      </div>

      {/* Reviews Section */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
          💬 Customer Reviews
        </h2>

        {restaurant.reviews?.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurant.reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={review.userImage || "/default-avatar.png"}
                    alt={review.username}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                      {capitalizeEachWord(review.username)}
                    </h4>
                    <p className="text-yellow-500 text-sm">⭐ {review.rating}</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-3">
                  "{review.message}"
                </p>
                <div className="flex gap-2 overflow-x-auto">
                  {review.images?.map((img) => (
                    <img
                      key={img._id || img.url}
                      src={img.url}
                      alt="Review"
                      className="w-20 h-20 object-cover rounded-lg shadow-sm"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            No reviews yet. Be the first to add one!
          </p>
        )}
      </div>
    </Layout>
  );
};

export default SingleRestaurantPage;
