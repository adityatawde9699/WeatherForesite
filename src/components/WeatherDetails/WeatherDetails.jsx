import React from 'react';
import './WeatherDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompressAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import HourlyForecast from './HourlyForecast';
import PropTypes from 'prop-types';

const WeatherDetails = ({ data, unit, toggleUnit }) => {
  if (!data) {
    return null;
  }

  const convertVisibility = (visibility) => {
    if (unit === 'F') {
      return ((visibility / 1000) * 0.621371).toFixed(1) + ' mi';
    }
    return (visibility / 1000).toFixed(1) + ' km';
  };

  const getVisibilityCondition = (visibility) => {
    const visibilityKm = visibility / 1000;
    if (visibilityKm > 10) return 'Excellent';
    if (visibilityKm > 5) return 'Good';
    if (visibilityKm > 2) return 'Moderate';
    return 'Poor';
  };

  const getPressureTrend = (pressure) => {
    if (pressure > 1013) return '↑ High';
    if (pressure < 1013) return '↓ Low';
    return '→ Normal';
  };

  return (
    <section className="weather-details">
      <div className="unit-toggle">
        <button 
          className={`unit-btn ${unit === 'C' ? 'active' : ''}`} 
          onClick={toggleUnit}
          aria-label="Switch to Celsius"
        >
          °C
        </button>
        <span>/</span>
        <button 
          className={`unit-btn ${unit === 'F' ? 'active' : ''}`} 
          onClick={toggleUnit}
          aria-label="Switch to Fahrenheit"
        >
          °F
        </button>
      </div>

      {data.hourly && data.hourly.length > 0 && (
        <HourlyForecast hourlyData={data.hourly} unit={unit} />
      )}
      
      <div className="details-grid">
        <div className="detail-card">
          <h3>
            <FontAwesomeIcon icon="wind" className="detail-icon" /> 
            Wind
          </h3>
          <p>{data.current.windSpeed} m/s</p>
          <div className="wind-direction">
            <FontAwesomeIcon 
              icon="location-arrow" 
              style={{ transform: `rotate(${data.current.windDeg}deg)` }}
            />
          </div>
        </div>
        
        <div className="detail-card">
          <h3>
            <FontAwesomeIcon icon="water" className="detail-icon" /> 
            Humidity
          </h3>
          <p>{data.current.humidity}%</p>
          <div className="humidity-bar">
            <div 
              className="humidity-fill" 
              style={{ 
                width: `${data.current.humidity}%`,
                backgroundColor: `hsl(${200 - data.current.humidity * 2}, 80%, 50%)`
              }}
            ></div>
          </div>
        </div>

        <div className="detail-card">
          <h3>
            <FontAwesomeIcon icon={faCompressAlt} className="detail-icon" />
            Pressure
          </h3>
          <p>{data.current.pressure} hPa</p>
          <div className="pressure-trend">
            <span className={`trend ${data.current.pressure > 1013 ? 'high' : data.current.pressure < 1013 ? 'low' : 'normal'}`}>
              {getPressureTrend(data.current.pressure)}
            </span>
          </div>
        </div>

        <div className="detail-card">
          <h3>
            <FontAwesomeIcon icon={faEye} className="detail-icon" />
            Visibility
          </h3>
          <p>{convertVisibility(data.current.visibility)}</p>
          <div className="visibility-condition">
            <span className={`condition ${getVisibilityCondition(data.current.visibility).toLowerCase()}`}>
              {getVisibilityCondition(data.current.visibility)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

WeatherDetails.propTypes = {
  data: PropTypes.shape({
    current: PropTypes.shape({
      windSpeed: PropTypes.number.isRequired,
      windDeg: PropTypes.number,
      humidity: PropTypes.number.isRequired,
      pressure: PropTypes.number.isRequired,
      visibility: PropTypes.number.isRequired
    }).isRequired,
    hourly: PropTypes.arrayOf(PropTypes.object)
  }),
  unit: PropTypes.oneOf(['C', 'F']).isRequired,
  toggleUnit: PropTypes.func.isRequired
};

export default WeatherDetails;