// Constants
const API_KEY = '818fc5b16b2198e8a74a4af86e438dac'; // Replace with your actual API key
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const GEO_API_BASE = 'https://api.openweathermap.org/geo/1.0';
const AQI_API_BASE = 'https://api.openweathermap.org/data/2.5/air_pollution';

// DOM Elements - Ensure all elements are properly selected
const citySearchInput = document.getElementById('city-search');
const searchBtn = document.querySelector('.search-btn');
const recentSearchesList = document.getElementById('recent-searches');
const clearHistoryBtn = document.querySelector('.clear-history');
const unitToggleBtn = document.querySelector('.unit-toggle');
const scrollLeftBtn = document.querySelector('.scroll-left');
const scrollRightBtn = document.querySelector('.scroll-right');
const hourlyCardsContainer = document.querySelector('.hourly-cards');
const alertsList = document.getElementById('alerts-list');
const weatherMapElement = document.getElementById('weather-map');
const mapToggles = document.querySelectorAll('.map-toggle');

// State management
let currentUnit = 'C';
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
let lastWeatherData = null;
let weatherMap = null; // Fixed variable name to match later usage
let currentLayer = 'temperature';

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleSearch();
});
citySearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
    }
});
clearHistoryBtn.addEventListener('click', clearSearchHistory);
unitToggleBtn.addEventListener('click', toggleTemperatureUnit);
scrollLeftBtn.addEventListener('click', () => scrollHourly('left'));
scrollRightBtn.addEventListener('click', () => scrollHourly('right'));

// Map layer toggle listeners
mapToggles.forEach(button => {
    button.addEventListener('click', () => {
        const layer = button.dataset.layer;
        changeMapLayer(layer);
        
        // Update active button state
        mapToggles.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// Initialize the app
function initializeApp() {
    updateSearchHistoryDisplay();
    
    // Try to get user's location for initial weather display
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            error => {
                console.error('Geolocation error:', error);
                // Default to a major city if geolocation fails
                fetchWeatherData('New York');
            }
        );
    } else {
        // Fallback for browsers without geolocation
        fetchWeatherData('New York');
    }
    
    // Initialize map
    initializeWeatherMap();
}

// Search handling
async function handleSearch() {
    const city = citySearchInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        await fetchWeatherData(city);
        citySearchInput.value = '';
    } catch (error) {
        console.error('Search error:', error);
        // Error is already shown in fetchWeatherData
    }
}

// API calls
async function fetchWeatherData(city) {
    showLoadingScreen(); // Show loading screen before fetch
    try {
        const geoUrl = `${GEO_API_BASE}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
        console.log("Attempting geocoding with URL:", geoUrl);
        
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) {
            console.error(`Geocoding API returned status: ${geoResponse.status}`);
            throw new Error(`Geocoding failed: ${geoResponse.statusText}`);
        }
        
        const geoData = await geoResponse.json();
        console.log("Geocoding API response:", geoData);
        
        if (!geoData || geoData.length === 0) {
            throw new Error('City not found. Please check spelling or try another city.');
        }
        
        const { lat, lon, name: cityName } = geoData[0];
        addToSearchHistory(cityName || city);
        
        // Fetch weather with coordinates and return the result
        const weatherData = await fetchWeatherByCoords(lat, lon);
        hideLoadingScreen(); // Hide loading screen after successful fetch
        return weatherData; // Make sure to return the data
    } catch (error) {
        hideLoadingScreen(); // Hide loading screen if there's an error
        console.error('Error in fetchWeatherData:', error);
        showError(error.message);
        throw error;
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        // Get current weather
        const weatherResponse = await fetch(
            `${WEATHER_API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!weatherResponse.ok) throw new Error('Weather data fetch failed');
        
        const weatherData = await weatherResponse.json();
        
        // Save coordinates for other API calls
        weatherData._coordinates = { lat, lon };
        
        // Update global state
        lastWeatherData = weatherData;
        
        // Update main weather display
        updateWeatherDisplay(weatherData);
        
        // Fetch additional data in parallel - REMOVE fetchWeatherAlerts
        await Promise.all([
            fetchForecast(lat, lon),
            fetchAirQuality(lat, lon)
            // Remove fetchWeatherAlerts here
        ]);
        
        // Update map center
        if (weatherMap) {
            weatherMap.setCenter([lon, lat]);
        }
        
        return weatherData;
    } catch (error) {
        console.error('Error in fetchWeatherByCoords:', error);
        throw error;
    }
}


async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(
            `${WEATHER_API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('Forecast fetch failed');
        
        const forecastData = await response.json();
        updateForecastDisplay(forecastData);
    } catch (error) {
        console.error('Error fetching forecast:', error);
        showError('Unable to fetch forecast data.');
    }
}

async function fetchAirQuality(lat, lon) {
    try {
        const response = await fetch(
            `${AQI_API_BASE}?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        
        if (!response.ok) throw new Error('Air quality fetch failed');
        
        const aqiData = await response.json();
        updateAirQualityDisplay(aqiData);
    } catch (error) {
        console.error('Error fetching air quality:', error);
        document.querySelector('.aqi-value #aqi-number').textContent = 'Data unavailable';
    }
}

