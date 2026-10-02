import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import ComplaintDetails from './pages/ComplaintDetails';
import Users from './pages/Users';
import Departments from './pages/Departments';
import Statuses from './pages/Statuses';

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Router>
      <div className="app-container">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        
        <div className="main-content">
          <Header setMobileOpen={setMobileOpen} />
          
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/complaints/:id" element={<ComplaintDetails />} />
              <Route path="/users" element={<Users />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/statuses" element={<Statuses />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
