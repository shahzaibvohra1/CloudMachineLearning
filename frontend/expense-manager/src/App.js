import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import SuggestionPage from "./components/SuggestionPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/suggestion" element={<SuggestionPage />} />
        {/* Add more routes here for other pages */}
      </Routes>
    </Router>
  );
}

export default App;