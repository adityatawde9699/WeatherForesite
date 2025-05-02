import React from 'react';
import './WeatherDisplay.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const WeatherDisplay = ({ data, unit }) => {
  if (!data) {
    return null;
  }

  // Convert temperature based on selected unit
  const convertTemp = (temp) => {
    if (unit === 'F') {
      return Math.round((temp * 9/5) + 32);
    }
    return temp;
  };

  return (
    <section className="weather-display">
      <div className="current-weather card">
        <h2 className="city-name">
          <FontAwesomeIcon icon="map-marker-alt" /> 
          Weather in {data.cityName}
        </h2>
        
        <div className="weather-info">
          <div className="temperature-container">
            <div className="main-temp">
              <span className="temp-value">{convertTemp(data.current.temp)}</span>°
              <span className="unit">{unit}</span>
            </div>
            <p className="feels-like">
              Feels like: <span>{convertTemp(data.current.feelsLike)}</span>°{unit}
            </p>
          </div>
          
          <div className="weather-status">
            <img src={data.current.weatherIcon} alt={data.current.weatherDescription} />
            <p className="description">{data.current.weatherDescription}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeatherDisplay;