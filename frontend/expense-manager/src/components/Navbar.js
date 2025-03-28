import React from "react";
import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Placeholder icon (40x40) */}
        <img
          src="/money-logo.png"
          alt="App Icon"
          className="app-icon"
        />
        <span className="navbar-title">ExpenseManager</span>
      </div>

      <div className="nav-links">
        <NavLink
          to="/upload"
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
        >
          Upload
        </NavLink>
        <NavLink
          to="/expenses"
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
        >
          Expenses
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            isActive ? "nav-link active-link" : "nav-link"
          }
        >
          Reports
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
