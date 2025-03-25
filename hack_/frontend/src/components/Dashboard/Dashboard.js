import React, { useState, useEffect } from 'react';
import { getPatients, getAppointments } from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    recentPatients: [],
    upcomingAppointments: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, appointmentsRes] = await Promise.all([
          getPatients(),
          getAppointments()
        ]);

        const patients = patientsRes.data;
        const appointments = appointmentsRes.data;

        // Get recent patients (last 5)
        const recentPatients = patients.slice(-5);

        // Get upcoming appointments (next 5)
        const upcomingAppointments = appointments
          .filter(apt => new Date(apt.appointment_date) > new Date())
          .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
          .slice(0, 5);

        setStats({
          totalPatients: patients.length,
          totalAppointments: appointments.length,
          recentPatients,
          upcomingAppointments
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p className="stat-number">{stats.totalPatients}</p>
        </div>
        <div className="stat-card">
          <h3>Total Appointments</h3>
          <p className="stat-number">{stats.totalAppointments}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Recent Patients</h2>
          <div className="list-container">
            {stats.recentPatients.map(patient => (
              <div key={patient._id} className="list-item">
                <span>{patient.name}</span>
                <span>{new Date(patient.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Upcoming Appointments</h2>
          <div className="list-container">
            {stats.upcomingAppointments.map(appointment => (
              <div key={appointment._id} className="list-item">
                <span>{appointment.patient_name}</span>
                <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 