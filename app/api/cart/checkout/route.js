import connectDB from "../../../utils/config/db";
import Cart from "../../../utils/models/Cart";
import Order from "../../../utils/models/Order"; 
import { auth } from "../../../auth"; 

export async function POST(req) {
  await connectDB();

  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Login required" }), { status: 401 });
  }

  const userId = session.user.id;

  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return new Response(JSON.stringify({ error: "Cart is empty" }), { status: 400 });
  }

  const order = new Order({
    user: userId,
    items: cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    })),
    total: cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ),
  });

  await order.save();

 
  cart.items = [];
  await cart.save();

  return new Response(
    JSON.stringify({ message: "Order placed successfully" }),
    { status: 200 }
  );
}
