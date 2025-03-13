// Weather App Animation Script
// Add this to your existing JavaScript file or include as a separate file

// Navigation Lightning Animation
function setupNavigationEffects() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navLinks.length) return;
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            // Add lightning effect
            link.classList.add('lightning-effect');
            
            // Remove after animation completes
            setTimeout(() => {
                link.classList.remove('lightning-effect'); 
            }, 1000);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations after DOM is fully loaded
    initializeAnimations();
});

function initializeAnimations() {
    // Set up all animations
    setupWeatherIconAnimations();
    setupTemperatureAnimations();
    setupCardAnimations();
    setupLoadingAnimations();
    setupProgressBarAnimations();
    setupHourlyScrollAnimations();
    setupSearchAnimations();
    setupWindDirectionAnimation();
}
// 1. Weather Icon Animations
function setupWeatherIconAnimations() {
    const weatherIcon = document.querySelector('.weather-icon');
    if (!weatherIcon) return;

    // Add thunderstorm animation
    const addThunderStormEffect = () => {
        // Create lightning flash overlay
        const flash = document.createElement('div');
        flash.className = 'thunder-flash';
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            opacity: 0;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(flash);

        // Add random lightning flashes
        const flashLightning = () => {
            flash.style.transition = 'none';
            flash.style.opacity = '0.8';
            
            setTimeout(() => {
                flash.style.transition = 'opacity 0.1s ease-out';
                flash.style.opacity = '0';
            }, 50);

            // Add thunder sound effect
            const thunder = new Audio('thunder.mp3'); // Add your thunder sound file
            thunder.volume = 0.3;
            thunder.play().catch(() => {}); // Catch and ignore autoplay errors

            // Schedule next flash at random interval
            setTimeout(flashLightning, Math.random() * 5000 + 2000);
        };

        // Start lightning effect if weather is stormy
        if (weatherIcon.src.includes('thunder') || 
            document.querySelector('.description')?.textContent?.toLowerCase().includes('thunder')) {
            flashLightning();
        }
    };

    addThunderStormEffect();

    // Add initial animation class based on weather condition
    weatherIcon.addEventListener('load', () => {
        const weatherDesc = document.querySelector('.description')?.textContent?.toLowerCase() || '';
        
        if (weatherDesc.includes('clear') || weatherDesc.includes('sun')) {
            weatherIcon.classList.add('sun-animation');
        } else if (weatherDesc.includes('cloud')) {
            weatherIcon.classList.add('cloud-animation');
        } else if (weatherDesc.includes('rain')) {
            weatherIcon.classList.add('rain-animation');
        } else if (weatherDesc.includes('snow')) {
            weatherIcon.classList.add('snow-animation');
        } else if (weatherDesc.includes('thunder') || weatherDesc.includes('storm')) {
            weatherIcon.classList.add('storm-animation');
        } else if (weatherDesc.includes('fog') || weatherDesc.includes('mist')) {
            weatherIcon.classList.add('fog-animation');
        } else if (weatherDesc.includes('wind')) {
            weatherIcon.classList.add('wind-animation');
        }
    });

    // Add pulse effect on icon when data updates
    const pulseIcon = () => {
        weatherIcon.classList.add('pulse-animation');
        setTimeout(() => {
            weatherIcon.classList.remove('pulse-animation');
        }, 1000);
    };

    // Add observer to detect weather description changes
    const descObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                pulseIcon();
            }
        });
    });

    const description = document.querySelector('.description');
    if (description) {
        descObserver.observe(description, { 
            characterData: true, 
            childList: true, 
            subtree: true 
        });
    }
}

