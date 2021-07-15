var inputSearchEl = document.querySelector("#city-input")
var btnSearch = document.querySelector(".btn-search")
var searchHistoryContainerEl = document.querySelector(".search-history-container")

var searchCityEl = document.querySelector(".searched-city")
var todayDateEl = document.querySelector(".today-date")
var weatherIconEl = document.querySelector(".weather-icon")

var tempEl = document.querySelector(".temp")
var windEl = document.querySelector(".wind")
var humidityEl = document.querySelector(".humidity")
var uvIndexEl = document.querySelector(".uv-index")

var fiveDayForecastEl = document.querySelector(".five-day-forecast")
var fiveDayContainerEl = document.querySelector(".five-day-container")

var openWeatherAPIURL = "https://api.openweathermap.org/data/2.5/onecall?"
var apikey="deb384ba8b93ecfc669990c7064f55ad"

var historyArray=[]

var setLocalStorage = function (key,value) {
    localStorage.setItem(key, JSON.stringify(value));
};

var getLocalStorage= function (key) {
    return (JSON.parse(localStorage.getItem(key)));
};

var getUVIndex= function(lat,lon){
    var exclusion = "minutely,hourly,daily,alerts"
    var units = "imperial"
    var apiURL = `${openWeatherAPIURL}lat=${lat}&lon=${lon}&exclude=${exclusion}&appid=${apikey}&units=${units}`
    console.log(apiURL)

        return  fetch(apiURL).then(function(response){
            return response.json();
            })
 
}

var getCityForecast= function(city){
    var weatherAPIURL =`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=imperial`;
    console.log(weatherAPIURL)

  return  fetch(weatherAPIURL).then(function(response){
    return response.json();
    })
}

var getWeather = async function(city){

    var currentData =await getCityForecast(city);
    console.log("currentData: ", currentData)
    searchCityEl.textContent=currentData.name;
    tempEl.textContent=currentData.main.temp;
    windEl.textContent=currentData.wind.speed
    humidityEl.textContent=currentData.main.humidity;

    var uvData=await getUVIndex(currentData.coord.lat,currentData.coord.lon)
    console.log(uvData, uvData.lat)
     uvIndexEl.textContent =( await getUVIndex(currentData.coord.lat,currentData.coord.lon)).current.uvi;

}

btnSearch.addEventListener("click", function(){

    var city = inputSearchEl.value.trim();
    if(!city){
        alert("Please Input a valid City!")
        inputSearchEl.focus();
        return;
    }
    getWeather(city);

})

 