async function fetchWeatherAlerts(lat, lon) {
    try {
        const response = await fetch(
            `${WEATHER_API_BASE}/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${API_KEY}`
        );
        
        if (!response.ok) throw new Error('Alerts fetch failed');
        
        const data = await response.json();
        updateAlertsDisplay(data.alerts || []);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        if (alertsList) {
            alertsList.innerHTML = '<p>No active weather alerts.</p>';
        }
    }
}

// Display updates
function updateWeatherDisplay(data) {
    if (!data) return;
    
    // Update current weather
    const locationElement = document.querySelector('.location');
    const countryElement = document.querySelector('.country-code');
    
    if (locationElement) locationElement.textContent = data.name || 'Unknown';
    if (countryElement) countryElement.textContent = data.sys?.country ? `, ${data.sys.country}` : '';
    
    const tempC = Math.round(data.main.temp);
    const feelsLikeC = Math.round(data.main.feels_like);
    const minTempC = Math.round(data.main.temp_min);
    const maxTempC = Math.round(data.main.temp_max);
    
    const tempValue = document.querySelector('.temp-value');
    const feelsValue = document.querySelector('.feels-value');
    const minSpan = document.querySelector('.min span');
    const maxSpan = document.querySelector('.max span');
    const description = document.querySelector('.description');
    
    if (tempValue) tempValue.textContent = tempC;
    if (feelsValue) feelsValue.textContent = feelsLikeC;
    if (minSpan) minSpan.textContent = `Low: ${minTempC}°${currentUnit}`;
    if (maxSpan) maxSpan.textContent = `High: ${maxTempC}°${currentUnit}`;
    if (description) description.textContent = capitalizeFirstLetter(data.weather[0].description);
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    const weatherIcon = document.querySelector('.weather-icon');
    if (weatherIcon) {
        weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        weatherIcon.alt = data.weather[0].description;
    }

    // Update details
    const windSpeedElement = document.getElementById('wind-speed');
    const windArrow = document.querySelector('.wind-direction i');
    const windDirectionElement = document.getElementById('wind-direction');
    const humidityElement = document.getElementById('humidity');
    const humidityFill = document.querySelector('.humidity-fill');
    const pressureElement = document.getElementById('pressure');
    const visibilityElement = document.getElementById('visibility');
    
    if (windSpeedElement) windSpeedElement.textContent = `${data.wind.speed} m/s`;
    
    if (windArrow && data.wind) {
        windArrow.style.transform = `rotate(${data.wind.deg}deg)`;
    }
    
    if (windDirectionElement && data.wind) {
        windDirectionElement.textContent = getWindDirection(data.wind.deg);
    }
    
    if (humidityElement) humidityElement.textContent = `${data.main.humidity}%`;
    
    if (humidityFill) {
        humidityFill.style.width = `${data.main.humidity}%`;
        
        // Update ARIA values for accessibility
        const humidityBar = document.querySelector('.humidity-bar');
        if (humidityBar) {
            humidityBar.setAttribute('aria-valuenow', data.main.humidity);
        }
    }
    
    if (pressureElement) pressureElement.textContent = `${data.main.pressure} hPa`;
    
    updatePressureTrend(data.main.pressure);
    
    if (visibilityElement && data.visibility) {
        visibilityElement.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        updateVisibilityCondition(data.visibility);
    }

    // Update last updated time
    const now = new Date();
    const timeElement = document.querySelector('.last-updated time');
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString();
        timeElement.setAttribute('datetime', now.toISOString());
    }

    // If we need to update in imperial units
    if (currentUnit === 'F') {
        convertDisplayToImperial();
    }
}

