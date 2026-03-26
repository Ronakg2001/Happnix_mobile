import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Adjust this depending on your setup
// Use 10.0.2.2 for Android emulators to connect to localhost:8000
const API_BASE_URL = 'http://192.168.29.135:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add Authorization header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`; 
      }
    } catch (e) {
      console.error('Error fetching token from SecureStore', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Auth APIs ──────────────────────────────────────────────

export const authApi = {
  loginWithPassword: (identifier: string, password: string) =>
    api.post('/api/auth/username/login', { identifier, password }),

  sendMobileOtp: (mobile: string) =>
    api.post('/api/auth/mobile/send-otp', { mobile }),

  resendMobileOtp: (mobile: string) =>
    api.post('/api/auth/mobile/resend-otp', { mobile }),

  verifyMobileOtp: (mobile: string, otp: string) =>
    api.post('/api/auth/mobile/verify-otp', { mobile, otp }),

  forgotPassword: (email: string) =>
    api.post('/api/auth/password/forgot', { email }),

  registerDetails: (data: {
    fullName: string;
    username: string;
    password: string;
    email: string;
    sex: string;
    dateOfBirth: string;
    govId?: string;
  }) => api.post('/api/signup/details', data),

  completeProfile: (data: { bio?: string; profilePictureUrl?: string; skip?: boolean }) =>
    api.post('/api/signup/profile', data),

  logout: () => api.post('/logout/'),
};

// ── Profile APIs ───────────────────────────────────────────

export const profileApi = {
  me: () => api.get('/api/profile/me'),

  sendAadhaarOtp: (aadhaarNumber: string) =>
    api.post('/api/auth/aadhaar/send-otp', { aadhaarNumber }),

  verifyAadhaarOtp: (otp: string) =>
    api.post('/api/auth/aadhaar/verify-otp', { otp }),
};

// ── Event APIs ─────────────────────────────────────────────

export const eventApi = {
  nearby: (latitude: number, longitude: number, radiusKm = 50) =>
    api.get('/api/events/nearby', { params: { latitude, longitude, radiusKm } }),

  mine: () => api.get('/api/events/mine'),

  create: (formData: FormData) =>
    api.post('/api/events/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (eventId: number) =>
    api.delete(`/api/events/${eventId}`),
};

// ── User Search API ────────────────────────────────────────

export const userApi = {
  search: (query: string, limit = 20) =>
    api.get('/api/users/search', { params: { q: query, limit } }),
};

// ── Event Categories (from manifest) ───────────────────────

export const EVENT_CATEGORIES = [
  'Fake wedding',
  'Holi party',
  'Prom night',
  'Concert',
  'Halloween',
  'Lights out',
  'New year',
  'Pool',
  'Pre Diwali',
  'Live concerts',
  'Comedy shows',
  'Dj nights',
  'House party',
  'Club parties',
  'Open mic nights',
  'Navratri',
  'Art and craft exhibitions',
  'Ladies night',
];

export default api;
