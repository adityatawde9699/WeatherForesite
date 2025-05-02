const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || '818fc5b16b2198e8a74a4af86e438dac';

export const fetchWeatherData = async (city) => {
  if (!city) {
    throw new Error('City is required');
  }

  console.log(`[API] Fetching weather data for city: ${city}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // Increased timeout

  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
    
    const geoResponse = await fetch(geoUrl, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!geoResponse.ok) {
      throw new Error(`Geocoding API error: ${geoResponse.status} ${geoResponse.statusText}`);
    }
    
    const geoData = await geoResponse.json();
    
    if (!geoData || geoData.length === 0) {
      throw new Error(`City "${city}" not found`);
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${geoData[0].lat}&lon=${geoData[0].lon}&appid=${API_KEY}&units=metric`;
    
    const weatherResponse = await fetch(weatherUrl, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status} ${weatherResponse.statusText}`);
    }
    
    const weatherData = await weatherResponse.json();
    clearTimeout(timeout);
    return {
      ...weatherData,
      coords: {
        lat: geoData[0].lat,
        lon: geoData[0].lon
      }
    };
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
};

export const fetchWeatherByCoordinates = async (lat, lon) => {
  console.log(`[API] Fetching weather data for coordinates: ${lat}, ${lon}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    console.log(`[API] Weather URL: ${weatherUrl}`);
    
    const weatherResponse = await fetch(weatherUrl, { signal: controller.signal });
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API error: ${weatherResponse.status} ${weatherResponse.statusText}`);
    }
    
    const weatherData = await weatherResponse.json();
    clearTimeout(timeout);
    return weatherData;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

export const fetchForecastByCoordinates = async (lat, lon) => {
  console.log(`[API] Fetching forecast data for coordinates: ${lat}, ${lon}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    console.log(`[API] Forecast URL: ${forecastUrl}`);
    
    const forecastResponse = await fetch(forecastUrl, { signal: controller.signal });
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status} ${forecastResponse.statusText}`);
    }
    
    const forecastData = await forecastResponse.json();
    clearTimeout(timeout);
    return forecastData;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

export const fetchForecastData = async (city) => {
  console.log(`[API] Fetching forecast data for city: ${city}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
    const geoResponse = await fetch(geoUrl, { signal: controller.signal });
    
    if (!geoResponse.ok) {
      throw new Error(`Geocoding API error: ${geoResponse.status} ${geoResponse.statusText}`);
    }
    
    const geoData = await geoResponse.json();
    
    if (!geoData || geoData.length === 0) {
      throw new Error('City not found');
    }

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${geoData[0].lat}&lon=${geoData[0].lon}&appid=${API_KEY}&units=metric`;
    console.log(`[API] Forecast URL: ${forecastUrl}`);
    
    const forecastResponse = await fetch(forecastUrl, { signal: controller.signal });
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status} ${forecastResponse.statusText}`);
    }
    
    const forecastData = await forecastResponse.json();
    clearTimeout(timeout);
    return forecastData;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

export const fetchAirQualityData = async (lat, lon) => {
  console.log(`[API] Fetching air quality data for coordinates: ${lat}, ${lon}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    console.log(`[API] Air Quality URL: ${airQualityUrl}`);
    
    const airQualityResponse = await fetch(airQualityUrl, { signal: controller.signal });
    
    if (!airQualityResponse.ok) {
      throw new Error(`Air Quality API error: ${airQualityResponse.status} ${airQualityResponse.statusText}`);
    }
    
    const airQualityData = await airQualityResponse.json();
    clearTimeout(timeout);
    return airQualityData;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};