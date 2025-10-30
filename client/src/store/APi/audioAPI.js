import axios from "axios";

const BASE_URL = "http://localhost:5004/api/audios";
const axiosConfig = {
  withCredentials: true,
};

export const uploadAudioAPI = (audioData) =>
  axios.post(BASE_URL, audioData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...axiosConfig,
  });

export const fetchAllAudiosAPI = () => axios.get(BASE_URL, axiosConfig);

export const fetchAudioAPI = (audioId) =>
  axios.get(`${BASE_URL}/${audioId}`, axiosConfig);

export const toggleLikeAPI = (audioId) =>
  axios.put(`${BASE_URL}/${audioId}/like`, {}, axiosConfig);

export const toggleBookmarkAPI = (audioId) =>
  axios.put(`${BASE_URL}/${audioId}/bookmark`, {}, axiosConfig);

export const updateAudioAsViewedAPI = (audioId) =>
  axios.put(`${BASE_URL}/${audioId}/viewed`, {}, axiosConfig);


export const addCommentAPI = (audioId, content) =>
  axios.post(`${BASE_URL}/${audioId}/comment`, { content }, axiosConfig);