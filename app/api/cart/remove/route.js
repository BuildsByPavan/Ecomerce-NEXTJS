import connectDB from "../../../utils/config/db";
import Cart from "../../../utils/models/Cart";
import { auth } from "../../../auth";

export async function POST(req) {
  await connectDB();

  const session = await auth();
  const { productId } = await req.json();

  if (!session) {
    return new Response(JSON.stringify({ message: "Not logged in" }), {
      status: 401,
    });
  }

  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart) {
    return new Response(JSON.stringify({ items: [] }), { status: 200 });
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate("items.product");

  return new Response(JSON.stringify({ items: populatedCart.items }), {
    status: 200,
  });
}