function updateForecastDisplay(forecast) {
    if (!forecast || !forecast.list) return;
    
    // Update 5-day forecast
    const forecastGrid = document.querySelector('.forecast-grid');
    if (!forecastGrid) return;
    
    forecastGrid.innerHTML = '';

    // Group forecast by day
    const dailyForecasts = groupForecastByDay(forecast.list);

    // Display 5-day forecast (skip today)
    const forecastsToShow = dailyForecasts.slice(1, 6);
    forecastsToShow.forEach(day => {
        const forecastCard = createForecastCard(day);
        forecastGrid.appendChild(forecastCard);
    });

    // Update hourly forecast for next 24 hours
    updateHourlyForecast(forecast.list.slice(0, 8)); // 8 entries = 24 hours (3-hour intervals)
}

function updateHourlyForecast(hourlyData) {
    if (!hourlyData || !hourlyData.length) return;
    
    const hourlyContainer = document.querySelector('.hourly-cards');
    if (!hourlyContainer) return;
    
    hourlyContainer.innerHTML = '';

    hourlyData.forEach(hour => {
        if (!hour || !hour.dt || !hour.main || !hour.weather || !hour.weather[0]) return;
        
        const hourlyCard = document.createElement('div');
        hourlyCard.className = 'hourly-card';
        hourlyCard.setAttribute('role', 'listitem');
        
        const time = new Date(hour.dt * 1000).toLocaleTimeString('en-US', {hour: 'numeric'});
        const temp = Math.round(hour.main.temp);
        
        hourlyCard.innerHTML = `
            <p class="hour-time">${time}</p>
            <img class="hour-icon" src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" 
                 alt="${hour.weather[0].description}">
            <p class="hour-temp">${temp}°${currentUnit}</p>
            <p class="hour-desc">${hour.weather[0].main}</p>
        `;
        hourlyContainer.appendChild(hourlyCard);
    });
}

function updateAirQualityDisplay(data) {
    const aqiContainer = document.querySelector('.aqi-display');
    const pollutantDetails = document.querySelector('.pollutant-details');
    
    if (!aqiContainer || !pollutantDetails) return;
    
    if (!data || !data.list || !data.list[0]) {
        aqiContainer.innerHTML = '<p>Air quality data unavailable</p>';
        return;
    }
    
    const aqi = data.list[0].main.aqi;
    const pollutants = data.list[0].components;
    
    // Update AQI number
    const aqiNumber = document.getElementById('aqi-number');
    if (aqiNumber) {
        aqiNumber.textContent = aqi;
        
        // Set AQI class based on value
        aqiNumber.className = getAqiClass(aqi);
    }
    
    // Update pollutant details
    pollutantDetails.innerHTML = `
        <div class="pollutant">
            <span class="pollutant-name">PM2.5</span>
            <span class="pollutant-value">${pollutants.pm2_5.toFixed(1)} μg/m³</span>
        </div>
        <div class="pollutant">
            <span class="pollutant-name">PM10</span>
            <span class="pollutant-value">${pollutants.pm10.toFixed(1)} μg/m³</span>
        </div>
        <div class="pollutant">
            <span class="pollutant-name">O₃</span>
            <span class="pollutant-value">${pollutants.o3.toFixed(1)} μg/m³</span>
        </div>
        <div class="pollutant">
            <span class="pollutant-name">NO₂</span>
            <span class="pollutant-value">${pollutants.no2.toFixed(1)} μg/m³</span>
        </div>
    `;
}

function updateAlertsDisplay(alerts) {
    if (!alertsList) return;
    
    const alertsSection = document.getElementById('alerts');
    
    if (!alerts || alerts.length === 0) {
        alertsList.innerHTML = '<p class="no-alerts">No active weather alerts.</p>';
        if (alertsSection) {
            alertsSection.classList.remove('has-alerts');
        }
        return;
    }
    
    if (alertsSection) {
        alertsSection.classList.add('has-alerts');
    }
    
    alertsList.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert-item';
        
        const startTime = new Date(alert.start * 1000).toLocaleString();
        const endTime = new Date(alert.end * 1000).toLocaleString();
        
        alertElement.innerHTML = `
            <div class="alert-header">
                <h4 class="alert-title">${alert.event}</h4>
                <span class="alert-source">Source: ${alert.sender_name}</span>
            </div>
            <p class="alert-description">${alert.description}</p>
            <p class="alert-time">From: ${startTime}<br>Until: ${endTime}</p>
        `;
        
        alertsList.appendChild(alertElement);
    });
}