// 2. Temperature Display Animations
function setupTemperatureAnimations() {
    // Set up counter animation for temperature change
    const tempValue = document.querySelector('.temp-value');
    const feelsValue = document.querySelector('.feels-value');
    
    if (!tempValue || !feelsValue) return;

    // Add observers to animate temperature changes
    const tempObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
                const target = mutation.target.nodeType === Node.TEXT_NODE ? 
                    mutation.target.parentNode : mutation.target;
                
                animateNumberChange(target);
            }
        });
    });

    tempObserver.observe(tempValue, { 
        characterData: true, 
        childList: true, 
        subtree: true 
    });
    
    tempObserver.observe(feelsValue, { 
        characterData: true, 
        childList: true, 
        subtree: true 
    });

    // Function to animate number change with counting effect
    function animateNumberChange(element) {
        element.classList.add('number-change');
        setTimeout(() => {
            element.classList.remove('number-change');
        }, 1000);
    }

    // Add highlight effect when unit is changed
    const unitToggle = document.querySelector('.unit-toggle');
    if (unitToggle) {
        unitToggle.addEventListener('click', () => {
            // Add flash animation to all temperature displays
            document.querySelectorAll('.temp-value, .feels-value, .forecast-temp, .hour-temp').forEach(el => {
                el.classList.add('temp-update');
                setTimeout(() => {
                    el.classList.remove('temp-update');
                }, 1000);
            });
        });
    }
}

// 3. Card Animations with Staggered Load
function setupCardAnimations() {
    // Apply staggered fade-in animations to weather cards
    const cards = document.querySelectorAll('.card');
    if (!cards.length) return;

    // Add initial fade-in for all cards
    cards.forEach((card, index) => {
        // Set initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        // Start animation with staggered delay
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // Add observer for dynamic card changes
    const forecastGrid = document.querySelector('.forecast-grid');
    if (forecastGrid) {
        const gridObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // Animate newly added forecast cards
                    mutation.addedNodes.forEach((node, index) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            node.style.opacity = '0';
                            node.style.transform = 'translateY(20px)';
                            
                            setTimeout(() => {
                                node.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                                node.style.opacity = '1';
                                node.style.transform = 'translateY(0)';
                            }, 80 * index);
                        }
                    });
                }
            });
        });
        
        gridObserver.observe(forecastGrid, { childList: true });
    }
}

// 4. Loading Animations
function setupLoadingAnimations() {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <div class="cloud-spinner">
                <div class="cloud"></div>
                <div class="rain">
                    <span></span><span></span><span></span><span></span>
                </div>
            </div>
            <p>Fetching weather data...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);

    // Show loading during API calls
    const originalFetch = window.fetch;
    window.fetch = function() {
        const url = arguments[0];
        
        // Only show loading for weather API calls
        if (typeof url === 'string' && url.includes('api.openweathermap.org')) {
            showLoading();
        }
        
        return originalFetch.apply(this, arguments)
            .then(response => {
                // Hide loading when API call completes
                if (typeof url === 'string' && url.includes('api.openweathermap.org')) {
                    hideLoading();
                }
                return response;
            })
            .catch(error => {
                // Hide loading on error
                if (typeof url === 'string' && url.includes('api.openweathermap.org')) {
                    hideLoading();
                }
                throw error;
            });
    };

    function showLoading() {
        loadingOverlay.classList.add('visible');
    }

    function hideLoading() {
        // Small delay to ensure UI updates before hiding
        setTimeout(() => {
            loadingOverlay.classList.remove('visible');
        }, 500);
    }
}

// 5. Progress Bar Animations
function setupProgressBarAnimations() {
    // Animate humidity bar fill
    const humidityBar = document.querySelector('.humidity-fill');
    const humidityValue = document.getElementById('humidity');
    
    if (!humidityBar || !humidityValue) return;

    // Observe humidity value changes
    const humidityObserver = new MutationObserver((mutations) => {
        mutations.forEach(() => {
            // Get current humidity percentage
            const percentage = parseInt(humidityValue.textContent) || 0;
            
            // Reset the bar first
            humidityBar.style.transition = 'none';
            humidityBar.style.width = '0%';
            
            // Force reflow
            humidityBar.offsetHeight;
            
            // Animate to new value
            humidityBar.style.transition = 'width 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            humidityBar.style.width = `${percentage}%`;
            
            // Add water ripple effect
            addWaterRipple(humidityBar);
        });
    });
    
    humidityObserver.observe(humidityValue, { 
        characterData: true, 
        childList: true, 
        subtree: true 
    });

    // Add water ripple effect
    function addWaterRipple(element) {
        // Remove any existing ripple
        const existingRipple = element.querySelector('.water-ripple');
        if (existingRipple) {
            element.removeChild(existingRipple);
        }
        
        // Add new ripple
        const ripple = document.createElement('div');
        ripple.className = 'water-ripple';
        element.appendChild(ripple);
        
        // Remove ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 2000);
    }
}

