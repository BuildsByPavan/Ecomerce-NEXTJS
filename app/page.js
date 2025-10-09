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
  const { addToCart, fetchCart } = useCartStore();
  const router = useRouter();
  const { selectedCategory, setSelectedCategory, searchQuery } = useFilterStore();

  const sliderRefs = useRef({});
  const [highlightedCategory, setHighlightedCategory] = useState(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  // Fetch cart
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
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

  // Highlight search matches in product title
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

  // Auto-scroll and highlight when searchQuery changes
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

  // Handle category click from HomeSection
  const handleCategoryClick = (category) => {
    if (sliderRefs.current[category]) {
      const element = sliderRefs.current[category];
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div
      id="products-section"
      className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-4 space-y-16"
    >
      <HomeSection
        onCategoryClick={handleCategoryClick}
        selectedCategory={selectedCategory}
      />

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
          />
        );
      })}
    </div>
  );
}

// CategorySlider component
const CategorySlider = React.forwardRef(
  ({ category, products, router, handleAddToCart, highlightText, isHighlighted }, ref) => {
    const sliderRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const scroll = (dir) => {
      if (!sliderRef.current) return;
      sliderRef.current.scrollBy({
        left: dir === "left" ? -400 : 400,
        behavior: "smooth",
      });
    };

    const handleViewAll = async () => {
      setLoading(true);
      setTimeout(() => {
        router.push(`/category/${encodeURIComponent(category.toLowerCase())}`);
        setLoading(false);
      }, 500);
    };

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
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-6"
          >
            {products.length === 0 ? (
              <div className="min-w-[300px] h-48 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">
                No products found
              </div>
            ) : (
              products.slice(0, 10).map((p) => (
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
              ))
            )}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10 hover:bg-gray-100"
          >
            &#8594;
          </button>
        </div>

        {products.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleViewAll}
              className="flex items-center justify-center gap-2 bg-red-500 cursor-pointer text-white font-medium px-8 py-3 rounded-md hover:bg-red-700 active:scale-95 transition-all shadow-sm"
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : "View All Products"}
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
        `}</style>
      </div>
    );
  }
);

CategorySlider.displayName = "CategorySlider";
