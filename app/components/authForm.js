"use client";

import { useState } from "react";
import InputField from "./inputFeild";
import Image from "next/image";
import registerAction from "../serverActions/registerAction";
import loginAction from "../serverActions/loginAction";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getGuestCart, clearGuestCart } from "../utils/localstorage/Cart";
import { useCartStore } from "../store/useCartstore";
import { toast } from "react-hot-toast";
import { ClipLoader } from "react-spinners";

export default function AuthForm({ type = "login" }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { fetchCart } = useCartStore();

  const mergeGuestCart = async () => {
    const guestCart = getGuestCart();
    if (!guestCart.length) return;

    try {
      const formattedCart = guestCart.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: formattedCart }),
        credentials: "include",
      });

      if (res.ok) {
        clearGuestCart();
        await fetchCart();
      } else {
        const errorData = await res.json();
        console.error("Failed to merge guest cart:", errorData);
      }
    } catch (err) {
      console.error("Merge guest cart error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "register") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }

        const registeredDetails = { username, email, password, confirmPassword };
        await registerAction(registeredDetails);

        toast.success("Registration successful! Please login.");
        router.push("/login");
        return;
      }

      if (type === "login") {
        const loginDetails = { email, password };
        const result = await loginAction(loginDetails);

        if (!result?.success) {
          toast.error("Invalid email or password");
          setLoading(false);
          return;
        }

        await mergeGuestCart();
        await fetchCart();

        window.dispatchEvent(new Event("sessionUpdated"));

        toast.success("Login successful!");

        if (result.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }

        router.refresh();
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen mx-8">
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
        <Image
          src="/img.svg"
          alt="Illustration"
          width={600}
          height={700}
          className="object-contain max-h-[80%]"
        />
      </div>

      <div className="flex flex-1 items-center justify-center p-6 bg-white">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md p-8 bg-white shadow-md rounded-xl"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
            {type === "login" ? "Login to Exclusive" : "Create an Account"}
          </h2>

          <div className="space-y-4">
            {type === "register" && (
              <InputField
                label="Username"
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            )}

            <InputField
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <InputField
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {type === "register" && (
              <InputField
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#DB4444] hover:bg-red-700 py-3 rounded-md text-white font-medium mt-6 transition duration-200 flex items-center justify-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <ClipLoader size={20} color="#ffffff" />
            ) : type === "login" ? (
              "Login"
            ) : (
              "Register"
            )}
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            {type === "login" ? (
              <>
                Don’t have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:underline">
                  Register here
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login here
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
