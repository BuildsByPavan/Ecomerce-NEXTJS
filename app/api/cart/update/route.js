import connectDB from "../../../utils/config/db";
import Cart from "../../../utils/models/Cart";
import { auth } from "../../../auth"; // 
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const { productId, quantity } = await req.json();

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  if (!productId || quantity < 1) {
    return NextResponse.json(
      { error: "Invalid product or quantity" },
      { status: 400 }
    );
  }

  const userId = session.user.id;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return NextResponse.json(
      { error: "Product not in cart" },
      { status: 404 }
    );
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate("items.product");

  return NextResponse.json(cart.items, { status: 200 });
}
