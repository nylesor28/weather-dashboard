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
var uvIndexEl = document.querySelector("#uv-index");

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
  weatherIconEl.textContent="";
  tempEl.textContent = "";
  windEl.textContent = "";
  humidityEl.textContent = "";
  fiveDayContainerEl.textContent = "";
  uvIndexEl.textContent =""
  uvIndexEl.setAttribute("class", " ")
  toggleForecastSection(false);
};

var toggleForecastSection = function (toggle) {
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
        resetElements()
        getWeather(this.textContent);
    });
  }
};

var fetchCityForecast =  function (city) {
  var weatherAPIURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=imperial`;

  return fetch(weatherAPIURL).then(function (response) {
    return response.json();
  });
};
var getWeather = async function (city) {
  var searchedComplete = false;
  resetElements();
  const iconURL = " http://openweathermap.org/img/w/";

  //get forecast for for searched city
  var currentData = await (fetchCityForecast(city));
    if(currentData.cod != "200"){
         alert(currentData.message);
         toggleForecastSection(searchedComplete);
        return searchedComplete;
     }
     
  //display current weather information
  searchCityEl.textContent = currentData.name;
  var currentDate = `(${formatDate(new Date(currentData.dt * 1000))})`;
  todayDateEl.textContent = currentDate;
  tempEl.textContent = currentData.main.temp+ " "+	String.fromCharCode(176)+ "F";
  windEl.textContent = currentData.wind.speed + " MPH";
  humidityEl.textContent = currentData.main.humidity + "%";

  var iconImgUrl = `${iconURL}${currentData.weather[0].icon}.png`;

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

  var uvi = 
      (await fetchAllForecast(currentData.coord.lat, currentData.coord.lon))
        .current.uvi
    

  uvIndexEl.textContent = uvi;

  var uviRounded = Math.floor(uvi)

  if (uviRounded >= 0 && uviRounded <= 2) {
    uvIndexEl.setAttribute("class", "low")
  } else if (uviRounded >= 3 && uviRounded <= 5) {
    uvIndexEl.setAttribute("class", "moderate")
  } else if (uviRounded >= 6 && uviRounded <= 7) {
    uvIndexEl.classList.add("high");
  } else if (uviRounded >= 8 && uviRounded <= 10) {
    uvIndexEl.setAttribute("class", "severe")
  } else if (uviRounded >= 11) {
    uvIndexEl.setAttribute("class", "extreme")
  }

  fiveDayContainerEl.textContent = "";
  for (var i = 1; i < 6; i++) {
    var dailyInfo = allForecastData.daily[i];
    var daytime = `${formatDate(new Date(dailyInfo.dt * 1000))}`;
    var dayTemp = dailyInfo.temp.day + " "+	String.fromCharCode(176)+ "F";
    var dayWind = dailyInfo.wind_speed + " MPH" ;
    var dayHumidity = dailyInfo.humidity + "%";
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
  }
  fiveDayForecastEl.classList.remove("d-none");
  toggleForecastSection(searchedComplete);
  return searchedComplete;
};

var loadPage = function () {
    var setToggle = false;
  loadHistory(savedHistoryKey);
  setToggle = getWeather(initialCity);

  if(!setToggle){
        alert("Please Input a valid City!");
        return
   };

   toggleForecastSection(setToggle);
  
};

loadPage();

var searchButtonClicked = async function(city){
    var setToggle = false;
    resetElements();

    setToggle =  await getWeather(city);
    if (setToggle===true) {
      historyArray.push(city);
      setLocalStorage(savedHistoryKey, historyArray);
      loadHistory(savedHistoryKey);
      toggleForecastSection(setToggle);
    }
}

btnSearch.addEventListener("click", function () {
    var city = inputSearchEl.value.trim();
    if (!city) {
      alert("Please Input a valid City!");
      inputSearchEl.value="";
      inputSearchEl.focus();
      return;
    }
    searchButtonClicked(city)
    inputSearchEl.value="";
});