// Constants
const API_KEY = '818fc5b16b2198e8a74a4af86e438dac'; // Replace with your actual API key
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const citySearchInput = document.getElementById('city-search');
const searchBtn = document.querySelector('.search-btn');
const recentSearchesList = document.getElementById('recent-searches');
const clearHistoryBtn = document.querySelector('.clear-history');
const unitToggleBtn = document.querySelector('.unit-toggle');

// State management
let currentUnit = 'C';
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
citySearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
clearHistoryBtn.addEventListener('click', clearSearchHistory);
unitToggleBtn.addEventListener('click', toggleTemperatureUnit);

// Search handling
async function handleSearch() {
    const city = citySearchInput.value.trim();
    if (!city) return;

    try {
        const weatherData = await fetchWeatherData(city);
        updateWeatherDisplay(weatherData);
        addToSearchHistory(city);
        citySearchInput.value = '';
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Could not find weather data for this city. Please try again.');
    }
}

// API calls
async function fetchWeatherData(city) {
    const response = await fetch(
        `${WEATHER_API_BASE}/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!response.ok) throw new Error('City not found');
    return await response.json();
}

async function fetchForecast(lat, lon) {
    const response = await fetch(
        `${WEATHER_API_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    return await response.json();
}

// Display updates
function updateWeatherDisplay(data) {
    // Update current weather
    document.querySelector('.location').textContent = data.name;
    document.querySelector('.country-code').textContent = `, ${data.sys.country}`;
    document.querySelector('.temp-value').textContent = Math.round(data.main.temp);
    document.querySelector('.feels-value').textContent = Math.round(data.main.feels_like);
    document.querySelector('.description').textContent = data.weather[0].description;
    
    // Update weather icon
    const iconCode = data.weather[0].icon;
    const weatherIcon = document.querySelector('.weather-icon');
    weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;

    // Update details
    document.getElementById('wind-speed').textContent = `${data.wind.speed} km/h`;
    document.getElementById('wind-direction').textContent = getWindDirection(data.wind.deg);
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Update last updated time
    const now = new Date();
    document.querySelector('.last-updated time').textContent = now.toLocaleTimeString();
    document.querySelector('.last-updated time').setAttribute('datetime', now.toISOString());

    // Fetch and update forecast
    fetchForecast(data.coord.lat, data.coord.lon)
        .then(forecastData => updateForecastDisplay(forecastData));
}

function updateForecastDisplay(forecast) {
    const forecastGrid = document.querySelector('.forecast-grid');
    forecastGrid.innerHTML = '';

    // Group forecast by day and get daily averages
    const dailyForecasts = groupForecastByDay(forecast.list);

    // Display 5-day forecast
    dailyForecasts.slice(1, 6).forEach(day => {
        const forecastCard = createForecastCard(day);
        forecastGrid.appendChild(forecastCard);
    });

    // Update hourly forecast
    updateHourlyForecast(forecast.list.slice(0, 24));
}

// Utility functions
function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
}

function groupForecastByDay(forecastList) {
    const grouped = {};
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(forecast);
    });
    return Object.values(grouped);
}

function createForecastCard(dayForecasts) {
    const div = document.createElement('div');
    div.className = 'forecast-card';
    const avgTemp = dayForecasts.reduce((sum, f) => sum + f.main.temp, 0) / dayForecasts.length;
    
    div.innerHTML = `
        <h4>${new Date(dayForecasts[0].dt * 1000).toLocaleDateString('en-US', {weekday: 'short'})}</h4>
        <img src="http://openweathermap.org/img/wn/${dayForecasts[0].weather[0].icon}@2x.png" 
             alt="${dayForecasts[0].weather[0].description}">
        <p>${Math.round(avgTemp)}°${currentUnit}</p>
    `;
    return div;
}

function updateHourlyForecast(hourlyData) {
    const hourlyContainer = document.querySelector('.hourly-cards');
    hourlyContainer.innerHTML = '';

    hourlyData.forEach(hour => {
        const hourlyCard = document.createElement('div');
        hourlyCard.className = 'hourly-card';
        hourlyCard.innerHTML = `
            <span>${new Date(hour.dt * 1000).toLocaleTimeString('en-US', {hour: 'numeric'})}</span>
            <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" 
                 alt="${hour.weather[0].description}">
            <span>${Math.round(hour.main.temp)}°${currentUnit}</span>
        `;
        hourlyContainer.appendChild(hourlyCard);
    });
}

// Search history management
function addToSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.unshift(city);
        if (searchHistory.length > 5) searchHistory.pop();
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        updateSearchHistoryDisplay();
    }
}

function updateSearchHistoryDisplay() {
    recentSearchesList.innerHTML = '';
    searchHistory.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => {
            citySearchInput.value = city;
            handleSearch();
        });
        recentSearchesList.appendChild(li);
    });
}

function clearSearchHistory() {
    searchHistory = [];
    localStorage.removeItem('searchHistory');
    updateSearchHistoryDisplay();
}

function toggleTemperatureUnit() {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    // Implement temperature conversion logic here
    // You'll need to update all temperature displays
}

// Initialize
updateSearchHistoryDisplay();