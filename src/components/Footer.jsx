import React from 'react';
import { Link } from 'react-router-dom'; // use Link for routing

const Footer = () => {
  return (
    <footer className="bg-navy text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left text-sm font-proxima">
            &copy; {new Date().getFullYear()} EcoTrack. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-gray-300 text-sm">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-300 text-sm">Terms of Service</Link>
            <Link to="/contact" className="hover:text-gray-300 text-sm">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;