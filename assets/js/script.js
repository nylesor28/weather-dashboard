var inputSearchEl = document.querySelector("#city-input");
var btnSearch = document.querySelector(".btn-search");
var searchHistoryContainerEl = document.querySelector(
  ".search-history-container"
);
var forcastSectionEl = document.querySelector(".forecast-section");

var searchCityEl = document.querySelector(".searched-city");
var todayDateEl = document.querySelector(".today-date");
var weatherIconEl = document.querySelector(".weather-icon");

var tempEl = document.querySelector(".temp");
var windEl = document.querySelector(".wind");
var humidityEl = document.querySelector(".humidity");
var uvIndexEl = document.querySelector(".uv-index");

var fiveDayForecastEl = document.querySelector(".five-day-forecast");
var fiveDayContainerEl = document.querySelector(".five-day-container");

var openWeatherAPIURL = "https://api.openweathermap.org/data/2.5/onecall?";
var apikey = "deb384ba8b93ecfc669990c7064f55ad";

var historyArray = [];
const savedHistoryKey = "savedCities";
const initialCity = "Hartford";

var formatDate = function (date) {
  return date.toLocaleDateString("en-US");
};

var resetElements = function () {
  searchCityEl.textContent = "";
  todayDateEl.textContent = "";
  tempEl.textContent = "";
  windEl.textContent = "";
  humidityEl.textContent = "";
  fiveDayContainerEl.textContent = "";

  toggleForecastSection(false);
};

var toggleForecastSection = function (toggle) {
  console.log(toggle);
  if (toggle) {
    forcastSectionEl.classList.remove("d-none");
  } else {
    forcastSectionEl.classList.add("d-none");
    fiveDayForecastEl.classList.add("d-none");
  }
};

var setLocalStorage = function (key, value) {
  localStorage.setItem(key, JSON.stringify(value));
};

var getLocalStorage = function (key) {
  return JSON.parse(localStorage.getItem(key));
};

var fetchAllForecast = function (lat, lon) {
  var exclusion = "minutely,hourly,alerts";
  var units = "imperial";
  var apiURL = `${openWeatherAPIURL}lat=${lat}&lon=${lon}&exclude=${exclusion}&appid=${apikey}&units=${units}`;
  console.log(apiURL);

  return fetch(apiURL).then(function (response) {
    return response.json();
  });
};

var loadHistory = function (key) {
  searchHistoryContainerEl.textContent = "";
  historyArray = getLocalStorage(key) || [];
  for (var i = 0; i < historyArray.length; i++) {
    var city = historyArray[i].trim();
    var btn = document.createElement("button");
    btn.setAttribute("class", "btn btn-secondary btn-history");
    btn.textContent = city;
    searchHistoryContainerEl.appendChild(btn);
    btn.addEventListener("click", function () {
      getWeather(this.textContent);
    });
  }
};

var fetchCityForecast = function (city) {
  var weatherAPIURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=imperial`;
  console.log(weatherAPIURL);

  return fetch(weatherAPIURL).then(function (response) {
    return response.json();
  });
};
var getWeather = async function (city) {
  var searchedComplete = false;
  const iconURL = " http://openweathermap.org/img/w/";

  //get forecast for for searched city
  var currentData = await fetchCityForecast(city);
  console.log("currentData: ", currentData);

  //display current weather information
  searchCityEl.textContent = currentData.name;
  var currentDate = `(${formatDate(new Date(currentData.dt * 1000))})`;
  todayDateEl.textContent = currentDate;
  tempEl.textContent = currentData.main.temp;
  windEl.textContent = currentData.wind.speed;
  humidityEl.textContent = currentData.main.humidity;

  var iconImgUrl = `${iconURL}${currentData.weather[0].icon}.png`;
  console.log("imageIcon", iconImgUrl);

  weatherIconEl.textContent = "";
  var img = document.createElement("img");
  img.setAttribute("src", iconImgUrl);
  img.setAttribute("alt", currentData.weather[0].description);
  weatherIconEl.appendChild(img);
  searchedComplete = true;
  var allForecastData = await fetchAllForecast(
    currentData.coord.lat,
    currentData.coord.lon
  );
  console.log(allForecastData, allForecastData.lat);

  var uvi = Math.floor(
    parseFloat(
      (await fetchAllForecast(currentData.coord.lat, currentData.coord.lon))
        .current.uvi
    )
  );
  uvIndexEl.textContent = uvi;

  if (uvi >= 0 && uvi <= 2) {
    uvIndexEl.classList.add("low");
  } else if (uvi >= 3 && uvi <= 5) {
    uvIndexEl.classList.add("moderate");
  } else if (uvi >= 6 && uvi <= 7) {
    uvIndexEl.classList.add("high");
  } else if (uvi >= 8 && uvi <= 10) {
    uvIndexEl.classList.add("severe");
  } else if (uvi >= 11) {
    uvIndexEl.classList.add("extreme");
  }

  fiveDayContainerEl.textContent = "";
  for (var i = 1; i < 6; i++) {
    var dailyInfo = allForecastData.daily[i];
    var daytime = `${formatDate(new Date(dailyInfo.dt * 1000))}`;
    var dayTemp = dailyInfo.temp.day;
    var dayWind = dailyInfo.wind_speed;
    var dayHumidity = dailyInfo.humidity;
    var dayIconLocation = `${iconURL}${dailyInfo.weather[0].icon}.png`;
    var dayIconDescription = dailyInfo.weather[0].description;

    fiveDayContainerEl.innerHTML += `
            <div class="five-day col-md-2">
                <p class="forecast-date label">${daytime}</p>
                <p class="forecast-icon"><img src="${dayIconLocation}" alt="${dayIconDescription}"></p>
                <p class="label">Temp: <span class="forecast-temp">${dayTemp}</span></p>
                <p class="label">Wind: <span class="forecast-wind">${dayWind}</span></p>
                <p class="label">Humidity: <span class="forecast-humidity">${dayHumidity}</span></p>
            </div>
        `;
    console.log(
      i,
      daytime,
      dayTemp,
      dayWind,
      dayHumidity,
      dayIconLocation,
      dayIconDescription
    );
  }
  fiveDayForecastEl.classList.remove("d-none");
};

var loadPage = function () {
  resetElements();
  toggleForecastSection(getWeather(initialCity));
  loadHistory(savedHistoryKey);
};

loadPage();

btnSearch.addEventListener("click", function () {
  var setToggle = false;
  resetElements();
  var city = inputSearchEl.value.trim();
  if (!city) {
    alert("Please Input a valid City!");
    inputSearchEl.focus();
    return;
  }
  setToggle = getWeather(city);
  if (setToggle) {
    historyArray.push(city);
    setLocalStorage(savedHistoryKey, historyArray);
    loadHistory(savedHistoryKey);
    toggleForecastSection(setToggle);
  }
});