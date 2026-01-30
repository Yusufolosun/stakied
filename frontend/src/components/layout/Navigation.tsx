import React from 'react';
import { Link } from 'react-router-dom';

export const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <Link to="/">Home</Link>
    </nav>
  );
};
