import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

function Header() {
  return (
    <header>
      <ul className="navbar">
        <li>
          <Link to="/">
            <h1>Tablekeeper</h1>
          </Link>
        </li>
        <li>
          <Link to="/Login">Login</Link>
        </li>
        <li>
          <Link to="/TableGen">TableGen</Link>
        </li>
      </ul>
    </header>
  );
}

export default Header;