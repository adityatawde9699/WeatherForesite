import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import Header from './components/Header/Header.jsx';
import Search from './components/Search/Search.jsx';
import WeatherDisplay from './components/WeatherDisplay/WeatherDisplay.jsx';
import WeatherDetails from './components/WeatherDetails/WeatherDetails.jsx';
import HourlyForecast from './components/WeatherDetails/HourlyForecast.jsx';
import Forecast from './components/Forecast/Forecast.jsx';
import AirQuality from './components/AirQuality/AirQuality.jsx';
import Footer from './components/Footer/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { useWeatherData } from './hooks/useWeatherData.js';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faWind, 
  faWater, 
  faMapMarkerAlt, 
  faCalendarAlt,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

// Add icons to library
library.add(
  faWind, 
  faWater, 
  faMapMarkerAlt, 
  faCalendarAlt,
  faChevronLeft,
  faChevronRight
);

function App() {
  const [unit, setUnit] = useState('C');
  const { weatherData, error, loading, fetchWeather, fetchWeatherByLocation } = useWeatherData();
  const hasInitialFetch = useRef(false);

  useEffect(() => {
    if (!hasInitialFetch.current) {
      hasInitialFetch.current = true;
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByLocation(latitude, longitude);
          },
          (error) => {
            console.log('Geolocation error:', error);
            fetchWeather('London');
          }
        );
      } else {
        fetchWeather('London');
      }
    }
  }, [fetchWeather, fetchWeatherByLocation]);

  const handleSearch = (city) => {
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  const toggleUnit = () => {
    setUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  return (
    <ErrorBoundary>
      <div className="App">
     
        <Header />
        <main>
          <Search onSearch={handleSearch} />
          {loading && (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
              <p>Loading weather data...</p>
            </div>
          )}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <div className="error-actions">
                <button 
                  className="retry-button" 
                  onClick={() => fetchWeather('London')}
                >
                  Try London
                </button>
                <button 
                  className="retry-button" 
                  onClick={() => window.location.reload()}
                >
                  Reload App
                </button>
              </div>
            </div>
          )}
          {!loading && !error && weatherData && (
            <>
              <WeatherDisplay data={weatherData} unit={unit} />
              <WeatherDetails data={weatherData} unit={unit} toggleUnit={toggleUnit} />
              <HourlyForecast hourlyData={weatherData.hourly} unit={unit} loading={loading} />
              <Forecast data={weatherData} unit={unit} />
              <AirQuality data={weatherData} />
            </>
          )}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