function updatePressureTrend(pressure) {
    const trendElement = document.querySelector('.trend');
    if (!trendElement) return;
    
    if (pressure < 1000) {
        trendElement.innerHTML = '<i class="fas fa-arrow-down"></i> Low';
        trendElement.className = 'trend pressure-low';
    } else if (pressure > 1020) {
        trendElement.innerHTML = '<i class="fas fa-arrow-up"></i> High';
        trendElement.className = 'trend pressure-high';
    } else {
        trendElement.innerHTML = '<i class="fas fa-equals"></i> Normal';
        trendElement.className = 'trend pressure-normal';
    }
}

function updateVisibilityCondition(visibility) {
    const conditionElement = document.querySelector('.visibility-condition');
    if (!conditionElement) return;
    
    if (visibility >= 10000) {
        conditionElement.textContent = 'Excellent';
        conditionElement.className = 'visibility-condition good';
    } else if (visibility >= 5000) {
        conditionElement.textContent = 'Good';
        conditionElement.className = 'visibility-condition moderate';
    } else {
        conditionElement.textContent = 'Poor';
        conditionElement.className = 'visibility-condition poor';
    }
}

// Weather Map Functions
function initializeWeatherMap() {
    // This is a placeholder for actual map implementation
    // You would typically use a mapping library like Leaflet or Mapbox
    
    const mapContainer = document.getElementById('weather-map');
    if (!mapContainer) return;
    
    mapContainer.innerHTML = `
        <div class="map-placeholder">
            <p>Weather Map would be displayed here.</p>
            <p>Using OpenLayers or Leaflet with OpenWeatherMap tile layers.</p>
        </div>
    `;
    
    // Set the first map toggle as active by default
    const firstToggle = document.querySelector('.map-toggle');
    if (firstToggle) {
        firstToggle.classList.add('active');
    }
    
    // In a real implementation, you would initialize the map here
}

function changeMapLayer(layer) {
    currentLayer = layer;
    console.log(`Weather map layer changed to: ${layer}`);
    
    // In a real implementation, you would change the map layer here
}

// Utility functions
function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
}

function groupForecastByDay(forecastList) {
    if (!forecastList || !Array.isArray(forecastList)) return [];
    
    const grouped = {};
    
    forecastList.forEach(forecast => {
        if (!forecast || !forecast.dt) return;
        
        // Get the date part only (without time)
        const date = new Date(forecast.dt * 1000).toISOString().split('T')[0];
        
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(forecast);
    });
    
    return Object.entries(grouped).map(([date, forecasts]) => {
        return {
            date,
            forecasts
        };
    });
}

function createForecastCard(day) {
    if (!day || !day.forecasts || !day.forecasts.length) return document.createElement('div');
    
    const div = document.createElement('div');
    div.className = 'forecast-card';
    div.setAttribute('role', 'listitem');
    
    try {
        // Calculate average temperature and find most common weather condition
        const avgTemp = day.forecasts.reduce((sum, f) => sum + f.main.temp, 0) / day.forecasts.length;
        
        // Find most common weather condition (mode)
        const weatherCounts = {};
        day.forecasts.forEach(f => {
            const condition = f.weather[0].main;
            weatherCounts[condition] = (weatherCounts[condition] || 0) + 1;
        });
        
        let commonWeather = day.forecasts[0].weather[0];
        let maxCount = 0;
        
        for (const condition in weatherCounts) {
            if (weatherCounts[condition] > maxCount) {
                maxCount = weatherCounts[condition];
                // Find the first forecast with this weather condition
                commonWeather = day.forecasts.find(f => f.weather[0].main === condition).weather[0];
            }
        }
        
        // Get date in readable format
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', {weekday: 'short'});
        const dateStr = date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
        
        div.innerHTML = `
            <h4>${dayName}, ${dateStr}</h4>
            <img src="https://openweathermap.org/img/wn/${commonWeather.icon}@2x.png" 
                 alt="${commonWeather.description}">
            <p class="forecast-temp">${Math.round(avgTemp)}°${currentUnit}</p>
            <p class="forecast-desc">${commonWeather.main}</p>
        `;
    } catch (error) {
        console.error('Error creating forecast card:', error);
        div.innerHTML = '<p>Forecast data unavailable</p>';
    }
    
    return div;
}

