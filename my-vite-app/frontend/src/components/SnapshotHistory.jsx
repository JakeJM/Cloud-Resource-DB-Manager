// frontend/src/components/SnapshotHistory.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'

function SnapshotHistory() {
  const { vmId } = useParams() // Extract VM ID from URL
  const navigate = useNavigate()
  const [snapshots, setSnapshots] = useState([])

  // Fetch snapshots when the component is mounted or vmId changes
  useEffect(() => {
    fetchSnapshots()
  }, [vmId])

  // Function to fetch snapshots from the backend
  const fetchSnapshots = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/vm/${vmId}/snapshots`, { withCredentials: true })
      .then(response => setSnapshots(response.data))
      .catch(error => console.error("Error fetching snapshots:", error))
  }

  // Function to create a new snapshot
  const handleCreateSnapshot = () => {
    axios.post(`${import.meta.env.VITE_API_URL}/vm/${vmId}/snapshot`, {}, { withCredentials: true })
      .then(() => fetchSnapshots()) // Refresh snapshots after creating one
      .catch(error => console.error("Error creating snapshot:", error))
  }

  // Function to revert to a specific snapshot
  const handleRevertSnapshot = (snapshotId) => {
    axios.post(`${import.meta.env.VITE_API_URL}/vm/${vmId}/snapshot/${snapshotId}/revert`, {}, { withCredentials: true })
      .then(() => navigate('/dashboard')) // Navigate to dashboard after reverting snapshot
      .catch(error => console.error("Error reverting snapshot:", error))
  }

  // Function to navigate back to the dashboard without making changes
  const handleCancel = () => {
    navigate('/dashboard') // Go back to dashboard without making any changes
  }

  return (
    <div>
      <h2>Snapshots for VM {vmId}</h2>
      {/* Button to create a snapshot */}
      <button onClick={handleCreateSnapshot}>Create Snapshot</button>
      <button onClick={handleCancel} style={{ marginLeft: '10px' }}>Cancel</button>

      {/* Snapshot Table */}
      <table className="snapshot-table">
        <thead>
          <tr>
            <th>Snapshot ID</th>
            <th>Configuration</th>
            <th>Timestamp</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {snapshots.map(snapshot => (
            <tr key={snapshot.id}>
              <td>{snapshot.id}</td>
              <td>{snapshot.configuration}</td>
              <td>{new Date(snapshot.created_at).toLocaleString()}</td>
              <td>
                {/* Button to revert to this snapshot */}
                <button onClick={() => handleRevertSnapshot(snapshot.id)}>Revert</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SnapshotHistory

