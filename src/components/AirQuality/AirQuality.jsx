import React from 'react';
import './AirQuality.css';

const AirQuality = ({ data }) => {
  if (!data || !data.airQuality) {
    return null;
  }

  const getAirQualityLevel = (aqi) => {
    // Updated AQI levels according to US EPA standards
    const levels = {
      1: { 
        text: 'Good', 
        color: '#00E400',
        description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
        range: '0-50'
      },
      2: { 
        text: 'Moderate', 
        color: '#FFFF00',
        description: 'Air quality is acceptable. However, there may be a moderate health concern for a very small number of people.',
        range: '51-100'
      },
      3: { 
        text: 'Unhealthy for Sensitive Groups', 
        color: '#FF7E00',
        description: 'Members of sensitive groups may experience health effects. General public is less likely to be affected.',
        range: '101-150'
      },
      4: { 
        text: 'Unhealthy', 
        color: '#FF0000',
        description: 'Everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects.',
        range: '151-200'
      },
      5: { 
        text: 'Very Unhealthy', 
        color: '#99004C',
        description: 'Health alert: everyone may experience more serious health effects.',
        range: '201-300'
      },
      6: { 
        text: 'Hazardous', 
        color: '#7E0023',
        description: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
        range: '301+' 
      }
    };
    return levels[aqi] || { text: 'Unknown', color: '#9E9E9E', description: 'No data available', range: 'N/A' };
  };

  const { aqi, components = {} } = data.airQuality;
  const airQualityInfo = getAirQualityLevel(aqi);

  const pollutants = {
    co: { name: 'Carbon Monoxide', unit: 'mg/m³', safe_limit: 10 },
    no2: { name: 'Nitrogen Dioxide', unit: 'µg/m³', safe_limit: 40 },
    o3: { name: 'Ozone', unit: 'µg/m³', safe_limit: 100 },
    pm2_5: { name: 'PM2.5', unit: 'µg/m³', safe_limit: 25 },
    pm10: { name: 'PM10', unit: 'µg/m³', safe_limit: 50 },
    so2: { name: 'Sulfur Dioxide', unit: 'µg/m³', safe_limit: 50 }
  };

  return (
    <section className="air-quality">
      <h2>Air Quality Index</h2>
      <div className="air-quality-card">
        <div 
          className="aqi-indicator"
          style={{ backgroundColor: airQualityInfo.color }}
        >
          <span className="aqi-value">{aqi}</span>
          <span className="aqi-text">{airQualityInfo.text}</span>
          <span className="aqi-range">AQI Range: {airQualityInfo.range}</span>
        </div>
        <div className="aqi-details">
          <p className="aqi-description">{airQualityInfo.description}</p>
          <div className="pollutants-grid">
            {Object.entries(components).map(([key, value]) => (
              pollutants[key] && (
                <div key={key} className="pollutant-item">
                  <span className="pollutant-name">{pollutants[key].name}</span>
                  <span className="pollutant-value">
                    {Math.round(value)} {pollutants[key].unit}
                  </span>
                  <span className="pollutant-safe-limit">
                    Safe limit: {pollutants[key].safe_limit} {pollutants[key].unit}
                  </span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AirQuality;