import React, { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupUser, reset } from "../../store/Slices/userSlice";
import { toast } from "react-toastify"; // For user notifications
import { motion } from "framer-motion"; // For animations

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    gender: "",
    profileImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({}); // For client-side validation


 useEffect(() => {
   dispatch(reset());
   // Cleanup preview URL to prevent memory leaks
   return () => {
     if (preview) {
       URL.revokeObjectURL(preview);
     }
   };
 }, [dispatch, preview]);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      newErrors.email = "Valid email is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.gender) newErrors.gender = "Gender is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        // Limit to 5MB
        toast.error("Image size must be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: null }));
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    const signupData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) signupData.append(key, value);
    });

    try {
      await dispatch(signupUser(signupData)).unwrap();
      toast.success("Account created successfully!");
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        gender: "",
        profileImage: null,
      });
      setPreview(null);
      navigate("/login");
    } catch (err) {
      const errorMessage =
        err?.message || err?.error || "Failed to create account";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-cyan-500 to-teal-600 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-indigo-700 mb-6">
          🚀 Join Us Today
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 text-center font-semibold">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            error={errors.name}
          />
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="johndoe123"
            error={errors.username}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••"
            error={errors.password}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${
                errors.gender ? "border-red-500" : "border-gray-300"
              } bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 transition-colors duration-200`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture
            </label>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-gray-300 file:bg-gray-50 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
            />
            {preview && (
              <div className="mt-4 flex justify-center gap-4">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover shadow-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-red-500 hover:underline"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold shadow-md hover:from-indigo-700 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Signing Up...
              </span>
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-black"> Already have an account? </span>
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;

const Input = ({ label, type = "text", error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      {...props}
      className={`w-full p-3 rounded-lg border ${
        error ? "border-red-500" : "border-gray-300"
      } bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 transition-colors duration-200`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);