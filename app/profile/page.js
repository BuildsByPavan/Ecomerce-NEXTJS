"use client";

import { useState, useEffect } from "react";
import { XCircleIcon, UploadIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";

export default function ProfilePage() {
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


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser({
        userId: storedUser._id,
        username: storedUser.username,
        email: storedUser.email,
        profilePic: storedUser.profilePic || "",
        createdAt: storedUser.createdAt || "",
      });

    
      if (storedUser.profilePic?.startsWith("data:image")) {
        setPreview(storedUser.profilePic);
      } else if (storedUser.profilePic) {
        setPreview(`data:image/jpeg;base64,${storedUser.profilePic}`);
      } else {
        setPreview("");
      }
    }
  }, []);

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

  const handleRemoveImage = () => {
    if (!user.profilePic) return;

    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-800">
            Are you sure you want to remove your profile picture?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
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
                    setSelectedFileName("No file chosen");
                    localStorage.setItem("user", JSON.stringify(data.user));
                    window.dispatchEvent(new Event("userUpdated"));
                    toast.success("Profile picture removed!");
                  } else {
                    toast.error(data.error || "Failed to remove image");
                  }
                } catch (err) {
                  console.error(err);
                  toast.error("Something went wrong");
                } finally {
                  setLoading(false);
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
            >
              {loading && <ClipLoader color="#fff" size={14} />}
              Remove
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("email", user.email);

      if (user.profilePic instanceof File) {
        formData.append("profilePic", user.profilePic);
      } else if (user.profilePic === "") {
        formData.append("removeProfilePic", "true");
      }

      const res = await fetch("/api/user/update", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUser({ ...user, profilePic: data.user.profilePic });
        const updatedPreview =
          data.user.profilePic?.startsWith("data:image") ||
          data.user.profilePic?.includes("base64")
            ? data.user.profilePic
            : `data:image/jpeg;base64,${data.user.profilePic}`;
        setPreview(updatedPreview);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md transition-all"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          User Profile
        </h2>

    
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={preview || "/default-avatar.jpg"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 shadow-sm transition-transform group-hover:scale-105"
            />
            {preview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 hover:bg-red-50 transition"
                title="Remove Profile Picture"
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
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded cursor-pointer transition"
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
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full transition font-medium flex justify-center items-center gap-2"
          disabled={loading}
        >
          {loading && <ClipLoader color="#fff" size={18} />}
          Update Profile
        </button>
      </form>
    </div>
  );
}
