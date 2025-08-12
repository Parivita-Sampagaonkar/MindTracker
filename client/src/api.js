import axios from 'axios';

// If you set a "proxy" in package.json to "http://127.0.0.1:5000",
// you can omit the host here and just use "/mood", etc.
const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

export const analyzeMood = (entry) =>
  API.post('/mood', { entry });

export const getRecommendations = ({ mood, habits }) =>
  API.post('/recommend', { mood, habits });

export const saveEntry = (entry) =>
    API.post('/entry', { entry });
  
export const getHistory = () =>
    API.get('/entries');

export const getPrompt = (mood) =>
    API.post('/prompt', { mood });

export const getPromptHistory = () =>
    API.get('/prompt-history');
  
export const sendFeedback = (promptId, feedback) =>
    API.post('/feedback', { prompt_id: promptId, feedback });
  
export const getLastPrompt = () =>
    API.get('/last-prompt');