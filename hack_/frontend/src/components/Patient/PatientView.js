import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Patient.css';

function PatientView() {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientRes, appointmentsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/patients/${id}`),
                    axios.get(`http://localhost:5000/api/appointments`)
                ]);

                setPatient(patientRes.data);
                setAppointments(appointmentsRes.data.filter(apt => apt.patient_id === id));
                setLoading(false);
            } catch (err) {
                setError('Error fetching patient data');
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!patient) return <div>Patient not found</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Patient Details</h1>
                <div>
                    <Link to="/dashboard" className="btn btn-secondary me-2">Back to Dashboard</Link>
                    <Link to={`/edit-patient/${id}`} className="btn btn-primary">Edit Patient</Link>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h3 className="card-title">Personal Information</h3>
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <th>Name:</th>
                                        <td>{patient.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Age:</th>
                                        <td>{patient.age}</td>
                                    </tr>
                                    <tr>
                                        <th>Gender:</th>
                                        <td>{patient.gender}</td>
                                    </tr>
                                    <tr>
                                        <th>Contact:</th>
                                        <td>{patient.contact}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h3 className="card-title mb-0">Appointments</h3>
                                <Link to="/schedule-appointment" className="btn btn-primary btn-sm">
                                    Schedule Appointment
                                </Link>
                            </div>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map(apt => (
                                            <tr key={apt._id}>
                                                <td>{apt.date}</td>
                                                <td>{apt.time}</td>
                                                <td>{apt.reason}</td>
                                                <td>{apt.status}</td>
                                            </tr>
                                        ))}
                                        {appointments.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center">No appointments found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientView; 