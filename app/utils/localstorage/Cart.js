const GUEST_CART_KEY = "guestCart";

export const getGuestCart = () => {
  if (typeof window === "undefined") return [];

  try {
    const cart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");

    return cart
      .filter(
        (item) =>
          item?.productId &&
          typeof item.quantity === "number" &&
          item.quantity > 0
      )
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
  } catch (err) {
    console.error("Failed to parse guest cart from localStorage:", err);
    return [];
  }
};

export const saveGuestCart = (cart) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error("Failed to save guest cart to localStorage:", err);
  }
};

export const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
};

export const removeGuestCartItem = (productId) => {
  if (typeof window === "undefined") return [];

  const cart = getGuestCart();
  const updatedCart = cart.filter((item) => item.productId !== productId);
  saveGuestCart(updatedCart);
  return updatedCart;
};
