import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../APi/audioAPI";
import { fetchCurrentUser } from "./userSlice";
export const uploadAudio = createAsyncThunk(
  "audio/uploadAudio",
  async (audioData, thunkAPI) => {
    try {
      const { data } = await api.uploadAudioAPI(audioData);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);


export const fetchAllAudios = createAsyncThunk(
  "audio/fetchAllAudios",
  async ({ search = "", page = 1, limit = 6 }, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchAllAudiosAPI({ search, page, limit });
      console.log("AudiSLice data", data)
      return { audios: data.audios, totalPages: data.totalPages };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch audios"
      );
    }
  }
);

export const fetchAudio = createAsyncThunk(
  "audio/fetchAudio",
  async (audioId, { rejectWithValue }) => {
    try {
      const response = await api.fetchAudioAPI(audioId);
      console.log("Fetched audio response:", response);
      if (!response.data.success) {
        // Updated to check response.data.success
        throw new Error(response.data.message || "Failed to fetch audio");
      }
      return response.data.audio; // Return the audio object
    } catch (err) {
      console.error("Fetch audio error:", err);
      return rejectWithValue(err.message || "Failed to fetch audio");
    }
  }
);

export const toggleLike = createAsyncThunk(
  "audio/toggleLike",
  async (audioId, thunkAPI) => {
    try {
      const { data } = await api.toggleLikeAPI(audioId);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// export const toggleBookmark = createAsyncThunk(
//   "audio/toggleBookmark",
//   async (audioId, thunkAPI) => {
//     try {
//       const { data } = await api.toggleBookmarkAPI(audioId);
//       console.log("Slice toggle book", data)
//       return data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response?.data?.message);
//     }
//   }
// );

export const toggleBookmark = createAsyncThunk(
  "audio/toggleBookmark",
  async (audioId, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await api.toggleBookmarkAPI(audioId);
      console.log("Slice toggle book", data);
      // Dispatch fetchCurrentUser to update user slice asynchronously
      dispatch(fetchCurrentUser());
      return { audioId, bookmarked: data.bookmarked };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateAudioAsViewed = createAsyncThunk(
  "audio/updateAudioAsViewed",
  async (audioId, thunkAPI) => {
    try {
      const { data } = await api.updateAudioAsViewedAPI(audioId);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);


export const addComment = createAsyncThunk(
  "audio/addComment",
  async ({ audioId, content }, thunkAPI) => {
    try {
      const { data } = await api.addCommentAPI(audioId, content);
      return data.comment;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

const initialState = {
  audios: [],
  audioData: null,
  bookmarkedAudios: [],
  currentAudio: null,
  loading: false,
  error: null,
  totalPages: 1,
};

const audioSlice = createSlice({
  name: "audio",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadAudio.fulfilled, (state, action) => {
        state.loading = false;
        state.audios.unshift(action.payload.audio);
      })

      .addCase(fetchAllAudios.fulfilled, (state, action) => {
        state.audios = action.payload.audios;
        state.totalPages = action.payload.totalPages;
        state.loading = false;
      })
      .addCase(fetchAudio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAudio.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAudio = action.payload;
      })
      .addCase(fetchAudio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { audioId, liked, userId } = action.payload;
        const audio = state.currentAudio;
        if (audio?._id === audioId) {
          audio.likes = audio.likes || [];
          const alreadyLiked = audio.likes.includes(userId);
          if (liked && !alreadyLiked) audio.likes.push(userId);
          else if (!liked && alreadyLiked)
            audio.likes = audio.likes.filter((id) => id !== userId);
        }
      })
      // .addCase(toggleBookmark.fulfilled, (state, action) => {
      //   const { user, audioId } = action.payload;
      //   const audio = state.audios.find((a) => a._id === audioId);
      //   if (audio) {
      //     audio.userBookmarked = user.savedAudios.some(
      //       (entry) =>
      //         (entry.audioId._id || entry.audioId).toString() === audioId
      //     );
      //   }
      //   if (state.currentAudio?._id === audioId) {
      //     state.currentAudio.userBookmarked = user.savedAudios.some(
      //       (entry) =>
      //         (entry.audioId._id || entry.audioId).toString() === audioId
      //     );
      //   }
      // })

      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const { audioId, bookmarked } = action.payload;
        // Update bookmarkedAudios
        if (bookmarked) {
          if (!state.bookmarkedAudios.includes(audioId)) {
            state.bookmarkedAudios.push(audioId);
          }
        } else {
          state.bookmarkedAudios = state.bookmarkedAudios.filter(
            (id) => id !== audioId
          );
        }
        // Update state.audios and currentAudio for consistency
        const audio = state.audios.find((a) => a._id === audioId);
        if (audio) {
          audio.userBookmarked = bookmarked;
        }
        if (state.currentAudio?._id === audioId) {
          state.currentAudio.userBookmarked = bookmarked;
        }
      })
      .addCase(updateAudioAsViewed.fulfilled, (state, action) => {
        state.currentAudio = action.payload.audio;
      })

      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentAudio && state.currentAudio.comments) {
          state.currentAudio.comments.push(action.payload);
        }
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("audio") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("audio") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});
export const { clearError } = audioSlice.actions;
export default audioSlice.reducer;