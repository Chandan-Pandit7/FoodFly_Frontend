import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "../utils/axios.js";
import { useSelector } from "react-redux";
import { capitalizeEachWord } from "../utils/StringUtils.js";
import Layout from "../components/Layout.jsx";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);

  const fetchOrders = async () => {
    if (!user?.isLoggedIn) return;
    setLoading(true);
    try {
      const { data } = await axios.get("/profile/order-history");
      setOrders(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const printReceipt = (order) => {
    const receiptWindow = window.open("", "_blank", "width=600,height=800");
    receiptWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            tfoot td { font-weight: bold; }
            img { width: 50px; height: 50px; object-fit: cover; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>FoodFly</h1>
          <h2>Order Receipt</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
          <p><strong>Name:</strong>${capitalizeEachWord(user.name)}</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Image</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>${capitalizeEachWord(item.name)}</td>
                  <td><img src="${item.image}" alt="${item.name}" /></td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td>₹${item.price * item.quantity}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4">Total</td>
                <td>₹${order.totalPrice}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  return (
    <Layout>
    {/* <div className="min-h-screen bg-gray-100 w-full"> */}
      {/* <Navbar /> */}
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">📦 Your Orders</h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-600">You haven’t placed any orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white shadow rounded-lg p-4 border border-gray-200"
              >
                {/* Order Header */}
                <div className="flex justify-between items-center border-b pb-2 mb-3">
                  <div>
                    <p className="font-semibold text-lg text-gray-800">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold px-3 py-1 rounded bg-blue-100 text-blue-700">
                    Completed
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image || `https://via.placeholder.com/64?text=${encodeURIComponent(item.name)}`}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{capitalizeEachWord(item.name)}</p>
                          <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-700">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex justify-between items-center mt-4">
                  <p className="text-green-600 font-bold text-lg">
                    Total: ₹{order.totalPrice}
                  </p>
                  <button
                    onClick={() => printReceipt(order)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    🖨️ Print Receipt
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

export default OrdersPage;
