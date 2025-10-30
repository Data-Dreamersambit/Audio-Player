import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addComment } from "../../store/Slices/audioSlice";

const AudioComment = ({ audioId }) => {
  const dispatch = useDispatch();
  const {
    currentAudio,
    loading,
    error: audioError,
  } = useSelector((state) => state.audio);
  const { currentUser } = useSelector((state) => state.user);
  const [commentText, setCommentText] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle comment submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await dispatch(addComment({ audioId, content: commentText })).unwrap();
      setCommentText(""); // Clear input
      setSuccessMessage("Comment posted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3s
    } catch (err) {
      console.error("Failed to add comment:", err);
      setSuccessMessage(null);
    }
  };

  // Loading state for initial audio load
  if (!currentAudio) {
    return (
      <div className="text-center text-gray-400 animate-pulse">
        Loading comments...
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700">
      {/* Comment Form */}
      <h3 className="text-lg sm:text-xl font-bold text-cyan-400 mb-3 sm:mb-4">
        Comments
      </h3>
      {audioError && (
        <div className="text-red-500 text-center text-sm sm:text-base mb-3 sm:mb-4">
          {audioError}
        </div>
      )}
      {successMessage && (
        <div className="text-green-500 text-center text-sm sm:text-base mb-3 sm:mb-4">
          {successMessage}
        </div>
      )}
      {currentUser ? (
        <form
          onSubmit={handleAddComment}
          className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 resize-none transition-all text-sm sm:text-base"
            rows={4}
            disabled={loading}
            aria-label="Write a comment"
          />
          <button
            type="submit"
            disabled={loading || !commentText.trim()}
            className="self-end px-4 sm:px-6 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-lg hover:from-indigo-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all text-sm sm:text-base"
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
          <a href="/login" className="text-cyan-400 hover:underline">
            Log in
          </a>{" "}
          to leave a comment.
        </p>
      )}

      {/* Comments List */}
      <div className="space-y-3 sm:space-y-4">
        {currentAudio?.comments && currentAudio.comments.length > 0 ? (
          currentAudio.comments.map((comment) => (
            <div
              key={comment._id}
              className="flex gap-3 sm:gap-4 items-start border-b border-gray-700 pb-3 sm:pb-4 last:border-b-0"
            >
              <img
                src={comment.author?.profileImage || "/default-avatar.png"}
                alt={comment.author?.name || "User"}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-600 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <p className="font-semibold text-white text-sm sm:text-base">
                    {comment?.author?.name || "Unknown User"}
                  </p>
                  <span className="text-xs sm:text-sm text-gray-400">
                    {new Date(comment.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-gray-200 text-sm sm:text-base break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center text-sm sm:text-base">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

export default AudioComment;