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

var formatDate = function(date){
    return date.toLocaleDateString('en-US')
}

var setLocalStorage = function (key,value) {
    localStorage.setItem(key, JSON.stringify(value));
};

var getLocalStorage= function (key) {
    return (JSON.parse(localStorage.getItem(key)));
};

var getAllForecast= function(lat,lon){
    var exclusion = "minutely,hourly,alerts"
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
    const iconURL = " http://openweathermap.org/img/w/"

    //get forecast for for searched city
    var currentData =await getCityForecast(city);
    console.log("currentData: ", currentData)

    //display current weather information
    searchCityEl.textContent=currentData.name;
    var currentDate= `(${formatDate(new Date(currentData.dt*1000))})`
    todayDateEl.textContent=currentDate
    tempEl.textContent=currentData.main.temp;
    windEl.textContent=currentData.wind.speed
    humidityEl.textContent=currentData.main.humidity;

    var iconImgUrl = `${iconURL}${currentData.weather[0].icon}.png`
    console.log("imageIcon", iconImgUrl)

    weatherIconEl.textContent=""
    var img = document.createElement("img");
    img.setAttribute("src", iconImgUrl)
    img.setAttribute("alt", currentData.weather[0].description)
    weatherIconEl.appendChild(img)

    var allForecastData=await getAllForecast(currentData.coord.lat,currentData.coord.lon)
    console.log(allForecastData, allForecastData.lat)
    uvIndexEl.textContent =(await getAllForecast(currentData.coord.lat,currentData.coord.lon)).current.uvi;

    fiveDayContainerEl.textContent =""
    for(var i=1; i<6; i++){
        var dailyInfo = allForecastData.daily[i]
        var daytime = `${formatDate(new Date(dailyInfo.dt*1000))}`
        var dayTemp = dailyInfo.temp.day;
        var dayWind = dailyInfo.wind_speed
        var dayHumidity = dailyInfo.humidity;
        var dayIconLocation = `${iconURL}${dailyInfo.weather[0].icon}.png`;
        var dayIconDescription = dailyInfo.weather[0].description;

        // var fiveDay = 
        fiveDayContainerEl.innerHTML+=
        `
            <div class="five-day col-md-2">
                <p class="forecast-date">${daytime}</p>
                <p class="forecast-icon"><img src="${dayIconLocation}" alt="${dayIconDescription}"></p>
                <p>Temp: <span class="forecast-temp">${dayTemp}</span></p>
                <p>Wind: <span class="forecast-wind">${dayWind}</span></p>
                <p>Humidity: <span class="forecast-humidity">${dayHumidity}</span></p>
            </div>
        `
        // fiveDayContainerEl.append(fiveDay)
        console.log(i, daytime, dayTemp, dayWind, dayHumidity, dayIconLocation, dayIconDescription)
    }



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

 