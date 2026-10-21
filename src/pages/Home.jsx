
import { useState } from "react";

function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function getWeather(e) {
    e.preventDefault();

    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const locationResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      if (!locationResponse.ok) {
        throw new Error("Unable to search for the city.");
      }

      const locationData = await locationResponse.json();

      if (!locationData.results?.length) {
        throw new Error("City not found. Please try another city.");
      }

      const place = locationData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
      );

      if (!weatherResponse.ok) {
        throw new Error("Unable to get weather data.");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        city: place.name,
        country: place.country,
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
        code: weatherData.current.weather_code,
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="weather-app">
      <h1>🌦️ Weather Checker</h1>
      <p>Check the weather in your city</p>

      <form onSubmit={getWeather}>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Check Weather"}
        </button>
      </form>

      {error && <p>{error}</p>}

      {weather && (
        <div className="weather-result">
          <h2>{weather.city}, {weather.country}</h2>
          <h3>{weather.temperature}°C</h3>
          <p>Weather code: {weather.code}</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Wind speed: {weather.wind} km/h</p>
        </div>
      )}
    </div>
  );
}

export default Home;
