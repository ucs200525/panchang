import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="navbar">
      <Link to="/">Home</Link>
      <Link to="/panchaka">PanchakaMuhurtha</Link>
      <Link to="/combine">Good Time Today</Link>
    </div>
  );
};

export default Navbar;
