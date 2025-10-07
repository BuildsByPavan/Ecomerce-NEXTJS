"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { BsChevronDown } from "react-icons/bs";
import { useFilterStore } from "../store/useFilterStore";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    title: "Big Sale on Electronics",
    description: "Get up to 50% off on latest gadgets and accessories.",
    button: "Shop Now",
    category: "Electronics",
  },
  {
    src: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    title: "Trendy Fashion Deals",
    description: "Stay stylish with our latest clothing collection.",
    button: "Explore",
    category: "Fashion",
  },
  {
    src: "https://images.unsplash.com/photo-1503602642458-232111445657",
    title: "Home Essentials",
    description: "Upgrade your lifestyle with modern home products.",
    button: "Buy Now",
    category: "Home & Furniture",
  },
  {
    src: "https://images.unsplash.com/photo-1505238680356-667803448bb6",
    title: "Sports Gear",
    description: "Gear up for fitness with our sports collection.",
    button: "Start Shopping",
    category: "Sports & Fitness",
  },
  {
    src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    title: "Special Offers",
    description: "Don’t miss out on our limited-time discounts!",
    button: "Grab Deal",
    category: "All Products",
  },
];

const categories = [
  "All Products",
  "Electronics",
  "Fashion",
  "Home & Furniture",
  "Sports & Fitness",
  "Books",
  "Groceries",
  "Toys",
  "Beauty & Health",
];

export default function AutoSlider({ onCategoryClick, selectedCategory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showArrow, setShowArrow] = useState(false);
  const categoryListRef = useRef(null);

  const { setSelectedCategory } = useFilterStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const list = categoryListRef.current;
    if (list) setShowArrow(list.scrollHeight > list.clientHeight);
  }, []);

  const scrollCategoriesDown = () => {
    if (categoryListRef.current) {
      categoryListRef.current.scrollBy({ top: 60, behavior: "smooth" });
    }
  };

  const handleCategoryClickInternal = (cat) => {
    setSelectedCategory(cat);
    if (onCategoryClick) onCategoryClick(cat);
  };

  return (
    <div className="w-full">
      <div className="block lg:hidden bg-gray-100 rounded-lg shadow-md p-4 mb-4">
        <h2 className="font-bold text-lg mb-3">Categories</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {categories.map((cat, i) => (
            <div
              key={i}
              className={`flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium cursor-pointer shadow-sm ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-200"
              }`}
              onClick={() => handleCategoryClickInternal(cat)}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="hidden lg:flex col-span-1 bg-gray-100 rounded-lg shadow-md p-4 h-[400px] flex-col justify-start relative">
          <h2 className="font-bold text-lg mb-3">Categories</h2>
          <ul
            ref={categoryListRef}
            className="space-y-2 overflow-y-auto scrollbar-hide max-h-[320px] pr-2"
          >
            {categories.map((cat, i) => (
              <li
                key={i}
                className={`p-2 rounded-md cursor-pointer text-sm ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-200 bg-white"
                }`}
                onClick={() => handleCategoryClickInternal(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
          {showArrow && (
            <button
              onClick={scrollCategoriesDown}
              className="absolute bottom-2 right-1/2 cursor-pointer transform translate-x-1/2 bg-white/90 hover:bg-white px-2 py-1 rounded-full shadow-md"
            >
              <BsChevronDown className="text-gray-700 text-lg" />
            </button>
          )}
        </div>

        <div className="col-span-1 lg:col-span-3 relative overflow-hidden rounded-lg shadow-lg h-[400px]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute w-full h-full transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center text-white px-6">
                <h2
                  className="text-2xl md:text-4xl font-bold mb-3 cursor-pointer"
                  onClick={() => handleCategoryClickInternal(slide.category)}
                >
                  {slide.title}
                </h2>
                <p className="text-sm md:text-lg mb-4">{slide.description}</p>
                <button
                  className="bg-red-500 cursor-pointer  hover:bg-red-600 px-5 py-2 rounded-full font-semibold shadow-lg"
                  onClick={() => handleCategoryClickInternal(slide.category)}
                >
                  {slide.button}
                </button>
              </div>
            </div>
          ))}

          <div className="absolute  bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 cursor-pointer rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-gray-400"
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