// 6. Hourly Scroll Animations
function setupHourlyScrollAnimations() {
    const hourlyCards = document.querySelector('.hourly-cards');
    const scrollLeftBtn = document.querySelector('.scroll-left');
    const scrollRightBtn = document.querySelector('.scroll-right');
    
    if (!hourlyCards || !scrollLeftBtn || !scrollRightBtn) return;

    // Observer for new hourly cards
    const hourlyObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                // Apply staggered animation to new hourly cards
                const newCards = Array.from(mutation.addedNodes)
                    .filter(node => node.nodeType === Node.ELEMENT_NODE);
                
                newCards.forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.transition = 'all 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 70 * index);
                });
            }
        });
    });
    
    hourlyObserver.observe(hourlyCards, { childList: true });

    // Add hover effects for scroll buttons
    [scrollLeftBtn, scrollRightBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.classList.add('pulse-button');
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('pulse-button');
        });
    });

    // Animate scroll buttons when clicked
    scrollLeftBtn.addEventListener('click', () => {
        scrollLeftBtn.classList.add('button-click');
        setTimeout(() => {
            scrollLeftBtn.classList.remove('button-click');
        }, 300);
    });
    
    scrollRightBtn.addEventListener('click', () => {
        scrollRightBtn.classList.add('button-click');
        setTimeout(() => {
            scrollRightBtn.classList.remove('button-click');
        }, 300);
    });
}

// 7. Search Bar Animations
function setupSearchAnimations() {
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.getElementById('city-search');
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchBox || !searchInput || !searchBtn) return;

    // Add focus animation for search box
    searchInput.addEventListener('focus', () => {
        searchBox.classList.add('search-active');
    });
    
    searchInput.addEventListener('blur', () => {
        if (!searchInput.value.trim()) {
            searchBox.classList.remove('search-active');
        }
    });

    // Add animation for search button click
    searchBtn.addEventListener('click', () => {
        searchBtn.classList.add('search-btn-click');
        setTimeout(() => {
            searchBtn.classList.remove('search-btn-click');
        }, 300);
    });

    // Animate recent searches
    const recentSearchesList = document.getElementById('recent-searches');
    if (recentSearchesList) {
        const listObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node, index) => {
                        if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('no-history')) {
                            // Setup animation for new list items
                            node.style.opacity = '0';
                            node.style.transform = 'translateX(-10px)';
                            
                            setTimeout(() => {
                                node.style.transition = 'all 0.3s ease';
                                node.style.opacity = '1';
                                node.style.transform = 'translateX(0)';
                            }, 50 * index);
                        }
                    });
                }
            });
        });
        
        listObserver.observe(recentSearchesList, { childList: true });
    }
}

// 8. Wind Direction Arrow Animation
function setupWindDirectionAnimation() {
    const windArrow = document.querySelector('.wind-direction i');
    const windSpeed = document.getElementById('wind-speed');
    
    if (!windArrow || !windSpeed) return;

    // Add continuous animation
    windArrow.classList.add('wind-arrow');

    // Update animation based on wind speed
    const speedObserver = new MutationObserver((mutations) => {
        mutations.forEach(() => {
            // Extract wind speed value
            const speedText = windSpeed.textContent || '';
            const speedMatch = speedText.match(/[\d.]+/);
            const speed = speedMatch ? parseFloat(speedMatch[0]) : 0;
            
            // Adjust animation based on speed
            windArrow.style.animationDuration = `${Math.max(3 - speed * 0.2, 0.5)}s`;
            
            // Add intensity class
            windArrow.className = windArrow.className.replace(/wind-speed-\w+/g, '');
            
            if (speed < 3) {
                windArrow.classList.add('wind-speed-low');
            } else if (speed < 8) {
                windArrow.classList.add('wind-speed-medium');
            } else {
                windArrow.classList.add('wind-speed-high');
            }
        });
    });
    
    speedObserver.observe(windSpeed, { 
        characterData: true, 
        childList: true, 
        subtree: true 
    });
}

