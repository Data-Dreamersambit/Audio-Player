import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaComment,
} from "react-icons/fa";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import AudioComment from "./AudioComment";
import { fetchAudio, updateAudioAsViewed } from "../../store/Slices/audioSlice";

export default function AudioPlayer() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { loading, currentAudio, error } = useSelector((state) => state.audio);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [toggleComment, setToggleComment] = useState(false);

  useEffect(() => {
    if (id) {
      setIsInitialLoading(true);

      dispatch(fetchAudio(id)).finally(() => setIsInitialLoading(false));
       dispatch(updateAudioAsViewed(id)).unwrap();

    }
  }, [id, dispatch]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((err) => console.error("Playback failed:", err));
    }
    setIsPlaying((prev) => !prev);
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    setProgress((current / duration) * 100);
  };

  const onLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
    audioRef.current.volume = volume;
    audioRef.current.playbackRate = playbackRate;
  };

  const handleSeek = (e) => {
    const { value } = e.target;
    if (!audioRef.current) return;
    audioRef.current.currentTime = (value / 100) * duration;
    setProgress(value);
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      audioRef.current.currentTime - 10
    );
    setProgress((audioRef.current.currentTime / duration) * 100);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      duration,
      audioRef.current.currentTime + 10
    );
    setProgress((audioRef.current.currentTime / duration) * 100);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (!audioRef.current) return;
    audioRef.current.volume = newVolume;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (volume > 0) {
      setVolume(0);
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = volume || 1;
      setVolume(volume || 1);
    }
  };

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    setPlaybackRate(newRate);
    if (!audioRef.current) return;
    audioRef.current.playbackRate = newRate;
  };

  const toggleCommentHandle = () => {
    setToggleComment((prev) => !prev);
  };

  const formatTime = (sec = 0) => {
    const minutes = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-4xl mx-auto w-full">
        <Skeleton
          height={200}
          className="rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300"
        />
        <Skeleton height={24} width="60%" className="rounded-lg" />
        <Skeleton height={16} width="40%" className="rounded-lg" />
        <Skeleton height={40} width="100%" className="rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 sm:p-6 max-w-4xl mx-auto w-full bg-red-200 border-l-4 border-red-700 text-red-900 rounded-lg shadow-md"
      >
        <p className="font-medium text-center">Error: {error}</p>
      </motion.div>
    );
  }

  if (!currentAudio) return null;

  return (
    <div className="min-h-screen  bg-gradient-to-br from-slate-800  to-gray-900 py-6 px-4 sm:px-6 lg:px-8 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Cover / Thumbnail */}
        <div className="relative h-48 sm:h-64 md:h-80 bg-gray-700">
          <img
            src={currentAudio.thumbnailUrl}
            alt={currentAudio.title}
            className="object-cover w-full h-full rounded-t-2xl"
            loading="lazy"
          />
        </div>

        {/* Details & Controls */}
        <div className="p-4 sm:p-6 md:p-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2">
            {currentAudio.title}
          </h1>
          {/*  Action Buttons */}
          <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <p>
                <span className=" text-gray-400 font-medium">Views:</span>{" "}
                <span className=" text-gray-400 font-medium">
                  {currentAudio.viewCount || 0}
                </span>{" "}
              </p>
              <LikeButton audioId={currentAudio._id} />
              <BookmarkButton audioId={currentAudio._id} />

              <motion.button
                onClick={toggleCommentHandle}
                aria-label={toggleComment ? "Hide comments" : "Show comments"}
                className="flex items-center gap-1 text-white hover:text-yellow-600 transition-all duration-200 p-2 rounded-full hover:bg-white/10"
                whileTap={{ scale: 0.95 }}
              >
                <FaComment className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline text-xs sm:text-sm font-medium">
                  Comments
                </span>
              </motion.button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-full cursor-pointer accent-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600"
              aria-label="Seek audio"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-2">
              <span>{formatTime((progress / 100) * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
            {/* Playback Controls */}
            <div className="flex items-center justify-between w-full sm:w-2/3 gap-1 sm:gap-2">
              <button
                onClick={skipBackward}
                aria-label="Skip backward 10 seconds"
                className="flex items-center gap-1 text-white hover:text-yellow-600 transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              >
                <span className="text-xs sm:text-sm font-medium">10s</span>
                <FaBackward className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
                className="bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white rounded-full p-3 sm:p-4 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isPlaying ? (
                  <FaPause className="w-6 h-6 sm:w-7 sm:h-7" />
                ) : (
                  <FaPlay className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
              </button>
              <button
                onClick={skipForward}
                aria-label="Skip forward 10 seconds"
                className="flex items-center gap-1 text-white hover:text-yellow-600 transition-all duration-200 p-2 rounded-full hover:bg-white/10"
              >
                <FaForward className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm font-medium">10s</span>
              </button>
            </div>
            {/* Volume and Playback Speed */}
            <div className="flex items-center justify-between w-full sm:w-1/3 gap-1 sm:gap-2 sm:justify-end">
              <div className="flex items-center gap-1">
                <select
                  value={playbackRate}
                  onChange={handlePlaybackRateChange}
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg p-2 text-xs sm:text-sm focus:ring-yellow-600 focus:border-yellow-600 cursor-pointer"
                  aria-label="Playback speed"
                >
                  <option value="0.5">0.5x</option>
                  <option value="1">1x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={toggleMute}
                  aria-label={volume === 0 ? "Unmute audio" : "Mute audio"}
                  className="text-white hover:text-yellow-600 transition-all duration-200 p-2 rounded-full hover:bg-white/10"
                >
                  {volume === 0 ? (
                    <FaVolumeMute className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <FaVolumeUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-2 bg-gray-700 rounded-full cursor-pointer accent-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  aria-label="Adjust volume"
                />
              </div>
            </div>
          </div>

          {/* Conditionally Render AudioComment */}
          {toggleComment && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0, ease: "easeOut" }}
              className="mt-4"
            >
              <AudioComment audioId={currentAudio._id} />
            </motion.div>
          )}

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={currentAudio.audioUrl}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
        </div>
      </motion.div>
    </div>
  );
}