import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Appointment.css';

const ScheduleAppointment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        reason: '',
        status: 'scheduled'
    });

    // Get token from localStorage
    const token = localStorage.getItem('token');
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
                // Fetch doctors
                const doctorsResponse = await axios.get('/api/users/doctors', axiosConfig);
                setDoctors(doctorsResponse.data);

                // Fetch patients
                const patientsResponse = await axios.get('/api/patients', axiosConfig);
                setPatients(patientsResponse.data);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form data
            if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time) {
                setError('Please fill in all required fields');
                return;
            }

            // Send request to create appointment
            const response = await axios.post('/api/appointments/create', formData, axiosConfig);
            
            if (response.status === 201) {
                navigate('/appointments');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to schedule appointment');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="schedule-appointment">
            <h1>Schedule Appointment</h1>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="patient_id">Patient *</label>
                    <select
                        id="patient_id"
                        name="patient_id"
                        value={formData.patient_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Patient</option>
                        {patients.map(patient => (
                            <option key={patient._id} value={patient._id}>
                                {patient.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="doctor_id">Doctor *</label>
                    <select
                        id="doctor_id"
                        name="doctor_id"
                        value={formData.doctor_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                            <option key={doctor._id} value={doctor._id}>
                                {doctor.username}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="appointment_date">Date *</label>
                    <input
                        type="date"
                        id="appointment_date"
                        name="appointment_date"
                        value={formData.appointment_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="appointment_time">Time *</label>
                    <input
                        type="time"
                        id="appointment_time"
                        name="appointment_time"
                        value={formData.appointment_time}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="reason">Reason for Visit</label>
                    <textarea
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="primary">
                        Schedule Appointment
                    </button>
                    <button type="button" onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ScheduleAppointment; 