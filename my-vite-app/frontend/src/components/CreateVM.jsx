// src/components/CreateVM.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function CreateVM() {
  const [networks, setNetworks] = useState([])	  
  const [ram, setRam] = useState(1)
  const [cpuCores, setCpuCores] = useState(1)
  const [networkId, setNetworkId] = useState(null)
  const [osType, setOsType] = useState('Linux')
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/networks`, { withCredentials: true })
      .then(response => setNetworks(response.data))
      .catch(error => console.error("Error fetching networks:", error))
  }, [])

  const handleCreate = (e) => {
    e.preventDefault()
    axios.post(`${import.meta.env.VITE_API_URL}/vm`, { ram, cpu_cores: cpuCores, network_id: networkId, os_type: osType }, { withCredentials: true })
      .then((response) => {
        console.log("VM created successfully:", response.data)
        navigate('/dashboard') // Redirect to dashboard after creation
      })
      .catch(error => {
        console.error("Error creating VM:", error)
      })
  }

  return (
    <div>
      <h2>Create VM</h2>
      <form onSubmit={handleCreate}>
        <label>RAM (GB):</label>
        <select value={ram} onChange={(e) => setRam(Number(e.target.value))}>
          {[...Array(16).keys()].map(i => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
        </select>
        <label>CPU Cores:</label>
        <select value={cpuCores} onChange={(e) => setCpuCores(Number(e.target.value))}>
          {[...Array(8).keys()].map(i => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
        </select>
        <label>Network:</label>
        <select value={networkId} onChange={(e) => setNetworkId(e.target.value)}>
         <option value={null}>None</option>
        {networks.map(net => (
          <option key={net.id} value={net.id}>{net.type} - {net.bandwidth} Mbps</option>
        ))}
      </select>
      <label>OS Type:</label>
      <select value={osType} onChange={(e) => setOsType(e.target.value)}>
        {['Linux', 'Windows', 'MacOS', 'Ubuntu', 'Fedora'].map(os => (
          <option key={os} value={os}>{os}</option>
        ))}
      </select>
        <button type="submit">Create VM</button>
      </form>
    </div>
  )
}

export default CreateVM

