import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: BASE_URL,
});

export const fetchUser = (id) => api.get(`/user/${id}`);
export const fetchPositions = (id) => api.get(`/user/${id}/positions`);
export const fetchLessons = (id) => api.get(`/user/${id}/lessons`);
export const deposit = (id, amount) => api.post(`/user/${id}/deposit`, { amount });
export const buyTrade = (data) => api.post('/trade/buy', data);
export const sellTrade = (data) => api.post('/trade/sell', data);
export const fetchQuote = (symbol) => api.get(`/quote/${symbol}`);
export const fetchOptions = (symbol) => api.get(`/options/${symbol}`);
export const completeLesson = (userId, lessonId, xpGained) => 
  api.post(`/user/${userId}/lessons/complete`, { lessonId, xpGained });

export const resetPortfolio = (id) => api.post(`/user/${id}/reset-portfolio`);

export default api;
