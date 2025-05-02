import { useState, useCallback } from 'react';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const processWeatherData = (data) => {
    // Group forecast data by day
    const dailyData = data.hourly.reduce((acc, item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          temps: [],
          descriptions: [],
          icons: []
        };
      }
      acc[date].temps.push(item.temp);
      acc[date].descriptions.push(item.weatherDescription);
      acc[date].icons.push(item.weatherIcon);
      return acc;
    }, {});

    // Process daily data
    const daily = Object.entries(dailyData).map(([date, day]) => ({
      dt: new Date(date).getTime() / 1000,
      tempMax: Math.max(...day.temps),
      tempMin: Math.min(...day.temps),
      // Use most frequent description and icon
      weatherDescription: day.descriptions.sort(
        (a, b) => day.descriptions.filter(v => v === a).length
        - day.descriptions.filter(v => v === b).length
      ).pop(),
      weatherIcon: day.icons.sort(
        (a, b) => day.icons.filter(v => v === a).length
        - day.icons.filter(v => v === b).length
      ).pop()
    }));

    return {
      cityName: data.name,
      current: {
        temp: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        visibility: data.visibility , // in meters
        weatherMain: data.weather[0].main,
        weatherDescription: data.weather[0].description,
        weatherIcon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
      },
      hourly: data.hourly,
      daily: daily,
      airQuality: {
        aqi: Math.ceil(Math.random()*5) // Placeholder for air quality data
      }
    };
  };

  const fetchWeather = useCallback(async (city) => {
    try {
      setLoading(true);
      setError(null);
      // First get coordinates from city name
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=818fc5b16b2198e8a74a4af86e438dac`
      );

      if (!geoResponse.ok) {
        throw new Error('City not found');
      }

      const geoData = await geoResponse.json();
      if (!geoData.length) {
        throw new Error('City not found');
      }

      // Get current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${geoData[0].lat}&lon=${geoData[0].lon}&units=metric&appid=818fc5b16b2198e8a74a4af86e438dac`
      );

      if (!currentResponse.ok) {
        throw new Error('Weather data not available');
      }

      const currentData = await currentResponse.json();

      // Get both hourly and daily forecasts using One Call API
      const oneCallResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${geoData[0].lat}&lon=${geoData[0].lon}&units=metric&appid=818fc5b16b2198e8a74a4af86e438dac`
      );

      if (!oneCallResponse.ok) {
        throw new Error('Forecast data not available');
      }

      const forecastData = await oneCallResponse.json();

      // Process the data
      const processedData = {
        ...currentData,
        hourly: forecastData.list.map(item => ({
          dt: item.dt,
          temp: item.main.temp,
          weatherDescription: item.weather[0].description,
          weatherIcon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
        }))
      };
      
      setWeatherData(processWeatherData(processedData));
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeatherByLocation = useCallback(async (lat, lon) => {
    try {
      setLoading(true);
      setError(null);
      // Get current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=818fc5b16b2198e8a74a4af86e438dac`
      );

      if (!currentResponse.ok) {
        throw new Error('Location not found');
      }

      const currentData = await currentResponse.json();

      // Get forecast data
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=818fc5b16b2198e8a74a4af86e438dac`
      );

      if (!forecastResponse.ok) {
        throw new Error('Forecast data not available');
      }

      const forecastData = await forecastResponse.json();

      // Process the data
      const processedData = {
        ...currentData,
        hourly: forecastData.list.map(item => ({
          dt: item.dt,
          temp: item.main.temp,
          weatherDescription: item.weather[0].description,
          weatherIcon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
        }))
      };
      
      setWeatherData(processWeatherData(processedData));
    } catch (err) {
      setError(err.message);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    weatherData,
    error,
    loading,
    fetchWeather,
    fetchWeatherByLocation
  };
};