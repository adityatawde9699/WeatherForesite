import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './HourlyForecast.css';

const HourlyForecast = ({ hourlyData, unit, loading }) => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsToShow = 6;

  const convertTemp = (temp) => {
    if (unit === 'F') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  const formatHour = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
  };

  const handlePrevClick = () => {
    setStartIndex(Math.max(0, startIndex - itemsToShow));
  };

  const handleNextClick = () => {
    setStartIndex(Math.min(hourlyData?.length - itemsToShow || 0, startIndex + itemsToShow));
  };

  if (loading) {
    return (
      <div className="hourly-forecast">
        <h3>Hourly Forecast</h3>
        <div className="hourly-container">
          <div className="hourly-items">
            {[...Array(itemsToShow)].map((_, index) => (
              <div key={index} className="hourly-item skeleton">
                <div className="hour-skeleton"></div>
                <div className="icon-skeleton"></div>
                <div className="temp-skeleton"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hourlyData || !Array.isArray(hourlyData)) {
    return null;
  }

  const visibleData = hourlyData.slice(startIndex, startIndex + itemsToShow);

  return (
    <div className="hourly-forecast">
      <h3>Hourly Forecast</h3>
      <div className="hourly-container">
        <button 
          className="nav-button prev" 
          onClick={handlePrevClick}
          disabled={startIndex === 0}
        >
          <FontAwesomeIcon icon="chevron-left" />
        </button>
        
        <div className="hourly-items">
          {visibleData.map((hour, index) => (
            <div key={index} className="hourly-item">
              <span className="hour">{formatHour(hour.dt)}</span>
              <img src={hour.weatherIcon} alt={hour.weatherDescription} />
              <span className="temp">{convertTemp(hour.temp)}°{unit}</span>
            </div>
          ))}
        </div>

        <button 
          className="nav-button next" 
          onClick={handleNextClick}
          disabled={startIndex >= (hourlyData.length - itemsToShow)}
        >
          <FontAwesomeIcon icon="chevron-right" />
        </button>
      </div>
    </div>
  );
};

export default HourlyForecast;