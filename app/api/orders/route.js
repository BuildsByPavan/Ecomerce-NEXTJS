import connectDB from "../../utils/config/db";
import Order from "../../utils/models/Order";
import Cart from "../../utils/models/Cart";
import { auth } from "../../auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const userId = session.user.id;
    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error(" Get Orders Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function POST() {
  try {
    await connectDB();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const userId = session.user.id;

  
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

   
    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );


    const newOrder = new Order({
      user: userId,
      items: cart.items,
      total,
    });
    await newOrder.save();

   
    cart.items = [];
    await cart.save();

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error(" Place Order Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
