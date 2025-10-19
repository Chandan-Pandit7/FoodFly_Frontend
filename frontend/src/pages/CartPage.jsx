import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "../utils/axios.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { capitalizeEachWord } from "../utils/StringUtils.js";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice.js";
import Layout from "../components/Layout.jsx";


const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  

  // ✅ Fetch cart items from backend
  const fetchCart = async () => {
    if (!user?.isLoggedIn) return;
    setLoading(true);
    try {
      const { data } = await axios.get("/cart/view-cart-items", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const validatedCart = data.cart.map((item) => ({
        ...item,
        quantity: item.quantity || 1,
      }));

      setCart(validatedCart);
      setTotalPrice(data.totalPrice || 0); // ✅ Sync with backend total
      localStorage.setItem("cart", JSON.stringify(validatedCart));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // ✅ Update local cart & persist
  const updateCart = (updatedCart, updatedTotal) => {
    setCart(updatedCart);
    setTotalPrice(updatedTotal);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // ✅ Change quantity
  const changeQuantity = async (item, type) => {
    if (type === "decrement" && item.quantity <= 1) {
      toast.error("Minimum quantity is 1");
      return;
    }

    try {
      const endpoint =
        type === "increment"
          ? `/cart/cart-item-increase/${item.food._id}`
          : `/cart/cart-item-decrease/${item.food._id}`;

      const { data } = await axios.get(endpoint, {
        params: {
          restaurant_name: item.restaurant_name,
          category: item.category,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      updateCart(data.cart, data.totalPrice);
      toast.success(data.message);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update quantity");
    }
  };

  // ✅ Remove item
  const handleRemove = async (item) => {
    try {
      const { data } = await axios.get(
        `/cart/cart-item-delete/${item.food._id}`,
        {
          params: {
            restaurant_name: item.restaurant_name,
            category: item.category,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      updateCart(data.cart, data.totalPrice);
      toast.success("Item removed from cart");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to remove item");
    }
  };

  // ✅ Local total backup
  const localTotal = cart.reduce(
    (acc, item) => acc + item.food.price * item.quantity,
    0
  );

  // ✅ Checkout / Order creation
  const handleCheckout = async () => {
    if (!cart.length) {
      toast.error("Your cart is empty!");
      return;
    }

    try {
      toast.loading("Creating Razorpay order...");

      const orderData = {
        amount: totalPrice * 100, // in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      // Backend directly uses req.body as Razorpay options
      const { data } = await axios.post("/payment/create-order", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.dismiss();

      if (!data || !data.id) {
        toast.error("Failed to create Razorpay order!");
        return;
      }

      toast.success("Order created successfully!");
      // console.log("Razorpay Order:", data);

      // ✅ Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // from your .env
        amount: data.amount,
        currency: data.currency,
        name: "FoodFly",
        description: "Order Payment",
        order_id: data.id,
        handler: async function (response) {
          const body={...response};
          // console.log("body",body);
          const {data} = await axios.post(`/payment/verify-order`, body);
					// console.log("data",data);
          dispatch(setUser({...user, cart:[]}))
          toast.success("Payment successful!");
          // console.log("Payment Response:", response);
          localStorage.removeItem("cart");
          navigate("/orders");
        },
        prefill: {
          name: user.username || "Customer",
          email: user.email,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
				console.log(response);
				alert(response.error.code);
				alert(response.error.description);
			});
      rzp.open();
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Something went wrong while creating the order!");
    }
  };

  const displayTotal = totalPrice || localTotal;

  return (
    <Layout>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">🛒 Your Cart</h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading cart...</p>
        ) : cart.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            {/* Cart Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {cart.map((item) => (
                <div
                  key={item.food._id || item._id}
                  className="bg-white border rounded-lg p-4 shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        {capitalizeEachWord(item.food.name)}
                      </h2>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.food.veg
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.food.veg ? "Veg" : "Non-Veg"}
                      </span>
                    </div>

                    <p className="text-gray-600 mt-1">
                      {capitalizeEachWord(item.food.description)}
                    </p>
                    <p className="text-gray-800 font-medium mt-1">
                      ₹{item.food.price}
                    </p>

                    {item.food.images?.length > 0 && (
                      <img
                        src={item.food.images[0].url}
                        alt={item.food.name}
                        className="w-full h-40 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => changeQuantity(item, "decrement")}
                        className="bg-gray-300 hover:bg-gray-400 px-2 py-1 rounded text-lg font-bold"
                      >
                        -
                      </button>
                      <span className="font-medium">{item.quantity}</span>
                      <button
                        onClick={() => changeQuantity(item, "increment")}
                        className="bg-gray-300 hover:bg-gray-400 px-2 py-1 rounded text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg text-sm font-medium transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ Total Summary */}
            <div className="border-t pt-4 flex justify-between items-center text-lg font-semibold">
              <span className="text-white">Total:</span>
              <span className="text-green-600 font-bold text-xl">
                ₹{displayTotal}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition"
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
