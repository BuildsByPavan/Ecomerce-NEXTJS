// app/api/user/update/route.js
import { NextResponse } from "next/server";
import { auth } from "../../../auth"; // Import auth from your auth config
import connectDB from "../../../utils/config/db";
import User from "../../../utils/models/User";

export async function PUT(req) {
  try {
    await connectDB();
    
    // Get the session using auth() - this is the new v5 way
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const username = formData.get("username");
    const email = formData.get("email");
    const file = formData.get("profilePic");
    const removeProfilePic = formData.get("removeProfilePic");

    // Use session user ID
    const userId = session.user.id;
    console.log("Updating user from session:", userId);

    // Debug: log all form data
    console.log("=== FORM DATA RECEIVED ===");
    for (let [key, value] of formData.entries()) {
      if (key === 'profilePic' && value instanceof File) {
        console.log(`${key}:`, value.name, value.type, value.size);
      } else {
        console.log(`${key}:`, value);
      }
    }

    // Find user by ID from session
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let profilePic = user.profilePic;

    // Remove profile picture if requested
    if (removeProfilePic === "true") {
      profilePic = "";
    }
    // Handle new file upload
    else if (file && file.size > 0) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: "Only image files are allowed" },
          { status: 400 }
        );
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "File size must be less than 5MB" },
          { status: 400 }
        );
      }

      // Convert File to Base64 string
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      profilePic = `data:${file.type};base64,${base64}`;
    }

    // Check if username already exists (excluding current user)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ 
        username: username.trim(), 
        _id: { $ne: userId } 
      });
      if (existingUsername) {
        return NextResponse.json(
          { success: false, error: "Username already exists" },
          { status: 400 }
        );
      }
    }

    // Check if email already exists (excluding current user)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: userId } 
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Update user fields
    if (username) user.username = username.trim();
    if (email) user.email = email.toLowerCase().trim();
    user.profilePic = profilePic;

    await user.save();

    // Return user data without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({ 
      success: true, 
      user: userResponse 
    });
    
  } catch (err) {
    console.error("Profile update error:", err);
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return NextResponse.json(
        { success: false, error: `${field} already exists` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}