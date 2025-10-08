"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AiOutlineSearch } from "react-icons/ai";
import { FaShoppingCart } from "react-icons/fa";
import { FiUserPlus, FiLogIn, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { RiHistoryLine } from "react-icons/ri";
import { MdDashboard } from "react-icons/md";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "../store/useCartstore";
import { useFilterStore } from "../store/useFilterStore";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const router = useRouter();

  const [profilePic, setProfilePic] = useState("/default-avatar.jpg");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tempSearch, setTempSearch] = useState("");
  const pathname = usePathname();

  const { cartItems, fetchCart } = useCartStore();
  const { setSearchQuery } = useFilterStore();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Scroll to products section helper
  const scrollToProducts = () => {
    const section = document.getElementById("products-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // 🔍 Trigger search automatically when typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setTempSearch(value);
    setSearchQuery(value);
    scrollToProducts();
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    setSearchQuery("");
    setTempSearch("");

    if (pathname === "/") {
      const section = document.getElementById("products-section");
      if (section) section.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    } else router.push("/");
  };

  useEffect(() => {
    if (user?.profilePic) {
      if (user.profilePic.startsWith("data:image")) setProfilePic(user.profilePic);
      else if (user.profilePic.startsWith("http")) setProfilePic(user.profilePic);
      else setProfilePic(`data:image/jpeg;base64,${user.profilePic}`);
    } else {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser?.profilePic) {
        if (storedUser.profilePic.startsWith("data:image")) setProfilePic(storedUser.profilePic);
        else if (storedUser.profilePic.startsWith("http")) setProfilePic(storedUser.profilePic);
        else setProfilePic(`data:image/jpeg;base64,${storedUser.profilePic}`);
      } else setProfilePic("/default-avatar.jpg");
    }

    const handleUserUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      if (updatedUser?.profilePic) {
        if (updatedUser.profilePic.startsWith("data:image")) setProfilePic(updatedUser.profilePic);
        else if (updatedUser.profilePic.startsWith("http")) setProfilePic(updatedUser.profilePic);
        else setProfilePic(`data:image/jpeg;base64,${updatedUser.profilePic}`);
      } else setProfilePic("/default-avatar.jpg");
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const handleSessionChange = () => update();
    window.addEventListener("focus", handleSessionChange);
    window.addEventListener("sessionUpdated", handleSessionChange);
    return () => {
      window.removeEventListener("focus", handleSessionChange);
      window.removeEventListener("sessionUpdated", handleSessionChange);
    };
  }, [update]);

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          <button
            onClick={handleHomeClick}
            title="Go to Home"
            className="flex items-center cursor-pointer gap-1 text-2xl font-extrabold text-gray-900"
          >
            Exclusive
          </button>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center border border-gray-300 rounded-full overflow-hidden w-full max-w-md shadow-sm">
              <AiOutlineSearch className="ml-3 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                className="flex-grow px-3 py-2 outline-none text-gray-700"
                value={tempSearch}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile search toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
            >
              {isSearchOpen ? <FiX size={26} /> : <AiOutlineSearch size={22} />}
            </button>

            <Link
              href="/cart"
              title="Go to Cart"
              className="relative flex mr-3 items-center gap-1 text-lg font-medium text-gray-700 hover:text-blue-600 transition"
            >
              <FaShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {user && (
              <button
                onClick={() => router.push("/profile")}
                className="w-10 cursor-pointer mr-3 h-10 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm hover:ring-2 hover:ring-blue-400 transition"
                title="Go to Profile"
              >
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
            >
              {isMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6 text-gray-700">
            {!user ? (
              <>
                <Link href="/login" className="flex items-center gap-1 hover:text-blue-600 transition">
                  <FiLogIn size={18} /> Login
                </Link>
                <Link href="/register" className="flex items-center gap-1 hover:text-blue-600 transition">
                  <FiUserPlus size={18} /> Register
                </Link>
              </>
            ) : (
              <>
                <Link href="/orders" className="flex items-center gap-1 hover:text-blue-600 transition">
                  <RiHistoryLine size={18} /> Orders
                </Link>
                <button
                  onClick={async () => {
                    await signOut({ callbackUrl: "/" });
                    fetchCart();
                    update();
                    toast.success("Logged out successfully!");
                  }}
                  className="flex cursor-pointer items-center gap-1 hover:text-blue-600 transition"
                >
                  <FiLogOut size={18} /> Logout
                </button>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-1 hover:text-blue-600 transition">
                    <MdDashboard size={18} /> Admin
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile search input */}
        {isSearchOpen && (
          <div className="md:hidden mt-2 px-2 pb-3 space-y-1">
            <input
              type="text"
              placeholder="Search products..."
              value={tempSearch}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 px-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {!user ? (
              <>
                <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <FiLogIn size={18} /> Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <FiUserPlus size={18} /> Register
                </Link>
              </>
            ) : (
              <>
                <Link href="/orders" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <RiHistoryLine size={18} /> Orders
                </Link>
                <button
                  onClick={async () => {
                    await signOut({ callbackUrl: "/" });
                    fetchCart();
                    update();
                    toast.success("Logged out successfully!");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 cursor-pointer rounded-md hover:bg-gray-100"
                >
                  <FiLogOut size={18} /> Logout
                </button>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer">
                    <MdDashboard size={18} /> Admin
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
