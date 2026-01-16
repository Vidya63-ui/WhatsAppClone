import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track if we're checking auth to prevent redirect loops
let isCheckingAuth = false

export const setCheckingAuth = (value) => {
  isCheckingAuth = value
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're checking auth or already on auth pages
      const currentPath = window.location.pathname
      const isAuthPage = currentPath === '/login' || currentPath === '/register'
      
      if (!isCheckingAuth && !isAuthPage && !window.isRedirecting) {
        window.isRedirecting = true
        setTimeout(() => {
          window.location.href = '/login'
          window.isRedirecting = false
        }, 100)
      }
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
  logout: () => api.get('/user/logout'),
  getMe: () => api.get('/user/me'),
  getChatList: () => api.get('/user/chatlist'),
  searchUserByEmail: (email) => api.get(`/user/search?email=${encodeURIComponent(email)}`),
}

export const contactAPI = {
  getContacts: () => api.get('/contact'),
  createContact: (data) => api.post('/contact', data),
  updateContact: (id, data) => api.put(`/contact/${id}`, data),
  deleteContact: (id) => api.delete(`/contact/${id}`),
  getContact: (id) => api.get(`/contact/${id}`),
}

export const messageAPI = {
  getMessages: (userId, page = 1) => api.get(`/massage/${userId}?page=${page}`),
  sendMessage: (userId, message) => api.post(`/massage/${userId}`, { message }),
  updateMessage: (messageId, message) => api.put(`/massage/${messageId}`, { message }),
  deleteMessage: (messageId) => api.delete(`/massage/${messageId}`),
  markAsRead: (userId) => api.patch(`/massage/${userId}/read`),
}
