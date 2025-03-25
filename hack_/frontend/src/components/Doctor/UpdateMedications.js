import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const UpdateMedications = () => {
  const { id } = useParams();
  const [medications, setMedications] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/patients/update-medications/${id}`, { medications }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Medications updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Error updating medications");
    }
  };

  return (
    <div>
      <h2>Update Medications</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          name="medications"
          value={medications}
          onChange={(e) => setMedications(e.target.value)}
          placeholder="Enter medications"
        />
        <button type="submit">Update Medications</button>
      </form>
    </div>
  );
};

export default UpdateMedications;
