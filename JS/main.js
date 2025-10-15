const apiKey = "dbe2120a513fa445525b184ca47fc820";
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherBox = document.getElementById("weather");
const locationBtn = document.getElementById("locationBtn");
const loader = document.getElementById("loader");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

// Load search history
let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
renderHistory();

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city === "") return alert("Please enter a city name");
  getWeather(city);
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      () => alert("Location access denied.")
    );
  } else {
    alert("Geolocation not supported in your browser.");
  }
});

async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  await fetchWeather(url, city);
}

async function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  await fetchWeather(url, "My Location");
}

async function fetchWeather(url, city) {
  try {
    loader.style.display = "block";
    weatherBox.classList.remove("active");

    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");

    const data = await res.json();

    document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("temp").textContent = `${data.main.temp} °C`;
    document.getElementById("desc").textContent = data.weather[0].description;
    document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById("wind").textContent = `Wind: ${data.wind.speed} m/s`;
    document.getElementById("icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    setTimeout(() => {
      loader.style.display = "none";
      weatherBox.classList.add("active");
    }, 500);

    addToHistory(data.name);
    changeBackground(data.weather[0].main);
  } catch (error) {
    loader.style.display = "none";
    alert(error.message);
  }
}

function addToHistory(city) {
  if (!history.includes(city)) {
    history.push(city);
    if (history.length > 10) history.shift(); // Keep max 10
    localStorage.setItem("weatherHistory", JSON.stringify(history));
    renderHistory();
  }
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;

    const del = document.createElement("span");
    del.textContent = "❌";
    del.style.cursor = "pointer";
    del.onclick = (e) => {
      e.stopPropagation();
      history = history.filter((c) => c !== city);
      localStorage.setItem("weatherHistory", JSON.stringify(history));
      renderHistory();
    };

    li.appendChild(del);
    li.onclick = () => getWeather(city);
    historyList.appendChild(li);
  });
}

clearHistoryBtn.addEventListener("click", () => {
  history = [];
  localStorage.removeItem("weatherHistory");
  renderHistory();
});

function changeBackground(weather) {
  const body = document.body;

  switch (weather.toLowerCase()) {
    case "clear":
      body.style.background = "linear-gradient(135deg, #f6d365, #fda085)";
      break;
    case "clouds":
      body.style.background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
      break;
    case "rain":
      body.style.background = "linear-gradient(135deg, #667db6, #0082c8)";
      break;
    case "snow":
      body.style.background = "linear-gradient(135deg, #e0eafc, #cfdef3)";
      break;
    case "thunderstorm":
      body.style.background = "linear-gradient(135deg, #373b44, #4286f4)";
      break;
    default:
      body.style.background = "linear-gradient(135deg, #4facfe, #00f2fe)";
  }

  body.style.backgroundSize = "400% 400%";
  body.style.transition = "background 1s ease";
}
