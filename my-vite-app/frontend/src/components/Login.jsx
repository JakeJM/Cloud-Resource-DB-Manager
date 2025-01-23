// frontend/src/components/Login.jsx
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        { username, password },
        { withCredentials: true }
      )
      if (response.data.success) {
        navigate('/dashboard')
      }
    } catch (error) {
      setError("Invalid username or password")
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        { username, password },
        { withCredentials: true }
      )
      if (response.data.success) {
        setIsRegistering(false) // Go back to login view
        setError("Registration successful! Please log in.")
      }
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div>
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <button type="submit">{isRegistering ? "Register" : "Login"}</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: 'pointer', color: 'blue' }}>
        {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
      </p>
    </div>
  )
}

export default Login

