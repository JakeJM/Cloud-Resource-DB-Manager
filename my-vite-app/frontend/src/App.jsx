// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateVM from './components/CreateVM';
import EditVM from './components/EditVM';
import SnapshotHistory from './components/SnapshotHistory';
import Networks from './components/Networks';
import CreateNetwork from './components/CreateNetwork'; // Ensure this import is here

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-vm" element={<CreateVM />} />
        <Route path="/edit-vm/:vmId" element={<EditVM />} />
        <Route path="/vm/:vmId/snapshots" element={<SnapshotHistory />} />
        <Route path="/networks" element={<Networks />} />
        <Route path="/create-network" element={<CreateNetwork />} /> {/* Add Networks route */}
      </Routes>
    </Router>
  );
}

export default App;

