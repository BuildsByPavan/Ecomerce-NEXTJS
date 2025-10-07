import connectDB from "../../utils/config/db";
import Cart from "../../utils/models/Cart";
import { auth } from "../../auth";

export async function GET(req) {
  await connectDB();

  const session = await auth();

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let cart = await Cart.findOne({ user: session.user.id }).populate("items.product");

  if (!cart) {
    cart = new Cart({ user: session.user.id, items: [] });
    await cart.save();
    return new Response(JSON.stringify([]), { status: 200 });
  }

  return new Response(JSON.stringify(cart.items), { status: 200 });
}
