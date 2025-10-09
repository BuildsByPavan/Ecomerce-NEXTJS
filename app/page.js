"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import HomeSection from "./components/autoSlider";
import { useCartStore } from "./store/useCartstore";
import { useRouter } from "next/navigation";
import { useFilterStore } from "./store/useFilterStore";
import { toast } from "react-hot-toast";
import { ClipLoader } from "react-spinners";

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

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { addToCart, fetchCart } = useCartStore();
  const router = useRouter();
  const { selectedCategory, setSelectedCategory, searchQuery } = useFilterStore();
  const sliderRefs = useRef({});
  const [highlightedCategory, setHighlightedCategory] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleAddToCart = async (productId, e) => {
    e.stopPropagation();
    try {
      await addToCart(productId);
      toast.success("Added to cart!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    if (!searchQuery) return;
    const matchedCategory = categories.find((category) => {
      return products.some((p) => {
        const matchCategory =
          category === "All Products" ||
          p.category?.toLowerCase() === category.toLowerCase();
        const matchSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
      });
    });

    if (matchedCategory && sliderRefs.current[matchedCategory]) {
      const element = sliderRefs.current[matchedCategory];
      const offset = 120;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });

      setHighlightedCategory(matchedCategory);
      setTimeout(() => setHighlightedCategory(null), 1500);
    }
  }, [searchQuery, products]);

  const handleCategoryClick = (category) => {
    if (sliderRefs.current[category]) {
      const element = sliderRefs.current[category];
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-4 space-y-16">
      <HomeSection onCategoryClick={handleCategoryClick} selectedCategory={selectedCategory} />

      {categories.map((category) => {
        const filteredProducts = products.filter((p) => {
          const matchCategory =
            category === "All Products" ||
            p.category?.toLowerCase() === category.toLowerCase();
          const matchSearch = searchQuery
            ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
          return matchCategory && matchSearch;
        });

        return (
          <CategorySlider
            key={category}
            category={category}
            products={filteredProducts}
            router={router}
            handleAddToCart={handleAddToCart}
            highlightText={highlightText}
            isHighlighted={highlightedCategory === category}
            ref={(el) => (sliderRefs.current[category] = el)}
            loading={loadingProducts}
          />
        );
      })}
    </div>
  );
}

const CategorySlider = React.forwardRef(
  ({ category, products, router, handleAddToCart, highlightText, isHighlighted, loading }, ref) => {
    const sliderRef = useRef(null);
    const [viewAllLoading, setViewAllLoading] = useState(false);

    const scroll = (dir) => {
      if (!sliderRef.current) return;
      sliderRef.current.scrollBy({
        left: dir === "left" ? -400 : 400,
        behavior: "smooth",
      });
    };

    const handleViewAll = async () => {
      setViewAllLoading(true);
      setTimeout(() => {
        router.push(`/category/${encodeURIComponent(category.toLowerCase())}`);
        setViewAllLoading(false);
      }, 500);
    };

    const skeletonsCount = Math.floor(window.innerWidth / 240); // adaptive skeletons

    return (
      <div
        ref={ref}
        className={`space-y-3 transition-all duration-500 ${
          isHighlighted ? "bg-yellow-100 shadow-lg rounded-2xl scale-[1.02]" : ""
        }`}
      >
        <h2 className="text-2xl font-bold mb-2">{category}</h2>
        <div className="relative">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
          >
            &#8592;
          </button>

          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-6 py-2"
          >
            {loading
              ? Array(skeletonsCount)
                  .fill(0)
                  .map((_, idx) => (
                    <div
                      key={idx}
                      className="w-[220px] bg-white border border-gray-200 rounded-2xl flex-shrink-0 p-3 animate-pulse"
                    >
                      <div className="w-full h-36 bg-gray-200 rounded-md mb-2 shimmer" />
                      <div className="h-4 bg-gray-200 rounded mb-1 w-3/4 shimmer" />
                      <div className="h-3 bg-gray-200 rounded mb-1 w-1/2 shimmer" />
                      <div className="h-4 bg-gray-200 rounded w-1/3 shimmer mt-2" />
                      <div className="h-8 bg-gray-200 rounded mt-2 shimmer" />
                    </div>
                  ))
              : products.slice(0, 10).map((p) => (
                  <div
                    key={p._id}
                    onClick={() => router.push(`/products/${p._id}`)}
                    className="w-[220px] bg-white rounded-2xl border border-gray-200 flex-shrink-0 flex flex-col items-center p-3 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                  >
                    <div className="relative w-full h-36 mb-2">
                      <Image
                        src={p.image || "/placeholder.png"}
                        alt={p.title}
                        fill
                        className="object-contain rounded-md"
                      />
                    </div>
                    <h2 className="font-semibold text-center text-sm line-clamp-1">
                      {highlightText(p.title)}
                    </h2>
                    <p className="text-xs text-gray-500 text-center line-clamp-1">
                      {p.category}
                    </p>
                    <p className="text-blue-600 font-semibold mt-1 text-sm">
                      ₹{p.price}
                    </p>
                    <button
                      onClick={(e) => handleAddToCart(p._id, e)}
                      className="mt-2 cursor-pointer bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 active:scale-95 transition-all text-xs"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
          >
            &#8594;
          </button>
        </div>

        {products.length > 0 && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleViewAll}
              className="flex items-center justify-center gap-2 bg-red-500 cursor-pointer text-white font-medium px-8 py-3 rounded-md hover:bg-red-700 active:scale-95 transition-all shadow-sm"
            >
              {viewAllLoading ? <ClipLoader size={20} color="#fff" /> : "View All Products"}
            </button>
          </div>
        )}

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .shimmer {
            position: relative;
            overflow: hidden;
          }
          .shimmer::after {
            content: "";
            position: absolute;
            top: 0;
            left: -150px;
            height: 100%;
            width: 150px;
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.2) 50%,
              rgba(255, 255, 255, 0) 100%
            );
            animation: shimmer 1.5s infinite;
          }
          @keyframes shimmer {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(300px);
            }
          }
        `}</style>
      </div>
    );
  }
);

CategorySlider.displayName = "CategorySlider";

