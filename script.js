const apiKey = '8c00377765cabbbe86c2b19725972a86';
const conroeLat = 30.3106;
const conroeLon = -95.4563;
const coldspringLat = 30.5909;
const coldspringLon = -95.1292;

async function fetchWeather(city, lat, lon, currentElementId, forecastElementId) {
  try {
    // Fetch current weather
    const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    const currentData = await currentResponse.json();
    
    // Update current conditions
    const currentElement = document.getElementById(currentElementId);
    currentElement.innerHTML = `
      Temperature: ${currentData.main.temp}°F<br>
      Condition: ${currentData.weather[0].description}<br>
      Humidity: ${currentData.main.humidity}%<br>
      Wind: ${currentData.wind.speed} mph
    `;

    // Fetch 5-day forecast (OpenWeatherMap provides 3-hourly data, we'll extract daily)
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();
    
    // Filter to get one forecast per day (around noon) and evening (around 9 PM)
    const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 7);
    const eveningForecasts = forecastData.list.filter(item => item.dt_txt.includes('21:00:00')).slice(0, 7);
    
    // Update forecast to match provided style
    const forecastElement = document.getElementById(forecastElementId);
    forecastElement.innerHTML = dailyForecasts.map((day, index) => {
      const evening = eveningForecasts[index] || {};
      const date = new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      return `
        <div class="bg-${index % 2 === 0 ? 'orange' : 'green'}-100 p-4 rounded">
          <p><strong>${date}:</strong> ${day.weather[0].description}, high ${day.main.temp_max}°F, low ${day.main.temp_min}°F, ${day.wind.speed} mph, ${day.pop * 100}% chance of showers. Evening (7pm-11pm): ${evening.weather ? evening.weather[0].description : 'N/A'}, ${evening.main ? evening.main.temp : 'N/A'}°F, ${evening.wind ? evening.wind.speed : 'N/A'} mph.</p>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error fetching weather:', error);
    document.getElementById(currentElementId).innerText = 'Error loading weather data';
    document.getElementById(forecastElementId).innerHTML = '<p>Error loading forecast</p>';
  }
}

// Fetch weather for both locations on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchWeather('Conroe', conroeLat, conroeLon, 'conroe-current', 'conroe-forecast');
  fetchWeather('Coldspring', coldspringLat, coldspringLon, 'coldspring-current', 'coldspring-forecast');
});
