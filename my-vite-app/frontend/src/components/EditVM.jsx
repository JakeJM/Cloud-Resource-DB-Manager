// frontend/src/components/EditVM.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function EditVM() {
  const { vmId } = useParams();
  const [ram, setRam] = useState(1);
  const [cpuCores, setCpuCores] = useState(1);
  const [networkId, setNetworkId] = useState('');
  const [os, setOs] = useState('');
  const [networks, setNetworks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/vms/${vmId}`, { withCredentials: true }).then((response) => {
      setRam(response.data.ram);
      setCpuCores(response.data.cpu_cores);
      setNetworkId(response.data.network_id || '');  // Default to empty string if null
      setOsType(response.data.os_type || '');  // Default to empty string if null
    });

    axios.get(`${import.meta.env.VITE_API_URL}/networks`, { withCredentials: true }).then((response) => {
      setNetworks(response.data);
    });
  }, [vmId]);

const handleSave = (e) => {
  e.preventDefault()
  axios.put(`${import.meta.env.VITE_API_URL}/vm/${vmId}`, { ram, cpu_cores: cpuCores, os_type: os, network_id: networkId }, { withCredentials: true })
    .then(() => navigate('/dashboard')) // Redirect after save
    .catch(error => console.error("Error updating VM:", error))
}


  return (
    <div>
      <h2>Edit VM {vmId}</h2>
      <form onSubmit={handleSave}>
        <label>RAM (GB):</label>
        <select value={ram} onChange={(e) => setRam(Number(e.target.value))}>
          {[...Array(16).keys()].map((i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        <label>CPU Cores:</label>
        <select value={cpuCores} onChange={(e) => setCpuCores(Number(e.target.value))}>
          {[...Array(8).keys()].map((i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        <label>Network:</label>
        <select value={networkId} onChange={(e) => setNetworkId(e.target.value)}>
          <option value="">None</option>
          {networks.map((network) => (
            <option key={network.id} value={network.id}>
              {network.id} - {network.type} ({network.bandwidth} Mbps)
            </option>
          ))}
        </select>

        <label>Operating System:</label>
        <select value={os} onChange={(e) => setOs(e.target.value)}>
          <option value="">Select OS</option>
          <option value="Linux">Linux</option>
          <option value="Windows">Windows</option>
          <option value="MacOS">MacOS</option>
          <option value="Ubuntu">Ubuntu</option>
          <option value="Debian">Debian</option>
        </select>

        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default EditVM;

