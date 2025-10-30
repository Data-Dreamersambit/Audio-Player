import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { uploadAudio } from "../../store/Slices/audioSlice";

const UploadAudio = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.audio);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    tags: [],
  });
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tags") {
      // Convert comma-separated tags to an array
      const tagsArray = value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      setFormData((prev) => ({ ...prev, tags: tagsArray }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle thumbnail image selection and preview
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnailImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.title || !thumbnailImage || !audioFile) {
      toast.error("Title, thumbnail, and audio file are required");
      return;
    }

    // Create FormData object
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("tags", formData.tags.join(",")); // Convert tags array to comma-separated string
    formDataToSend.append("thumbnailImage", thumbnailImage);
    formDataToSend.append("audioFile", audioFile);

    try {
      const result = await dispatch(uploadAudio(formDataToSend)).unwrap();
      if (result.success) {
        toast.success(result.message);
        // Reset form
        setFormData({ title: "", category: "", description: "", tags: [] });
        setThumbnailImage(null);
        setAudioFile(null);
        setThumbnailPreview(null);
      }
    } catch (err) {
      toast.error(err || "Failed to upload audio");
    }
  };

  // Display error toast if error exists
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Upload Your Audio
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Audio Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Audio Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                placeholder="Enter audio title"
                required
                onChange={handleChange}
                aria-label="Audio title"
                className="w-full p-3 border border-gray-600 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition duration-200"
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                placeholder="Enter category (e.g.Personal Development)"
                onChange={handleChange}
                aria-label="Audio category"
                className="w-full p-3 border border-gray-600 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition duration-200"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              placeholder="Describe your audio"
              onChange={handleChange}
              aria-label="Audio description"
              className="w-full p-3 border border-gray-600 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition duration-200 h-32 resize-none"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags.join(", ")}
              placeholder="Tags (comma separated, e.g., feeling, emotions)"
              onChange={handleChange}
              aria-label="Audio tags"
              className="w-full p-3 border border-gray-600 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition duration-200"
            />
            {formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-amber-300 bg-slate-600 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          tags: prev.tags.filter((_, i) => i !== index),
                        }))
                      }
                      className="ml-1 text-amber-300 hover:text-amber-400 focus:outline-none"
                      aria-label={`Remove tag ${tag}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* File Uploads */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="thumbnailImage"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Thumbnail Image
              </label>
              <input
                type="file"
                id="thumbnailImage"
                accept="image/*"
                onChange={handleThumbnailChange}
                required
                aria-label="Upload thumbnail image"
                className="w-full p-3 border border-gray-600 rounded-lg bg-slate-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 transition duration-200"
              />
              {thumbnailPreview && (
                <div className="mt-4">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-32 w-32 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
              {thumbnailImage && (
                <p className="mt-1 text-sm text-gray-400">
                  Selected: {thumbnailImage.name}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="audioFile"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Audio File
              </label>
              <input
                type="file"
                id="audioFile"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0])}
                required
                aria-label="Upload audio file"
                className="w-full p-3 border border-gray-600 rounded-lg bg-slate-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 transition duration-200"
              />
              {audioFile && (
                <p className="mt-1 text-sm text-gray-400">
                  Selected: {audioFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition duration-200 ${
              loading
                ? "bg-amber-700 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-500"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                Uploading...
              </div>
            ) : (
              "Upload Audio"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadAudio;