import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getUsers: () => api.get('/auth/users'),
};

export const taskAPI = {
  getTasks: (filters = {}) => {
    const params = new URLSearchParams();
    
    // Only add non-empty filter parameters
    if (filters.assignee && filters.assignee !== 'all') {
      params.append('assignee', filters.assignee);
    }
    if (filters.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority);
    }
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    const queryString = params.toString();
    const url = queryString ? `/tasks/get-all-tasks?${queryString}` : '/tasks/get-all-tasks';
    
    return api.get(url);
  },
  createTask: (taskData) => api.post('/tasks/create-task', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/update-task/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/delete-task/${id}`),
  moveTask: (id, status) => api.patch(`/tasks/${id}/move`, { status }),
};

export const commentAPI = {
  getComments: (taskId) => api.get(`/comments/get-comment-for-task/${taskId}`),
  createComment: (taskId, commentData) => api.post(`/comments/create-comment/${taskId}`, commentData),
  updateComment: (id, commentData) => api.put(`/comments/update-comment/${id}`, commentData),
  deleteComment: (id) => api.delete(`/comments/delete-comment/${id}`),
};

export default api;