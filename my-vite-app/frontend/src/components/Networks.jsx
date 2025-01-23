import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Networks() {
  const [networks, setNetworks] = useState([])

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/networks`, { withCredentials: true })
      .then(response => setNetworks(response.data))
      .catch(error => console.error("Error fetching networks:", error))
  }, [])

  return (
    <div>
      <h2>Networks</h2>
      <table className="vm-table">
        <thead>
          <tr>
            <th>Network ID</th>
            <th>Bandwidth</th>
            <th>Type</th>
            <th>Active</th>
            <th>VMs</th>
          </tr>
        </thead>
        <tbody>
          {networks.map(network => (
            <tr key={network.id}>
              <td>{network.id}</td>
              <td>{network.bandwidth} Mbps</td>
              <td>{network.type}</td>
              <td>{network.is_active ? "On" : "Off"}</td>
              <td>{network.vms.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Networks

