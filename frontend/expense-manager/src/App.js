import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Upload from "./components/Upload";
import Expenses from "./components/Expenses";
import Reports from "./components/Reports";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      {/* Define routes for each tab */}
      <div className="content-container">
        <Routes>
          {/* Default to /upload */}
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
