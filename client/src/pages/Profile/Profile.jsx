import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUserEdit,
  FaSignOutAlt,
  FaTrashAlt,
  FaUpload,
  
} from "react-icons/fa";
import {
  fetchCurrentUser,
  logoutUser,
  deleteUser,
} from "../../store/Slices/userSlice";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    currentUser,
    updateUserLoading: loading,
    error,
  } = useSelector((state) => state.user);


  // Fetch user data on component mount if not already loaded
  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, currentUser]);

  // Format the joined date
  const formatJoinDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await dispatch(deleteUser(currentUser._id)).unwrap();
        navigate("/signup");
      } catch (err) {
        console.error("Delete account failed:", err);
      }
    }
  };

  // Show loading state while fetching user data
  if (loading || (!currentUser && !error)) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  // Redirect to login if no currentUser and fetch failed (e.g., error exists)
  if (!currentUser && error) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 lg:ml-10">
      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* User Details Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={currentUser.profileImage || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-amber-400"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{currentUser.name || "N/A"}</h1>
            <p className="text-gray-400">@{currentUser.username || "N/A"}</p>
            <p className="text-gray-400">
              Joined: {formatJoinDate(currentUser.createdAt)}
            </p>
          </div>
        </div>

        {/* Account and Creator Sections */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <div className="grid grid-cols-1 gap-4">
              <Link
                to={`/update-user/${currentUser._id}`}
                className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 hover:text-amber-400 transition-all duration-300"
              >
                <FaUserEdit className="text-lg" />
                <span>Edit Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={loading}
                className={`flex items-center gap-3 p-4 bg-slate-700 rounded-lg transition-all duration-300 text-left ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-slate-600 hover:text-amber-400"
                }`}
              >
                <FaSignOutAlt className="text-lg" />
                <span>{loading ? "Logging out..." : "Logout"}</span>
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className={`flex items-center gap-3 p-4 bg-slate-700 rounded-lg transition-all duration-300 text-left ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-600 hover:text-white"
                }`}
              >
                <FaTrashAlt className="text-lg" />
                <span>{loading ? "Deleting..." : "Delete Account"}</span>
              </button>
            </div>
          </div>

          {/* Creator Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Creator</h2>
            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/upload-audio"
                className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 hover:text-amber-400 transition-all duration-300"
              >
                <FaUpload className="text-lg" />
                <span>Upload Content</span>
              </Link>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;