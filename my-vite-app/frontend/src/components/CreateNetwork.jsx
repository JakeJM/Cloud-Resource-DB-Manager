// src/components/CreateNetwork.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateNetwork.css';


function CreateNetwork() {
  const [type, setType] = useState('2G'); // Default type
  const [bandwidth, setBandwidth] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    axios.post(`${import.meta.env.VITE_API_URL}/network`, { type, bandwidth }, { withCredentials: true })
      .then((response) => {
        console.log("Network created successfully:", response.data);
        navigate('/dashboard'); // Redirect to dashboard after creation
      })
      .catch(error => {
        console.error("Error creating network:", error);
      });
  };

  const handleCancel = () => {
    navigate('/dashboard'); // Go back to dashboard without saving
  };

  return (
    <div>
      <h2>Create Network</h2>
      <form onSubmit={handleCreate}>
        <label>Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="2G">2G</option>
          <option value="3G">3G</option>
          <option value="4G">4G</option>
          <option value="5G">5G</option>
        </select>

        <label>Bandwidth (Mbps):</label>
        <input
          type="number"
          value={bandwidth}
          onChange={(e) => setBandwidth(e.target.value)}
          required
        />

        <button type="submit">Create Network</button>
        <button type="button" onClick={handleCancel} style={{ marginLeft: '10px' }}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default CreateNetwork;

