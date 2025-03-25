import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState({});

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatient(res.data.patient);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Patient Details</h2>
      <p>Name: {patient.name}</p>
      <p>Age: {patient.age}</p>
      <p>Medical History: {patient.medical_history}</p>
      <p>Medications: {patient.medications}</p>
    </div>
  );
};

export default PatientDetails;
