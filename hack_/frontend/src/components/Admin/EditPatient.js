import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const EditPatient = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(res.data.patient);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/patients/update/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Patient updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error updating patient");
    }
  };

  return (
    <div>
      <h2>Edit Patient</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name || ""} onChange={handleChange} />
        <input type="number" name="age" value={formData.age || ""} onChange={handleChange} />
        <input type="text" name="gender" value={formData.gender || ""} onChange={handleChange} />
        <textarea name="medical_history" value={formData.medical_history || ""} onChange={handleChange}></textarea>
        <button type="submit">Update Patient</button>
      </form>
    </div>
  );
};

export default EditPatient;
