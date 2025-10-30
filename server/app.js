import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import Routes
import userRouter from "./routes/user.route.js";
import audioRouter from "./routes/audio.route.js";
import searchRouter from "./routes/search.route.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes path

app.use("/api/users", userRouter);
app.use("/api/audios", audioRouter);
app.use("/api/searches", searchRouter);

export default app;