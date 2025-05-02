import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} WeatherForesite. All rights reserved.</p>
        <p>
          Powered by{' '}
          <a 
            href="https://openweathermap.org/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            OpenWeatherMap
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;