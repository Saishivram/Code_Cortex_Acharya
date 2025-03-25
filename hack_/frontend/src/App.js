import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PrivateRoute from './components/Auth/PrivateRoute';
import PatientView from './components/Patient/PatientView';
import AddPatient from './components/Patient/AddPatient';
import EditPatient from './components/Patient/EditPatient';
import ScheduleAppointment from './components/Appointment/ScheduleAppointment';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <DoctorDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DoctorDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/add-patient" element={
            <PrivateRoute>
              <AddPatient />
            </PrivateRoute>
          } />
          
          <Route path="/schedule-appointment" element={
            <PrivateRoute>
              <ScheduleAppointment />
            </PrivateRoute>
          } />
          
          <Route path="/patient/:id" element={
            <PrivateRoute>
              <PatientView />
            </PrivateRoute>
          } />
          
          <Route path="/edit-patient/:id" element={
            <PrivateRoute>
              <EditPatient />
            </PrivateRoute>
          } />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
