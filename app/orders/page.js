"use client";

import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders", { method: "GET" });
        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <ClipLoader size={50} color="#3b82f6" />
      </div>
    );

  if (orders.length === 0)
    return <p className="p-4 text-center text-gray-600">No orders found. Place your first order!</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">My Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border rounded-lg shadow-sm p-4 bg-white"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Order #{order._id.slice(-6)}</h2>
              <p className="text-gray-500 text-sm">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <ul className="divide-y">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex justify-between py-2">
                  <span>
                    {item.product?.name || "Product"} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{item.product?.price * item.quantity}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center mt-3 pt-2 border-t">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-green-600">₹{order.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
