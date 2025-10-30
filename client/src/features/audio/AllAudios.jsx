import React from "react";
import { fetchAllAudios } from "../../store/Slices/audioSlice";
import ContentCardGrid from "../../components/ContentCardGrid";

export default function AllAudioCardGrid() {
  return (
    <ContentCardGrid
      title="🆕 All Audios"
      thunk={() => fetchAllAudios({ page: 1, limit: 6 })} // Initial call with page and limit
      selector={(state) => ({
        items: state.audio.audios || [],
        loading: state.audio.loading,
        error: state.audio.error,
        totalPages: state.audio.totalPages || 1,
      })}
    />
  );
}