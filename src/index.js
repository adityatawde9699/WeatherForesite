import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';  // Fixed import
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faMapMarkerAlt, 
  faSearch, 
  faCloudSun, 
  faCircleNotch,
  faTemperatureHigh,
  faWind,
  faWater,
  faSun,
  faCloud,
  faCalendarAlt,
  faLungs,
  faHome,
  faMapMarkedAlt,
  faStar,
  faChartLine,
  faCog,
  faBars,
  faTimes,
  faShareAlt,
  faLocationArrow,
  faSync,
  faCity,
  faHistory,
  faMap
} from '@fortawesome/free-solid-svg-icons';

// Add all icons to the library
library.add(
  faMapMarkerAlt,
  faSearch,
  faCloudSun,
  faCircleNotch,
  faTemperatureHigh,
  faWind,
  faWater,
  faSun,
  faCloud,
  faCalendarAlt,
  faLungs,
  faHome,
  faMapMarkedAlt,
  faStar,
  faChartLine,
  faCog,
  faBars,
  faTimes,
  faShareAlt,
  faLocationArrow,
  faSync,
  faCity,
  faHistory,
  faMap
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);