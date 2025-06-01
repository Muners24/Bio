import React from 'react';
import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="text-white hover:text-gray-400">Home</Link>
          </li>
          <li>
            <Link to="/login" className="text-white hover:text-gray-400">Login</Link>
          </li>
          <li>
            <Link to="/register" className="text-white hover:text-gray-400">Register</Link>
          </li>
          <li>
            <Link to="/editor" className="text-white hover:text-gray-400">Editor</Link>
          </li>
          <li>
            <Link to="/biblioteca" className="text-white hover:text-gray-400">Biblioteca</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

