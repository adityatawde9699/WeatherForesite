import React, { useState } from 'react';
import './Search.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const event = new CustomEvent('use-current-location', {
            detail: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
          window.dispatchEvent(event);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
        <button 
          type="button" 
          className="location-button"
          onClick={handleLocationClick}
          title="Use current location"
        >
          <FontAwesomeIcon icon="map-marker-alt" />
        </button>
      </form>
    </div>
  );
};

export default Search;