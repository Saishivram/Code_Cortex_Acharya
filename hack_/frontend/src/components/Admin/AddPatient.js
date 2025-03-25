import React, { useState } from "react";
import axios from "axios";

const AddPatient = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    contact_info: "",
    medical_history: "",
    medications: "",
    allergies: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/patients/add", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Patient added successfully!");
    } catch (error) {
      console.error(error);
      alert("Error adding patient");
    }
  };

  return (
    <div>
      <h2>Add New Patient</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" onChange={handleChange} required />
        <input type="text" name="gender" placeholder="Gender" onChange={handleChange} required />
        <input type="text" name="contact_info" placeholder="Contact Info" onChange={handleChange} required />
        <textarea name="medical_history" placeholder="Medical History" onChange={handleChange}></textarea>
        <textarea name="medications" placeholder="Medications" onChange={handleChange}></textarea>
        <textarea name="allergies" placeholder="Allergies" onChange={handleChange}></textarea>
        <button type="submit">Add Patient</button>
      </form>
    </div>
  );
};

export default AddPatient;
