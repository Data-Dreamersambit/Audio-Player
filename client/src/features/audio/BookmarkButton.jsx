import React,{useState,useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleBookmark } from "../../store/Slices/audioSlice";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

function AudioBookmarkButton({ audioId }) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.savedAudios) {
      const bookmarked = currentUser.savedAudios.some((entry) => {
        const id = entry.audioId?._id || entry.audioId;
        return id?.toString() === audioId?.toString();
      });
      setIsBookmarked(bookmarked);
    }
  }, [currentUser, audioId]);

  const handleBookmark = async () => {
    if (!currentUser) return alert("Please log in to bookmark audios!");
    if (!audioId) return alert("Invalid audio ID");

    // Optimistic update
    setIsBookmarked((prev) => !prev);
    setLocalLoading(true);

    try {
      await dispatch(toggleBookmark(audioId)).unwrap();
    } catch {
      setIsBookmarked((prev) => !prev); // revert on fail
      alert("Failed to toggle bookmark.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={!audioId || localLoading}
      className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
        isBookmarked ? "text-amber-400" : "text-gray-400 hover:text-amber-400"
      }`}
    >
      {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
      <span className="hidden sm:inline text-xs sm:text-sm font-medium">
        {isBookmarked ? "Saved" : "Save"}
      </span>
    </button>
  );
}


export default AudioBookmarkButton;