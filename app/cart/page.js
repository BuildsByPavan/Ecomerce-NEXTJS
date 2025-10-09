"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "../store/useCartstore";
import { ClipLoader } from "react-spinners";
import { toast } from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);

  const {
    cartItems,
    loading,
    fetchCart,
    mergeCart,
    updateQuantity,
    removeItem,
  } = useCartStore();

  useEffect(() => {
    (async () => {
      await fetchCart();

      const userRes = await fetch("/api/auth/session");
      if (userRes.ok) await mergeCart();
    })();
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId) => {
    await removeItem(productId);
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      toast.success(data.message || "Order placed successfully!"); 
      await fetchCart();
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <ClipLoader size={50} color="#3b82f6" />
      </div>
    );

  if (!cartItems.length)
    return <p className="text-center mt-10 text-gray-600">Your cart is empty.</p>;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="max-w-6xl mx-auto p-6 pt-10 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
          <ClipLoader size={50} color="#3b82f6" />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Subtotal</th>
              <th className="p-4 text-red-500">Remove</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.product._id} className="border-b">
                <td className="p-4 flex items-center gap-3">
                  <Image
                    src={item.product?.image || "/placeholder.png"}
                    alt={item.product?.title || "Product"}
                    width={60}
                    height={60}
                    className="rounded"
                  />
                  {item.product?.title || "Unknown Product"}
                </td>
                <td className="p-4">₹{item.product?.price || 0}</td>
                <td className="p-4">
                  <select
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.product._id, +e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4 font-semibold">
                  ₹{(item.product?.price * item.quantity || 0).toFixed(2)}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleRemove(item.product._id)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <div className="w-80 border rounded-lg p-6 shadow-md bg-white">
          <h2 className="text-lg font-semibold mb-4 text-center">Cart Summary</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold text-lg">
            <span>Total:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className={`bg-blue-600 text-white w-full py-2 mt-4 rounded transition ${
              checkingOut ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {checkingOut ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
