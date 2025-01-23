// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [vms, setVms] = useState([]);
  const [billingDetails, setBillingDetails] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/check-session`, { withCredentials: true })
      .then((response) => {
        if (!response.data.loggedIn) {
          navigate('/');
        }
      })
      .catch(() => navigate('/'));
    fetchVMs();
  }, [navigate]);

  const fetchVMs = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/vms`, { withCredentials: true })
      .then((response) => {
        const sortedVMs = response.data.sort((a, b) => a.id - b.id);
        setVms(sortedVMs);
      })
	.catch(error => console.error("Error fetching VMs:", error))
  };

  const handleLogout = async () => {
    await axios.post(`${import.meta.env.VITE_API_URL}/logout`, {}, { withCredentials: true });
    navigate('/');
  };

  const handleDelete = (vmId) => {
    axios.delete(`${import.meta.env.VITE_API_URL}/vm/${vmId}`, { withCredentials: true }).then(() => fetchVMs());
  };

  const handleStartTimer = (vmId) => {
    axios.post(`${import.meta.env.VITE_API_URL}/vm/${vmId}/start`, {}, { withCredentials: true }).then(() => fetchVMs());
  };

  const handleStopTimer = (vmId) => {
    axios.post(`${import.meta.env.VITE_API_URL}/vm/${vmId}/stop`, {}, { withCredentials: true }).then(() => fetchVMs());
  };

  const handleBillingReport = (vmId) => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/vm/${vmId}/billing`, { withCredentials: true })
      .then((response) => {
        setBillingDetails(response.data);
      });
  };

  const handleEditVM = (vmId) => {
    navigate(`/edit-vm/${vmId}`); // Navigate to Edit VM page with VM ID
  };

  const handleSnapshot = (vmId) => {
    navigate(`/vm/${vmId}/snapshots`); // Navigate to Snapshot history page with VM ID
  };

  const handleNetworks = () => {
    navigate('/networks'); // Navigate to Networks page
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <button className="create-vm-button" onClick={() => navigate('/create-vm')}>
        Create VM
      </button>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
      <button className="create-vm-button" onClick={() => navigate('/create-network')}>
  	Create Network
	</button>

      <button className="networks-button" onClick={handleNetworks}>
        Networks
      </button>
      <table className="vm-table">
        <thead>
          <tr>
            <th>VM ID</th>
            <th>Status</th>
            <th>Uptime</th>
            <th>Specifications</th>
            <th>Operating System</th> {/* Add OS column */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vms.map((vm) => (
            <tr key={vm.id}>
              <td>{vm.id}</td>
              <td>{vm.is_running ? 'Running' : 'Stopped'}</td>
              <td>{vm.uptime}</td>
              <td>RAM: {vm.ram} GB, CPU Cores: {vm.cpu_cores}, Network: {vm.network || 'N/A'}</td>
              <td>{vm.os_type}</td> {/* Display OS */}
              <td>
                <button className="action-button start" onClick={() => handleStartTimer(vm.id)}>
                  Start
                </button>
                <button className="action-button stop" onClick={() => handleStopTimer(vm.id)}>
                  Stop
                </button>
                <button className="action-button billing" onClick={() => handleBillingReport(vm.id)}>
                  Generate Billing
                </button>
                <button className="action-button delete" onClick={() => handleDelete(vm.id)}>
                  Delete
                </button>
                <button className="action-button edit" onClick={() => handleEditVM(vm.id)}>
                  Edit
                </button>
                <button className="action-button snapshot" onClick={() => handleSnapshot(vm.id)}>
                  Snapshots
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {billingDetails && (
        <div className="billing-details">
          <h3>Billing Details</h3>
          <p>VM ID: {billingDetails.vm_id}</p>
          <p>RAM: {billingDetails.ram} GB</p>
          <p>CPU Cores: {billingDetails.cpu_cores}</p>
          <p>Billing Amount: Rs {billingDetails.billing_amount.toFixed(2)}</p>
          <p>Uptime: {billingDetails.uptime}</p>
          <p>Rate: Rs {billingDetails.rate_per_minute.toFixed(2)}/minute</p>
          <p>Bill Generated Time: {billingDetails.bill_generated_time}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

