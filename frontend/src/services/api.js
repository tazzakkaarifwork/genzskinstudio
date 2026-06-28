import axios from 'axios';

let backupURL = 'https://genzskinstudio.vercel.app/api';

const api = axios.create({
  baseURL: '/api', // Use relative path by default to prevent CORS issues
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle HTML/WAF responses and fallback to Vercel URL
api.interceptors.response.use(
  (response) => {
    // If the response is successful but returns HTML (Vercel WAF challenge page)
    if (response.data && typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
      // Return a special flag to trigger fallback in catch block
      return Promise.reject({
        config: response.config,
        message: 'WAF_BLOCKED',
        isWaf: true
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to HTML response or if request was blocked
    const isHtmlResponse = error.response && 
                           error.response.data && 
                           typeof error.response.data === 'string' && 
                           error.response.data.trim().startsWith('<!DOCTYPE html>');
    
    const isWaf = error.isWaf || isHtmlResponse || error.message === 'WAF_BLOCKED';

    // If it's a WAF block or network error (like CORS block) and we haven't retried yet with the backup URL
    if ((isWaf || !error.response) && originalRequest && !originalRequest._retryWithBackup) {
      originalRequest._retryWithBackup = true;
      console.warn('Request blocked or failed. Retrying with backup Vercel URL:', originalRequest.url);
      
      // Update the URL to use the backup Vercel API endpoint
      originalRequest.baseURL = backupURL;
      
      // Retry the request
      return api(originalRequest);
    }

    // Standardize error message for WAF blocks
    if (isHtmlResponse) {
      error.response.data = { error: 'Request blocked by Vercel security checkpoint' };
    }

    return Promise.reject(error);
  }
);

export default api;