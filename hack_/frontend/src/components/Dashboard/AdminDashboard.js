import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const AdminDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Axios configuration with token
    const axiosConfig = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all required data
                const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
                    axios.get('/api/patients', axiosConfig),
                    axios.get('/api/users/doctors', axiosConfig),
                    axios.get('/api/appointments', axiosConfig)
                ]);

                setPatients(patientsRes.data);
                setDoctors(doctorsRes.data);
                setAppointments(appointmentsRes.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data');
                setLoading(false);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchData();
    }, [navigate]);

    const handleAddPatient = () => {
        navigate('/add-patient');
    };

    const handleScheduleAppointment = () => {
        navigate('/schedule-appointment');
    };

    const handleViewPatient = (patientId) => {
        navigate(`/patient/${patientId}`);
    };

    const handleEditPatient = (patientId) => {
        navigate(`/edit-patient/${patientId}`);
    };

    const handleDeletePatient = async (patientId) => {
        try {
            await axios.delete(`/api/patients/delete/${patientId}`, axiosConfig);
            setPatients(patients.filter(patient => patient.id !== patientId));
        } catch (err) {
            setError('Failed to delete patient');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            
            <div className="dashboard-actions">
                <button onClick={handleAddPatient} className="action-button">
                    Add New Patient
                </button>
                <button onClick={handleScheduleAppointment} className="action-button">
                    Schedule Appointment
                </button>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total Patients</h3>
                    <p>{patients.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Doctors</h3>
                    <p>{doctors.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Appointments</h3>
                    <p>{appointments.length}</p>
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Recent Patients</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Gender</th>
                                <th>Contact</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.slice(0, 5).map(patient => (
                                <tr key={patient.id}>
                                    <td>{patient.name}</td>
                                    <td>{patient.age}</td>
                                    <td>{patient.gender}</td>
                                    <td>{patient.contact_number}</td>
                                    <td>
                                        <button onClick={() => handleViewPatient(patient.id)}>
                                            View
                                        </button>
                                        <button onClick={() => handleEditPatient(patient.id)}>
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeletePatient(patient.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="dashboard-section">
                <h2>Recent Appointments</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.slice(0, 5).map(appointment => (
                                <tr key={appointment.id}>
                                    <td>{appointment.patient_name}</td>
                                    <td>{appointment.doctor_name}</td>
                                    <td>{new Date(appointment.date).toLocaleDateString()}</td>
                                    <td>{appointment.time}</td>
                                    <td>{appointment.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 