function getAqiClass(aqi) {
    switch(aqi) {
        case 1: return 'aqi-good';
        case 2: return 'aqi-fair';
        case 3: return 'aqi-moderate';
        case 4: return 'aqi-poor';
        case 5: return 'aqi-very-poor';
        default: return '';
    }
}

function scrollHourly(direction) {
    const container = document.querySelector('.hourly-cards');
    if (!container) return;
    
    const scrollAmount = container.clientWidth / 2;
    
    if (direction === 'left') {
        container.scrollBy({left: -scrollAmount, behavior: 'smooth'});
    } else {
        container.scrollBy({left: scrollAmount, behavior: 'smooth'});
    }
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Temperature unit conversion
function toggleTemperatureUnit() {
    if (!lastWeatherData) return;
    
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    
    // Update button text
    document.querySelectorAll('.unit').forEach(el => {
        el.textContent = currentUnit;
    });
    
    // Update displayed temperatures
    if (currentUnit === 'F') {
        convertDisplayToImperial();
    } else {
        // Reload the data in metric
        updateWeatherDisplay(lastWeatherData);
        // Also reload forecast if available
        if (lastWeatherData._coordinates) {
            fetchForecast(lastWeatherData._coordinates.lat, lastWeatherData._coordinates.lon);
        }
    }
}

function convertDisplayToImperial() {
    // Convert main temperature display
    const tempElement = document.querySelector('.temp-value');
    const feelsElement = document.querySelector('.feels-value');
    const minElement = document.querySelector('.min span');
    const maxElement = document.querySelector('.max span');
    
    // Check if elements exist before proceeding
    if (!tempElement || !feelsElement) return;
    
    // Convert Celsius to Fahrenheit: (C × 9/5) + 32
    const mainTempC = parseInt(tempElement.textContent) || 0;
    const feelsLikeC = parseInt(feelsElement.textContent) || 0;
    
    const mainTempF = Math.round((mainTempC * 9/5) + 32);
    const feelsLikeF = Math.round((feelsLikeC * 9/5) + 32);
    
    tempElement.textContent = mainTempF;
    feelsElement.textContent = feelsLikeF;
    
    // Update min/max if available
    if (minElement && maxElement) {
        const minMatch = minElement.textContent.match(/\d+/);
        const maxMatch = maxElement.textContent.match(/\d+/);
        
        if (minMatch && maxMatch) {
            const minTempC = parseInt(minMatch[0]);
            const maxTempC = parseInt(maxMatch[0]);
            
            const minTempF = Math.round((minTempC * 9/5) + 32);
            const maxTempF = Math.round((maxTempC * 9/5) + 32);
            
            minElement.textContent = `Low: ${minTempF}°F`;
            maxElement.textContent = `High: ${maxTempF}°F`;
        }
    }
    
    // Convert forecast temperatures
    document.querySelectorAll('.forecast-temp').forEach(el => {
        const tempMatch = el.textContent.match(/\d+/);
        if (tempMatch) {
            const tempC = parseInt(tempMatch[0]);
            const tempF = Math.round((tempC * 9/5) + 32);
            el.textContent = `${tempF}°F`;
        }
    });
    
    // Convert hourly temperatures
    document.querySelectorAll('.hour-temp').forEach(el => {
        const tempMatch = el.textContent.match(/\d+/);
        if (tempMatch) {
            const tempC = parseInt(tempMatch[0]);
            const tempF = Math.round((tempC * 9/5) + 32);
            el.textContent = `${tempF}°F`;
        }
    });
    
    // Convert wind speed from m/s to mph
    const windSpeedElement = document.getElementById('wind-speed');
    if (windSpeedElement) {
        const windMatch = windSpeedElement.textContent.match(/[\d.]+/);
        if (windMatch) {
            const windSpeedMS = parseFloat(windMatch[0]);
            const windSpeedMPH = Math.round(windSpeedMS * 2.237);
            windSpeedElement.textContent = `${windSpeedMPH} mph`;
        }
    }
}

// Search history management
function addToSearchHistory(city) {
    if (!city || typeof city !== 'string') return;
    
    // Remove duplicate if exists
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== city.toLowerCase());
    
    // Add to front of array
    searchHistory.unshift(city);
    
    // Keep only last 5 searches
    searchHistory = searchHistory.slice(0, 5);
    
    // Save to localStorage
    try {
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
    
    updateSearchHistoryDisplay();
}

function updateSearchHistoryDisplay() {
    if (!recentSearchesList) return;
    
    recentSearchesList.innerHTML = '';
    
    if (searchHistory.length === 0) {
        recentSearchesList.innerHTML = '<li class="no-history">No recent searches</li>';
        return;
    }
    
    searchHistory.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => {
            fetchWeatherData(city);
        });
        recentSearchesList.appendChild(li);
    });
}

