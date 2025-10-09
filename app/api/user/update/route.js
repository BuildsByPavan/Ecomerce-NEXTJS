import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import connectDB from "../../../utils/config/db";
import User from "../../../utils/models/User";

export async function PUT(req) {
  try {
    await connectDB();

    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();

    const username = formData.get("username");
    const email = formData.get("email");
    const removeProfilePic = formData.get("removeProfilePic");
    const file = formData.get("profilePic");

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }


    if (removeProfilePic === "true") {
      user.profilePic = "";
    }


    else if (file && file.name && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      user.profilePic = `data:${file.type};base64,${base64}`;
    }

    if (username) user.username = username.trim();
    if (email) user.email = email.toLowerCase().trim();

    await user.save();

    const updatedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    };

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
