// components/Library.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../../store/Slices/userSlice";
import { Link } from "react-router-dom";
import {  FaRedo, FaPlayCircle } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";

const Library = () => {
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector((state) => state.user);

  // Fetch user data on mount if not loaded
  useEffect(() => {
    if (!currentUser) {
      dispatch(fetchCurrentUser()).catch(() => {
        toast.error("Failed to load library. Please try again.");
      });
    }
  }, [dispatch, currentUser]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle retry on error
  const handleRetry = () => {
    dispatch(fetchCurrentUser());
  };

  // Loading skeleton for cards
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-slate-800 rounded-lg overflow-hidden shadow-lg"
        >
          <Skeleton height={120} width="100%" />
          <div className="p-4">
            <Skeleton height={20} width="80%" className="mb-2" />
            <Skeleton height={16} width="60%" />
          </div>
        </div>
      ))}
    </div>
  );

  // Render audio card
  const renderAudioCard = (item, type) => (
    <li
      key={item._id}
      className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <Link
        to={`/audio/${item.audioId._id}`}
        className="block"
        aria-label={`View audio: ${item.audioId.title || "Untitled Audio"}`}
      >
        <div className="relative">
          <img
            src={
              item.audioId.thumbnailUrl 
            }
            alt={item.audioId.title || "Untitled Audio"}
            className="w-full h-40 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
            <FaPlayCircle className="text-white text-3xl" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold truncate">
            {item.audioId.title || "Untitled Audio"}
          </h3>
          
          <p className="text-gray-500 text-xs mt-1">
            {type === "liked" ? "Liked" : "Saved"}:{" "}
            {formatDate(type === "liked" ? item.likedAt : item.savedAt)}
          </p>
        </div>
      </Link>
    </li>
  );

  // Main render
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 lg:ml-24 pb-16 lg:pb-0">
      <div className="max-w-7xl mx-auto">
        {/* Library Heading */}
        <h1 className="text-3xl font-bold mb-8">Your Library</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-600 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-3 py-1 bg-red-700 rounded hover:bg-red-800"
              aria-label="Retry loading library"
            >
              <FaRedo />
              Retry
            </button>
          </div>
        )}

     

        {/* Loading State */}
        {loading && !currentUser ? (
          renderSkeleton()
        ) : (
          <div className="space-y-12">
            {/* Liked Audios Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Liked Audios</h2>
              {currentUser?.likedAudios?.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentUser.likedAudios.map((item) =>
                    item.audioId && typeof item.audioId === "object" ? (
                      renderAudioCard(item, "liked")
                    ) : (
                      <li
                        key={item._id}
                        className="p-4 bg-slate-700 rounded-lg text-gray-400"
                      >
                        Invalid audio data (ID: {item.audioId})
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-400">No liked audios yet.</p>
              )}
            </div>

            {/* Saved Audios Section */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Saved Audios</h2>
              {currentUser?.savedAudios?.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentUser.savedAudios.map((item) =>
                    item.audioId && typeof item.audioId === "object" ? (
                      renderAudioCard(item, "saved")
                    ) : (
                      <li
                        key={item._id}
                        className="p-4 bg-slate-700 rounded-lg text-gray-400"
                      >
                        Invalid audio data (ID: {item.audioId})
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="text-gray-400">No saved audios yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;