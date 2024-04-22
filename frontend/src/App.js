import React from "react";
import { Routes, Route } from "react-router-dom";
import ConnectWallet from "./pages/ConnnectWallet";
import AvailableCars from "./pages/AvailableCars";
import MyCars from "./pages/MyCars";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ConnectWallet />} />
      <Route path="/available-cars" exact element={<AvailableCars />} />
      <Route path="/my-cars" exact element={<MyCars />} />
    </Routes>
  );
}

export default App;
