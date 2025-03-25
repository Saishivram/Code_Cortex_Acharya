import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function DoctorDashboard() {
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, appointmentsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/patients'),
                    axios.get('http://localhost:5000/api/appointments')
                ]);

                setPatients(patientsRes.data);
                setAppointments(appointmentsRes.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const todayAppointments = appointments.filter(apt => {
        const today = new Date().toISOString().split('T')[0];
        return apt.date === today;
    });

    return (
        <div className="container mt-4">
            <h1>Doctor Dashboard</h1>
            
            <div className="row mt-4">
                <div className="col-md-4">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h5 className="card-title">Total Patients</h5>
                            <h2>{patients.length}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <h5 className="card-title">Today's Appointments</h5>
                            <h2>{todayAppointments.length}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <h5 className="card-title">Total Appointments</h5>
                            <h2>{appointments.length}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3>Recent Patients</h3>
                        <Link to="/add-patient" className="btn btn-primary">Add Patient</Link>
                    </div>
                    <div className="table-responsive mt-3">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Age</th>
                                    <th>Gender</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.slice(0, 5).map(patient => (
                                    <tr key={patient._id}>
                                        <td>{patient.name}</td>
                                        <td>{patient.age}</td>
                                        <td>{patient.gender}</td>
                                        <td>
                                            <Link to={`/patient/${patient._id}`} className="btn btn-sm btn-info me-2">View</Link>
                                            <Link to={`/edit-patient/${patient._id}`} className="btn btn-sm btn-warning">Edit</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3>Today's Appointments</h3>
                        <Link to="/schedule-appointment" className="btn btn-primary">Schedule Appointment</Link>
                    </div>
                    <div className="table-responsive mt-3">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Time</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayAppointments.map(apt => {
                                    const patient = patients.find(p => p._id === apt.patient_id);
                                    return (
                                        <tr key={apt._id}>
                                            <td>{patient ? patient.name : 'Unknown'}</td>
                                            <td>{apt.time}</td>
                                            <td>{apt.reason}</td>
                                            <td>{apt.status}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboard; 