import express from "express";
import multer from "multer";
import storage from "../config/multerStorage.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

import {
  uploadAudio,
  getAllAudio,
  getAudioById,
  toggleLikeAudio,
  toggleBookmarkAudio,
  updateAudioAsViewed,
  addCommentToAudio,
} from "../controllers/audio/audio.controller.js";

const router = express.Router();

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
});

router.post(
  "/",
  isLoggedIn,

  upload.fields([
    { name: "thumbnailImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
    { name: "audioFile", maxCount: 1 },
  ]),
  uploadAudio
);

router.get("/", getAllAudio);
router.get("/:audioId", getAudioById);
router.put("/:audioId/like", isLoggedIn, toggleLikeAudio);
router.put("/:audioId/bookmark", isLoggedIn, toggleBookmarkAudio);
router.put("/:audioId/viewed", isLoggedIn, updateAudioAsViewed);
router.post("/:audioId/comment", isLoggedIn, addCommentToAudio);


export default router;