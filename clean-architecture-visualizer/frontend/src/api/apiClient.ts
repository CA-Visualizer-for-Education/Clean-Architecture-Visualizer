import axios from 'axios';

const apiClient = axios.create({
  // biome-ignore lint/style/useNamingConvention: axios defines baseURL
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
