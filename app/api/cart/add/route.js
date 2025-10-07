import connectDB from "../../../utils/config/db";
import Cart from "../../../utils/models/Cart";
import { auth } from "../../../auth";

export async function POST(req) {
  await connectDB();
  const { productId } = await req.json();

  const session = await auth();

  if (!session) {
    return new Response(
      JSON.stringify({ guest: true, productId }),
      { status: 401 }
    );
  }


  const userId = session.user.id;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ product: productId, quantity: 1 });
  }

  await cart.save();
  await cart.populate("items.product");

  return new Response(JSON.stringify(cart.items), { status: 200 });
}
