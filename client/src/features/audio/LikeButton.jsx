import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleLike } from "../../store/Slices/audioSlice";
import { FaHeart, FaRegHeart } from "react-icons/fa";

function LikeButton({ audioId }) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { currentAudio } = useSelector((state) => state.audio);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (currentAudio && currentUser) {
      const isLiked = currentAudio.likes?.includes(currentUser._id);
      setLiked(isLiked);
      setLikesCount(currentAudio.likes?.length || 0);
    }
  }, [currentAudio, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return alert("Please log in to like audio.");
    if (!audioId) return alert("Invalid audio ID.");

    // Optimistic update
    setLiked((prev) => !prev);
    setLikesCount((prev) => prev + (liked ? -1 : 1));
    setLocalLoading(true);

    try {
      await dispatch(toggleLike(audioId)).unwrap();
    } catch {
      // Revert if failed
      setLiked((prev) => !prev);
      setLikesCount((prev) => prev + (liked ? 1 : -1));
      alert("Failed to toggle like.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={!audioId || localLoading}
      className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
        liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
      }`}
    >
      {liked ? <FaHeart /> : <FaRegHeart />}
      <span className="hidden sm:inline text-xs sm:text-sm font-medium">
        {likesCount} Likes
      </span>
    </button>
  );
}


export default LikeButton;