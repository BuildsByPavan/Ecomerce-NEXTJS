"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { XCircleIcon, UploadIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState({
    userId: "",
    username: "",
    email: "",
    profilePic: "",
    createdAt: "",
  });
  const [preview, setPreview] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("No file chosen");
  const [loading, setLoading] = useState(false);

  // Load user details when session changes
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const u = data.user;
            setUser({
              userId: u._id,
              username: u.username,
              email: u.email,
              profilePic: u.profilePic || "",
              createdAt: u.createdAt || "",
            });
            setPreview(u.profilePic || "");
          }
        })
        .catch((err) => console.error("Failed to fetch profile:", err));
    }
  }, [status, session]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser({ ...user, profilePic: file });
      setPreview(URL.createObjectURL(file));
      setSelectedFileName(file.name);
    } else {
      setSelectedFileName("No file chosen");
    }
  };

  const handleRemoveImage = async () => {
    if (!user.profilePic) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("removeProfilePic", "true");
      const res = await fetch("/api/user/update", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUser({ ...user, profilePic: "" });
        setPreview("");
        toast.success("Profile picture removed!");
      } else toast.error(data.error);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("email", user.email);
      if (user.profilePic instanceof File)
        formData.append("profilePic", user.profilePic);
      else if (user.profilePic === "")
        formData.append("removeProfilePic", "true");

      const res = await fetch("/api/user/update", {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setPreview(data.user.profilePic);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader size={40} />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <Toaster position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          User Profile
        </h2>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={preview || "/default-avatar.jpg"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 shadow-sm"
            />
            {preview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 hover:bg-red-50"
              >
                {loading ? (
                  <ClipLoader color="#f87171" size={18} />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                )}
              </button>
            )}
          </div>

          <div className="mt-4 w-full text-center">
            <label
              htmlFor="fileInput"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded cursor-pointer"
            >
              <UploadIcon className="w-4 h-4" />
              Upload Photo
            </label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-gray-500 text-sm mt-1 italic truncate">
              {selectedFileName}
            </p>
          </div>
        </div>

        <label className="block mb-2 font-medium text-gray-700">Username</label>
        <input
          type="text"
          name="username"
          value={user.username}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <label className="block mb-2 font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded w-full mb-6 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        {user.createdAt && (
          <div className="mb-6 text-sm text-gray-600 text-center">
            <p>
              <span className="font-medium">Active Since:</span>{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full flex justify-center items-center gap-2"
          disabled={loading}
        >
          {loading && <ClipLoader color="#fff" size={18} />}
          Update Profile
        </button>
      </form>
    </div>
  );
}
