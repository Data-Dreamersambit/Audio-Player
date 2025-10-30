import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, fetchCurrentUser } from "../../store/Slices/userSlice";

function UpdateUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  // Fetch current user if not available
  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, currentUser]);

  // Handle loading state
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-gray-200">Loading user data...</div>
      </div>
    );
  }

  // Ensure the user is authenticated and can edit the requested account
  const isOwnAccount = (currentUser._id || currentUser.id) === id;
  const canEdit = isOwnAccount;

  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    username: currentUser.username || "",
    email: currentUser.email || "",
    password: "",
    gender: currentUser.gender || "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(currentUser.profileImage || null);

  // Redirect if unauthorized
  useEffect(() => {
    if (!canEdit) {
      navigate("/user-profile");
    }
  }, [canEdit, navigate]);

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        password: "",
        gender: currentUser.gender || "",
      });
      setPreview(currentUser.profileImage || null);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
        file.type
      )
    ) {
      alert("Please upload a valid image (JPEG, PNG, GIF, or WebP).");
      return;
    }
    setProfileImage(file);
    setPreview(
      file ? URL.createObjectURL(file) : currentUser?.profileImage || null
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== "" && value !== undefined) {
        updateData.append(key, value);
      }
    });
    if (profileImage) {
      updateData.append("profileImage", profileImage);
    }

    try {
      await dispatch(
        updateUser({
          userId: currentUser._id || currentUser.id,
          formData: updateData,
        })
      ).unwrap();
      navigate("/user-profile");
    } catch (err) {
      console.error("Update user error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center text-amber-400 mb-8">
          🚀 Update Your Account
        </h2>
        {error && <p className="text-red-500 text-center mb-6">{error}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full mt-2 p-3 rounded-lg border border-slate-600 bg-slate-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="JohnDoe"
              className="w-full mt-2 p-3 rounded-lg border border-slate-600 bg-slate-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
              className="w-full mt-2 p-3 rounded-lg border border-slate-600 bg-slate-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Password (leave blank to keep current)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              className="w-full mt-2 p-3 rounded-lg border border-slate-600 bg-slate-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded-lg border border-slate-600 bg-slate-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            >
              <option value="" className="bg-slate-700">
                Select Gender
              </option>
              <option value="male" className="bg-slate-700">
                Male
              </option>
              <option value="female" className="bg-slate-700">
                Female
              </option>
              <option value="other" className="bg-slate-700">
                Other
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Profile Picture
            </label>
            <input
              type="file"
              name="profileImage"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="mt-2 p-2 border border-slate-600 rounded-lg bg-slate-700 text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-400 file:text-slate-900 file:hover:bg-amber-500"
            />
            {preview && (
              <img
                src={preview}
                alt="Profile Preview"
                className="mt-2 w-24 h-24 rounded-full object-cover border-2 border-amber-400"
              />
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-400 to-teal-500 text-slate-900 font-bold shadow-md hover:from-amber-500 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
        <Link
          to="/user-profile"
          className="flex items-center justify-center gap-2 mt-6 text-gray-400 hover:text-amber-400 transition-colors duration-300"
        >
          <span>Back to Profile</span>
          <span className="text-amber-400 font-medium hover:underline hover:text-amber-500">
            Cancel
          </span>
        </Link>
      </div>
    </div>
  );
}

export default UpdateUser;