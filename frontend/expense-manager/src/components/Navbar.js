import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation(); // get current path

  // navbar links
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/history", label: "History" },
    { path: "/suggestion", label: "Suggestion" },
    { path: "/prediction", label: "Prediction" },
  ];

  return (
    <nav className="navbar">
      <div className="title">
        <img src="/logo_B.png" alt="Logo" className="logo" />
        Budget Planner
      </div>
      <ul className="navList">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={
                location.pathname === item.path ? "navLink activeLink" : "navLink"
              }
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;