import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch patient list
  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data.patients);
    } catch (error) {
      console.error(error);
    }
  };

  // Delete a patient
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this patient?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/patients/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Patient deleted successfully!");
      fetchPatients();
    } catch (error) {
      console.error(error);
      alert("Error deleting patient");
    }
  };

  return (
    <div>
      <h2>Patient List</h2>
      <Link to="/add-patient">
        <button>Add New Patient</button>
      </Link>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Medications</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient._id}>
              <td>{patient.name}</td>
              <td>{patient.age}</td>
              <td>{patient.medications}</td>
              <td>
                <Link to={`/edit-patient/${patient._id}`}>
                  <button>Edit</button>
                </Link>
                <button onClick={() => handleDelete(patient._id)}>Delete</button>
                <Link to={`/patient-details/${patient._id}`}>
                  <button>View Details</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;
