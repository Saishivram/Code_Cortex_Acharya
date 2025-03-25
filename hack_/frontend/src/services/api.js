import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
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

// Auth endpoints
export const login = (credentials) => api.post('/user/login', credentials);
export const register = (userData) => api.post('/user/register', userData);

// Patient endpoints
export const getPatients = () => api.get('/patients');
export const getPatient = (patientId) => api.get(`/patients/${patientId}`);
export const createPatient = (patientData) => api.post('/patients/add', patientData);
export const updatePatient = (patientId, patientData) => api.put(`/patients/update/${patientId}`, patientData);
export const deletePatient = (patientId) => api.delete(`/patients/delete/${patientId}`);
export const updateMedications = (patientId, medications) => api.put(`/patients/medications/${patientId}`, { medications });
export const updateAllergies = (patientId, allergies) => api.put(`/patients/allergies/${patientId}`, { allergies });
export const addMedicalHistory = (patientId, description) => api.post(`/patients/medical-history/${patientId}`, { description });

// Appointment endpoints
export const getAppointments = () => api.get('/appointments');
export const getAppointment = (appointmentId) => api.get(`/appointments/${appointmentId}`);
export const createAppointment = (appointmentData) => api.post('/appointments/create', appointmentData);
export const updateAppointment = (appointmentId, appointmentData) => api.put(`/appointments/${appointmentId}`, appointmentData);
export const deleteAppointment = (appointmentId) => api.delete(`/appointments/${appointmentId}`);

// Doctor endpoints
export const getDoctors = () => api.get('/users/doctors');

export default api;
