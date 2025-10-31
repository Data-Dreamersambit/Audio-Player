import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/mongoDB.js";

// Import Routes
import userRouter from "./routes/user.route.js";
import audioRouter from "./routes/audio.route.js";
import searchRouter from "./routes/search.route.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
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

// API Routes
app.use("/api/users", userRouter);
app.use("/api/audios", audioRouter);
app.use("/api/searches", searchRouter);

// Serve frontend (Vite build)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/client/dist")));

app.get(/.*/, (_, res) => {
  res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
});


// Start server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}!`);
});
