const searchForm = document.querySelector(".search");
const cityInput = document.querySelector("#cityInput");
const inputError = document.querySelector("#inputError");
const cityElement = document.querySelector("#city");
const temperatureElement = document.querySelector("#temperature");
const conditionElement = document.querySelector("#condition");
const humidityElement = document.querySelector("#humidity");
const windElement = document.querySelector("#wind");
const weatherCard = document.querySelector(".weather-card");

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  clearError();

  if (!city) {
    showError("Please enter a city.");
    return;
  }

  getWeather(city);
});

cityInput.addEventListener("input", clearError);

function showError(message) {
  inputError.textContent = message;
  cityInput.classList.add("input-error-border");
  weatherCard.style.display = "none";
}

function clearError() {
  inputError.textContent = "";
  cityInput.classList.remove("input-error-border");
}

async function getWeather(city) {
  try {
    weatherCard.style.display = "none";

    const locationResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!locationResponse.ok) {
      throw new Error("Location request failed.");
    }

    const locationData = await locationResponse.json();

    if (!locationData.results?.length) {
      showError("City not found.");
      return;
    }

    const location = locationData.results[0];

    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );

    if (!weatherResponse.ok) {
      throw new Error("Weather request failed.");
    }

    const weatherData = await weatherResponse.json();

    displayWeather(location, weatherData);
    cityInput.value = "";
  } catch (error) {
    console.error(error);
    showError("Something went wrong. Please try again.");
  }
}

function displayWeather(location, weatherData) {
  const current = weatherData.current;

  cityElement.textContent = `${location.name}, ${location.country_code}`;
  temperatureElement.textContent = `${Math.round(current.temperature_2m)}°C`;
  conditionElement.textContent = getWeatherCondition(current.weather_code);
  humidityElement.textContent = `${current.relative_humidity_2m}%`;
  windElement.textContent = `${current.wind_speed_10m} km/h`;

  weatherCard.style.display = "block";
}

function getWeatherCondition(code) {
  const conditions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail"
  };

  return conditions[code] || "Unknown";
}
