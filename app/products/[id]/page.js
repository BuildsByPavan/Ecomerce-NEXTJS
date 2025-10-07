"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "../../store/useCartstore";
import { ClipLoader } from "react-spinners";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false); 
  const router = useRouter();
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product._id);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <ClipLoader size={50} color="#3b82f6" />
      </div>
    );

  if (!product)
    return <p className="text-center mt-10 text-red-500">Product not found.</p>;

  return (
    <div className="px-4 md:px-20 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="flex justify-center items-center">
        <Image
          src={product.image || "/placeholder.png"}
          alt={product.title}
          width={400}
          height={400}
          className="object-contain rounded-lg"
        />
      </div>

      <div className="flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-gray-800">{product.title}</h1>
        <p className="text-gray-600 mt-3">{product.description}</p>
        <p className="text-blue-600 text-2xl font-semibold mt-4">₹{product.price}</p>

        <p className="text-sm text-gray-500 mt-2">
          Category: <span className="font-medium">{product.category}</span>
        </p>

        <p
          className={`mt-2 text-sm ${
            product.stock > 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </p>

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || addingToCart}
            className={`flex cursor-pointer items-center justify-center px-6 py-3 rounded-lg text-white transition ${
              product.stock <= 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {addingToCart ? <ClipLoader size={20} color="#ffffff" /> : "Add to Cart"}
          </button>

          <button
            onClick={() => router.push("/")}
            className="border cursor-pointer border-gray-400 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
