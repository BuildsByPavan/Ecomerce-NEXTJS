"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useCartStore } from "../../store/useCartstore";
import { toast } from "react-hot-toast";
import { ClipLoader } from "react-spinners";

export default function CategoryPage() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); 
  const { addToCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        // Filter products by category
        const filtered = data.filter((p) =>
          decodedCategory === "all products"
            ? true
            : p.category?.toLowerCase() === decodedCategory.toLowerCase()
        );
        setProducts(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [decodedCategory]);

  const handleAddToCart = async (productId, e) => {
    e.stopPropagation();
    try {
      await addToCart(productId);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <ClipLoader size={50} color="#3b82f6" />
      </div>
    );

  return (
    <div className="px-6 py-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 capitalize">
        {decodedCategory}
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-500 text-lg text-center mt-20">
          No products found in this category.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p._id}
              onClick={() => router.push(`/products/${p._id}`)}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition cursor-pointer"
            >
              <div className="relative w-full h-40 mb-3">
                <Image
                  src={p.image || "/placeholder.png"}
                  alt={p.title}
                  fill
                  className="object-contain rounded-md"
                />
              </div>
              <h2 className="font-semibold text-gray-800 text-sm line-clamp-1">
                {p.title}
              </h2>
              <p className="text-gray-500 text-sm">{p.category}</p>
              <p className="text-blue-600 font-semibold mt-1 text-sm">
                ₹{p.price}
              </p>
              <button
                onClick={(e) => handleAddToCart(p._id, e)}
                className="mt-2 w-full cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
