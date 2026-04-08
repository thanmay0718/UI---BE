import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

// Pages where we should NOT auto-redirect on 401
const NO_REDIRECT_PATHS = ['/login', '/signup', '/worker/registration'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentPath = window.location.pathname;
    const isNoRedirectPage = NO_REDIRECT_PATHS.some(p => currentPath.startsWith(p));
    
    if (error.response && error.response.status === 401 && !isNoRedirectPage) {
      // Only redirect if this is NOT a background profile-check call
      const requestUrl = error.config?.url || '';
      const isSilentProfileCheck = requestUrl.includes('/auth/profile');
      
      if (!isSilentProfileCheck) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
