import connectDB from "../../../utils/config/db";
import Cart from "../../../utils/models/Cart";
import { auth } from "../../../auth";

export async function POST(req) {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { items } = await req.json();
    const userId = session.user.id;

    if (!items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "Invalid items format" }), { status: 400 });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    cart.mergeItems(items);
    await cart.save();
    await cart.populate("items.product");

    return new Response(JSON.stringify({ success: true, items: cart.items }), { status: 200 });
  } catch (error) {
    console.error("Cart merge error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