function clearSearchHistory() {
    searchHistory = [];
    localStorage.removeItem('searchHistory');
    updateSearchHistoryDisplay();
}

// Error handling
function showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    document.querySelector('.search-container').appendChild(errorContainer);
    
    setTimeout(() => {
        errorContainer.remove();
    }, 3000);
}

// Add debounce function for performance optimization
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Add event listener for window resize to handle responsive adjustments
window.addEventListener('resize', debounce(() => {
    // Adjust UI for current screen size if needed
    if (hourlyCardsContainer) {
        // Reset scroll position on resize
        hourlyCardsContainer.scrollLeft = 0;
    }
}, 250));

// Add loading screen script for html loading screen section
document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }
};

// Loading Screen Animation with reduced timing
function handleLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    const progressBar = document.querySelector('.progress-bar');
    const loadingText = document.querySelector('.loading-text');
    const weatherIcon = document.querySelector('.weather-loading i.fa-cloud-sun');
    let progress = 0;
    
    // Simplified loading messages
    const loadingMessages = [
        { text: 'Fetching weather data...', progress: 0 },
        { text: 'Loading forecasts...', progress: 50 },
        { text: 'Weather data ready!', progress: 100 }
    ];

    loadingScreen.classList.add('fade-in');
    weatherIcon.classList.add('rotate-weather');

    // Faster progress interval
    const progressInterval = setInterval(() => {
        // Increased increment for faster loading
        const increment = Math.max(2, Math.random() * (100 - progress) / 10);
        progress = Math.min(100, progress + increment);
        
        progressBar.style.width = `${progress}%`;
        progressBar.style.transition = 'width 0.3s ease-out';
        
        const currentMessage = loadingMessages.find(msg => progress <= msg.progress + 50) || loadingMessages[0];
        loadingText.textContent = currentMessage.text;

        if (progress >= 100) {
            clearInterval(progressInterval);
            completeLoading(loadingScreen);
        }
    }, 50); // Reduced interval time

    // Reduced timeout to 5 seconds
    const timeout = setTimeout(() => {
        clearInterval(progressInterval);
        handleLoadingError(loadingScreen);
    }, 5000);

    return timeout;
}

function completeLoading(loadingScreen) {
    const successSequence = async () => {
        loadingScreen.classList.add('success');
        await delay(250); // Reduced delay
        loadingScreen.style.opacity = '0';
        await delay(250); // Reduced delay
        loadingScreen.style.display = 'none';
        loadingScreen.classList.remove('success', 'fade-in');
    };

    successSequence().catch(console.error);
}

function handleLoadingError(loadingScreen) {
    const loadingText = loadingScreen.querySelector('.loading-text');
    loadingText.textContent = 'Loading taking longer than expected. Retrying...';
    loadingText.classList.add('error');
    
    // Reduced retry delay
    setTimeout(() => {
        loadingText.classList.remove('error');
        handleLoadingScreen();
    }, 1000);
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let loadingTimeout = null;

function showLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }
        loadingScreen.style.display = 'flex';
        requestAnimationFrame(() => {
            loadingScreen.style.opacity = '1';
            loadingTimeout = handleLoadingScreen();
        });
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            loadingScreen.classList.remove('fade-out');
        }, 250); // Reduced fade-out time
    }
}

// Initialize loading screen
document.addEventListener('DOMContentLoaded', () => {
    showLoadingScreen();
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideLoadingScreen();
        }
    });
});
