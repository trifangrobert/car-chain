import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import AvailableCars from './pages/AvailableCars';
import MyCars from './pages/MyCars';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UploadCar from './pages/UploadCar';
import SetGasLimit from './components/SetGasLimit';

function App() {
  return (
    <UserProvider>
        <SetGasLimit /> 
        <Routes>
          <Route path="/" element={<AvailableCars />} />
          <Route path="/my-cars" element={<MyCars />} />
          <Route path="/upload-car" element={<UploadCar />} />
        </Routes>
        <ToastContainer />
    </UserProvider>
    
  );
}

export default App;
