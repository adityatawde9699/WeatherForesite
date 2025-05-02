import React from 'react';
import './Forecast.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Forecast = ({ data, unit }) => {
  if (!data || !data.daily) {
    return null;
  }

  const convertTemp = (temp) => {
    if (unit === 'F') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  const getDayName = (dt) => {
    const date = new Date(dt * 1000);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  };

  return (
    <section className="forecast">
      <h2><FontAwesomeIcon icon="calendar-alt" /> 5-Day Forecast</h2>
      <div className="forecast-grid">
        {data.daily.slice(1, 6).map((day, index) => (
          <div key={index} className="forecast-card">
            <h3>{getDayName(day.dt)}</h3>
            <img src={day.weatherIcon} alt={day.weatherDescription} />
            <div className="temp-range">
              <span className="max-temp">{convertTemp(day.tempMax)}°</span>
              <span className="min-temp">{convertTemp(day.tempMin)}°</span>
            </div>
            <p className="forecast-description">{day.weatherDescription}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Forecast;