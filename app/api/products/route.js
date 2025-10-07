import { NextResponse } from "next/server";
import  connectDB  from "../../utils/config/db"
import Product from "../../utils/models/Product";

export async function GET() {
  await connectDB();
  const products = await Product.find({});
  return NextResponse.json(products);
}

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const product = await Product.create(body);
  return NextResponse.json(product);
}
