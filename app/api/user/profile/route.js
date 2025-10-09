import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import connectDB from "../../../utils/config/db";
import User from "../../../utils/models/User";

export async function GET() {
  await connectDB();
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(session.user.id).select("-password");
  if (!user)
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true, user });
}
