import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthLayout from "./AppAuthLayout";
import MainLayout from "./AppMainLayout";

import Login from "./pages/Register/Login";
import Signup from "./pages/Register/Signup";
import Home from "./pages/home/Home";
import UploadAudio from "./features/audio/UploadAudio";
import AudioPlayer from "./features/audio/AudioPlayer";
import AllAudios from "./features/audio/AllAudios"
import Explore from "./pages/explore/Explore";
import UserProfile from "./pages/Profile/Profile";
import Library from "./pages/Library/Library";
import UpdateUser from "./pages/Profile/UpdateProfile";
import SearchResults from "./features/search/SearchResult";

export default function AppRoutes() {
  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* MAIN APP ROUTES */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/library" element={<Library />} />
        <Route path="/update-user/:id" element={<UpdateUser />} />
        <Route path="/upload-audio" element={<UploadAudio />} />
        <Route path="/all-audios" element={<AllAudios />} />
        <Route path="/audio/:id" element={<AudioPlayer />} />

        <Route path="/search" element={<SearchResults />} />
      </Route>
    </Routes>
  );
}