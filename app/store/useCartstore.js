"use client";
import { create } from "zustand";
import { getGuestCart, saveGuestCart } from "../utils/localstorage/Cart";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cartItems: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/cart", { credentials: "include" });

      if (res.status === 401) {
        // Guest cart logic
        const guestCart = getGuestCart();
        if (guestCart.length === 0) {
          set({ cartItems: [], loading: false });
          return;
        }

        const detailedCart = await Promise.all(
          guestCart.map(async (item) => {
            const prodRes = await fetch(`/api/products/${item.productId}`);
            const product = await prodRes.json();
            return { product, quantity: item.quantity };
          })
        );

        set({ cartItems: detailedCart, loading: false });
        return;
      }

      const data = await res.json();
      set({ cartItems: data || [], loading: false });
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      toast.error("Failed to fetch cart");
      set({ loading: false });
    }
  },

  addToCart: async (productId) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
        credentials: "include",
      });

      if (res.status === 401) {
        let cart = getGuestCart();
        const existing = cart.find((item) => item.productId === productId);
        if (existing) existing.quantity += 1;
        else cart.push({ productId, quantity: 1 });
        saveGuestCart(cart);
        await get().fetchCart();
        set({ loading: false });
        return;
      }

      await get().fetchCart();
      toast.success("Product added to cart!");
      set({ loading: false });
    } catch (err) {
      console.error("Add to cart failed:", err);
      toast.error("Failed to add product to cart");
      set({ loading: false });
    }
  },

  updateQuantity: async (productId, newQuantity) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (res.status === 401) {
        const guestCart = getGuestCart().map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
        saveGuestCart(guestCart);
      }

      await get().fetchCart();
      toast.success("Cart updated!");
      set({ loading: false });
    } catch (err) {
      console.error("Failed to update quantity:", err);
      toast.error("Failed to update cart");
      set({ loading: false });
    }
  },

  removeItem: async (productId) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        const guestCart = getGuestCart().filter((item) => item.productId !== productId);
        saveGuestCart(guestCart);
      }

      await get().fetchCart();
      toast.success("Item removed from cart");
      set({ loading: false });
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error("Failed to remove item from cart");
      set({ loading: false });
    }
  },

  mergeCart: async () => {
    set({ loading: true });
    try {
      const guestCart = getGuestCart();
      if (guestCart.length === 0) {
        set({ loading: false });
        return false;
      }

      const items = guestCart.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        localStorage.removeItem("guestCart");
        await get().fetchCart();
        setTimeout(() => toast.success("Cart merged successfully!"), 100);
        set({ loading: false });
        return true;
      }

      set({ loading: false });
      return false;
    } catch (err) {
      console.error("Cart merge failed:", err);
      set({ loading: false });
      return false;
    }
  },
}));
