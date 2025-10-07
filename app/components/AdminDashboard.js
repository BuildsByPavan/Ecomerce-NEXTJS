"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const categories = [
  "Electronics",
  "Fashion",
  "Home & Furniture",
  "Sports & Fitness",
  "Books",
  "Groceries",
  "Toys",
  "Beauty & Health",
];

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const productRefs = useRef({});

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  const addProduct = async () => {
    if (!title || !description || !price || !category || !image) return;

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, price, category, image, stock }),
    });

    const newProduct = await res.json();
    setProducts([...products, newProduct]);
    resetForm();
  };

  const updateProduct = async () => {
    const res = await fetch(`/api/products/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, price, category, image, stock }),
    });

    const updated = await res.json();
    setProducts(products.map((p) => (p._id === editingId ? updated : p)));
    resetForm();
    setEditingId(null);
  };

  const deleteProduct = async (id) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts(products.filter((p) => p._id !== id));
  };

  const startEditing = (p) => {
    setEditingId(p._id);
    setTitle(p.title);
    setDescription(p.description);
    setPrice(p.price);
    setCategory(p.category);
    setImage(p.image);
    setStock(p.stock);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImage("");
    setStock("");
  };

  const filteredProducts =
    searchTerm.trim() === ""
      ? products
      : products.filter((p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const categorizedProducts =
    searchTerm.trim() !== ""
      ? [{ category: "Search Results", items: filteredProducts }]
      : categories.map((cat) => ({
          category: cat,
          items: products.filter(
            (p) => p.category?.toLowerCase() === cat.toLowerCase()
          ),
        }));

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
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
    if (searchTerm.trim() === "" || !filteredProducts.length) return;
    const firstId = filteredProducts[0]._id;
    const element = productRefs.current[firstId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-4", "ring-yellow-300");
      setTimeout(() => element.classList.remove("ring-4", "ring-yellow-300"), 1500);
    }
  }, [searchTerm, filteredProducts]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Admin Dashboard
      </h1>
      <div className="mb-4 text-center">
        <p className="text-gray-600 text-lg">
          Search and manage your products quickly
        </p>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="Search products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>


      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 rounded-xl shadow-md">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <textarea
          placeholder="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="border border-gray-300 p-3 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2"
        />
        <input
          type="number"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Select Category</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>

      
        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg col-span-full focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <input
          type="number"
          placeholder="Stock Quantity"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {editingId ? (
          <div className="flex gap-3 col-span-full">
            <button
              onClick={updateProduct}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition"
            >
              Update Product
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditingId(null);
              }}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={addProduct}
            className="col-span-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
          >
            ➕ Add Product
          </button>
        )}
      </div>

     
      {categorizedProducts.map(({ category, items }) => (
        <div key={category} className="mb-10">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">
            {category}
          </h2>
          {items.length > 0 ? (
            <div className="flex flex-col gap-3">
              {items.map((p) => (
                <div
                  key={p._id}
                  ref={(el) => (productRefs.current[p._id] = el)}
                  className="border p-4 rounded-lg flex justify-between items-center shadow-sm bg-white hover:shadow-md transition"
                >
                  <Link
                    href={`/products/${p._id}`}
                    className="text-blue-600 font-medium truncate max-w-xs"
                  >
                    {highlightText(`${p.title} - ₹${p.price} (${p.stock} in stock)`)}
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(p)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No products in this category.</p>
          )}
        </div>
      ))}
    </div>
  );
}
