import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import AvailableCars from './pages/AvailableCars';
import MyCars from './pages/MyCars';

function App() {
  return (
    <UserProvider>
        <Routes>
          <Route path="/" element={<AvailableCars />} />
          <Route path="/my-cars" element={<MyCars />} />
        </Routes>
    </UserProvider>
  );
}

export default App;
