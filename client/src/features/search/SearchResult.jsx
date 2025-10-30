import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaPlay, FaPause } from "react-icons/fa";
import { fetchAllAudios } from "../../store/Slices/audioSlice";

const SearchResults = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { audios, loading, error, totalPages } = useSelector(
    (state) => state.audio
  );
  
  const [playingAudio, setPlayingAudio] = useState(null);
  const [page, setPage] = useState(1);

  // Parse query parameter
  const query = new URLSearchParams(location.search);
  const searchTerm = query.get("q") || "";

  // Fetch search results
  useEffect(() => {
    if (searchTerm.trim()) {
      dispatch(fetchAllAudios({ search: searchTerm, page, limit: 6 }))
        .unwrap()
        .catch((err) => console.error("Fetch audios error:", err));
    }
  }, [dispatch, searchTerm, page]);

  // Handle audio play/pause
  const togglePlay = (audioId, audioUrl) => {
    if (playingAudio?.id === audioId) {
      playingAudio.audio.pause();
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        playingAudio.audio.pause();
      }
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => console.error("Audio playback error:", err));
      setPlayingAudio({ id: audioId, audio });
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (playingAudio) {
        playingAudio.audio.pause();
      }
    };
  }, [playingAudio]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-gray-100 text-center mb-12"
        >
          Search Results for "{searchTerm}"
        </motion.h2>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                baseColor="#1e293b"
                highlightColor="#334155"
                height={300}
                className="rounded-2xl"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/50 border-l-4 border-red-600 text-red-200 p-4 rounded-lg shadow-sm mb-12"
          >
            <p className="font-medium">Error: {error}</p>
          </motion.div>
        )}

        {/* Search Results: Audios */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-100 mb-6">Audios</h3>
          <AnimatePresence>
            {audios?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {audios.map((audio) => (
                  <motion.div
                    key={audio._id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <Link to={`/audio/${audio._id}`} className="block">
                      <div className="relative">
                        <img
                          src={
                            audio.thumbnailUrl ||
                            "https://via.placeholder.com/300x150?text=Audio"
                          }
                          alt={audio.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h4 className="text-lg font-semibold text-gray-100 truncate">
                          {audio.title}
                        </h4>
                        <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                          {audio.description || "No description available."}
                        </p>
                        <div className="mt-4 space-y-2 text-sm text-gray-400">
                          <p>
                            <span className="font-medium">Category:</span>{" "}
                            {audio.category || "Uncategorized"}
                          </p>
                          <p>
                            <span className="font-medium">Tags:</span>{" "}
                            {audio.tags?.join(", ") || "None"}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                          <p>Views: {audio.viewCount || 0}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="absolute bottom-4 right-4">
                      <button
                        onClick={() => togglePlay(audio._id, audio.audioUrl)}
                        className="bg-amber-400 text-slate-900 rounded-full p-3 hover:bg-amber-500 transition-colors duration-200"
                        aria-label={
                          playingAudio?.id === audio._id
                            ? "Pause audio"
                            : "Play audio"
                        }
                      >
                        {playingAudio?.id === audio._id ? (
                          <FaPause className="w-5 h-5" />
                        ) : (
                          <FaPlay className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-center text-lg py-8"
              >
                No audios found.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {!loading && audios?.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="py-2 px-4 rounded-lg bg-amber-400 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-500 transition-colors duration-200"
            >
              Previous
            </button>
            <span className="text-gray-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="py-2 px-4 rounded-lg bg-amber-400 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-500 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;