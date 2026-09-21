import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = axios.create({ baseURL: API_BASE });

export const getParticipants = () => api.get('/participants');
export const addParticipants = (names) => api.post('/participants', { names });
export const uploadParticipants = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/participants/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const spinWheel = () => api.post('/participants/spin');
export const removeParticipant = (id) => api.delete(`/participants/${id}`);
export const resetAll = () => api.delete('/participants');
