import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];
let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        if (data.success) {
          setAccessToken(data.data?.accessToken);
          processQueue(null, data.data?.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${data.data?.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          // Clear stale credentials so a reload doesn't re-fire authed
          // requests (which would 401 again and loop forever).
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch {}
          // Only bounce to /login from a non-auth page — never redirect
          // while already on an auth page, or we get a hard-reload loop.
          const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-otp', '/verify-email'];
          const onAuthPage = authPaths.some((p) => window.location.pathname.startsWith(p));
          if (!onAuthPage) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
