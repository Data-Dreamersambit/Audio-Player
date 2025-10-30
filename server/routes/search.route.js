// routes/search.js
import express from "express";
import { searchAllContent } from "../controllers/search/search.controller.js";

const router = express.Router();

router.get("/search", searchAllContent);

export default router;