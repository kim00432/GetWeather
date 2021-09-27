import { DEFAULT_OPTIONS, getForecast, createWeatherIcon } from './weather.service.js';
import { getGeolocation, getLocationName } from './map.service.js';

const body = document.body
const searchedLocation = document.getElementById("searchInput")
const searchForm = document.getElementById('form')
const currentButton = document.getElementById("current")
const hourlyButton = document.getElementById("hourly")
const dailyButton = document.getElementById("daily")
const currentInfo = document.querySelector(".currentInfo")
const hourlyInfo = document.querySelector(".hourlyInfo")
const dailyInfo = document.querySelector(".dailyInfo")

const app = {
  location: "Nepean", //default
  init: async function() {
    let weatherData = JSON.parse(localStorage.getItem("weather-data"))
    //if there isn't anything in local storage, default location will be shown up   
    if (!weatherData) {
      console.log("Default location: ", app.location)
      app.getWeatherData(app.location)
    } else {
      //new data update
      const lat = weatherData.lat
      const lon = weatherData.lon
      const coord = {lat, lon}
      const forecast = await getForecast({coord})
      localStorage.setItem("weather-data", JSON.stringify(forecast))
      await app.getLocalStorageData()
    }
  
    app.addEventListeners() 
    await app.getCurrentLocation()
    setInterval(app.init, 1800000) //update data per 30 min
  },
  getCurrentLocation: (ev) => {
    let opts = {
      enableHighAccuracy: true,
      timeout: 1000 * 10, //10 seconds
      maximumAge: 1000 * 60 * 5, //5 minutes 
    };
    navigator.geolocation.getCurrentPosition(app.ftw, app.wtf, opts);
  },
  ftw: (pos) => {
    //got position
    let lat = pos.coords.latitude
    let lon = pos.coords.longitude
    DEFAULT_OPTIONS.coord = { lat: lat, lon: lon }
    console.log(DEFAULT_OPTIONS)
  },
  wtf: (err) => {
    console.error(err);   //geolocation failed
  },
  addEventListeners: () => {
    //click events
    let autocomplete = new google.maps.places.Autocomplete(searchedLocation)
    currentButton.addEventListener("click", app.clickCurrentLocation)
    hourlyButton.addEventListener("click", (ev) => {
      ev.preventDefault()
      dailyInfo.classList.add("hidden")
      dailyButton.classList.remove("hidden")
      hourlyButton.classList.add("hidden")
      hourlyInfo.classList.remove("hidden")
    })
    dailyButton.addEventListener("click", (ev) => {
      ev.preventDefault()
      dailyInfo.classList.remove("hidden")
      dailyButton.classList.add("hidden")
      hourlyButton.classList.remove("hidden")
      hourlyInfo.classList.add("hidden")
    })
    //get a search location 
    searchedLocation.addEventListener("click", (ev) => {
      ev.preventDefault();
      autocomplete.addListener("place_changed", function () {
        app.location = searchedLocation.value 
        console.log("Search location :", app.location)
        searchForm.addEventListener("submit", app.getWeatherData(app.location))
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          // User entered the name of a Place that was not suggested and
          // pressed the Enter key, or the Place Details request failed.
          window.alert("No details available for input: '" + place.name + "'");
          return;
        }
      searchForm.reset();
    })
    //if the data in LocalStorage was updated on a different tab, update the current tab
     window.addEventListener('storage', () => {
        app.getLocalStorageData()
    })
  })
},
  //click the current location icon
  clickCurrentLocation: async function (ev) {
    ev.preventDefault()
    const currentCityName = await getLocationName(DEFAULT_OPTIONS.coord)
    const forecast = await getForecast(DEFAULT_OPTIONS.coord)
    localStorage.setItem("location", currentCityName)
    localStorage.setItem("weather-data", JSON.stringify(forecast))
    await app.getLocalStorageData()
    // console.log(forecast)
  },
  //get location's weather data from api server 
  getWeatherData: async function (location) {
    const coord = await getGeolocation(location)
    const forecast = await getForecast({coord}) 
    localStorage.setItem("weather-data", JSON.stringify(forecast))
    localStorage.setItem("location", location)
    await app.getLocalStorageData()
  },
  //get data from local storage
  getLocalStorageData: () => {
    let weatherData = JSON.parse(localStorage.getItem("weather-data"))  
    console.log(weatherData)
    app.currentWeatherInfo(weatherData)
    app.hourlyWeatherInfo(weatherData)
    app.dailyWeatherInfo(weatherData)
    app.changeBackground(weatherData.current.weather[0].main)
  },
  capitalizeFirstLetter: (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  //current weather info 
  currentWeatherInfo: (data) => {
    let img = createWeatherIcon(data.current.weather[0].icon, data.current.weather[0].main)
    let locationDisplay = localStorage.getItem("location").split(",")
  
    //updated time - local, current
    const dt = new Date(data.current.dt * 1000).toLocaleString('en-US', {  weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: `${data.timezone}`, timeZoneName: "short" }).slice(0, 28)
    const dt2 = new Date(data.current.dt * 1000).toLocaleString('en-US', {  weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).slice(0, 25)
    
    localStorage.setItem("local-date", dt)
    localStorage.setItem("current-date", dt2)

    let sr = new Date(data.current.sunrise * 1000).toLocaleString('en-US', {  hour: "2-digit", minute: "2-digit", timeZone: `${data.timezone}` })
    let ss = new Date(data.current.sunset * 1000).toLocaleString('en-US', {  hour: "2-digit", minute: "2-digit", timeZone: `${data.timezone}` })

    let div = document.createElement("div")
    div.innerHTML = `
    <span class="current-time">${dt}</span>
    <div class="currentInfoCard">
        <h5 class="current-title"><i class="material-icons location_on">location_on</i>${locationDisplay[0]}</h5>
        <div class="current-main">
          <div class="current-image">
            <img src="${img.src}" alt="${img.alt}" class="current-image">
          </div>
          <div class="current-info1">
            <h4 class="temp">${data.current.temp}&degC</h4>
            <div class="description">
              <span class="text">Feels like: ${data.current.feels_like}&degC</span> 
              <span class="text">${app.capitalizeFirstLetter(data.current.weather[0].description)}</span>
            </div>
          </div>
        </div>
        <div class="current-info2">
          <div class="current-info2-detail">
            <div class="current-info2-title">Humidity</div>
            <div>${data.current.humidity}%</div>
          </div>
          <div class="current-info2-detail">
            <div class="current-info2-title">Wind</div>
            <div>${(data.current.wind_speed).toFixed(2)}m/s</div>
          </div>
          <div class="current-info2-detail">
            <div class="current-info2-title">Pressure</div>
            <div>${data.current.pressure}hPa</div>
          </div>
          <div class="current-info2-detail">
            <div class="current-info2-title">UV Index</div>
            <div>${Math.ceil(data.current.uvi)}</div>
          </div>
          <div class="current-info2-detail">
            <div class="current-info2-title">Sunrise</div>
            <div>${sr}</div>
          </div>
          <div class="current-info2-detail">
            <div class="current-info2-title">Sunset</div>
            <div>${ss}</div>
          </div>
        </div>
     </div>
    `
    //clean up the page
    currentInfo.innerHTML = " " 
    currentInfo.append(div)
  },
  //hourly weather info 
  hourlyWeatherInfo: (data) =>{
    hourlyInfo.innerHTML = " "
    let div = document.createElement("div")
    div.setAttribute("class", "hourlyForecast")
    div.innerHTML= `<img src="https://img.icons8.com/material-outlined/20/000000/clock--v1.png" alt="clock"/>Hourly Forecast`

    let div1 = document.createElement("div")
    div1.setAttribute("class", "hourlyInfoCards")

    //hourly info based on local time
    const str = new Date().toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: `${data.timezone}` })
    let arr = []
    for (let i = 1; i < 7; i++) {
      const dt = parseInt(str) + i
      arr.push(dt)
      let newDt
      arr.forEach((dt) => {
        if (dt > 12 && dt < 24) newDt = dt - 12 + "pm" 
        else if (dt == 12) newDt = dt + "pm"
        else if (dt == 24) newDt = dt - 12 + "am"
        else if (dt > 24) newDt = dt - 24 + "am"
        else newDt = dt + "am"
      })

      let div2 = document.createElement("div")
      div2.setAttribute("class", "hourlyInfoCard")
      let img = createWeatherIcon(data.hourly[i].weather[0].icon, data.hourly[i].weather[0].main)
      div2.innerHTML = `
        <div class="info-body">
          <h5 class="info-title">${newDt}</h5>
          <img src="${img.src}" class="weatherIcon" alt="${img.alt}">
          <p class="info-text">${data.hourly[i].temp}&degC</p>
        </div>
      `
      div1.append(div2)
      hourlyInfo.append(div, div1)
    }
  },
  //daily weather info
  dailyWeatherInfo: (data) => {
    dailyInfo.innerHTML= " "
    let div = document.createElement("div")
    div.setAttribute("class", "dailyForecast")
    div.innerHTML= `<img src="https://img.icons8.com/material-outlined/20/000000/clock--v1.png" alt="clock"/>Daily Forecast`
    let div1 = document.createElement("div")
    div1.setAttribute("class", "dailyInfoCards")
    
    for (let i = 1; i < 7; i++) {
      const dt = new Date(data.daily[i].dt * 1000).toLocaleString('en-US', {  weekday: "short", timeZone: `${data.timezone}` })
      let img = createWeatherIcon(data.daily[i].weather[0].icon, data.daily[i].weather[0].main)
      let div2 = document.createElement("div")
      div2.setAttribute("class", "dailyInfoCard")
      div2.innerHTML = `
        <div class="info-body">
          <h5 class="info-title">${dt}</h5>
          <img src="${img.src}" class="weatherIcon" alt="${img.alt}">
          <p class="info-text">${data.daily[i].temp.day}&degC</p>
        </div>
      `
      div1.append(div2)
      dailyInfo.append(div, div1)
      }
  },
  //change Background Image by weather 
  changeBackground: (data) => {
    switch (data) {
      case "Clear":
        body.style.backgroundImage= "url('https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=720')"
        break;
      case "Clouds":
        body.style.backgroundImage= "url('https://images.pexels.com/photos/53594/blue-clouds-day-fluffy-53594.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=720')"
        break;
      case "Rain":
      case "Drizzle":
        body.style.backgroundImage= "url('https://images.pexels.com/photos/2448749/pexels-photo-2448749.jpeg?auto=compress&cs=tinysrgb&w=720&h=750&dpr=2')"
        break;
      case "Fog":
      case "Haze":
      case "Smoke":
        body.style.backgroundImage= "url('https://images.pexels.com/photos/2556007/pexels-photo-2556007.jpeg?auto=compress&cs=tinysrgb&w=720&h=750&dpr=2')"
          break;
      case "Tornado":
        body.style.backgroundImage= "url('https://images.pexels.com/photos/9242484/pexels-photo-9242484.jpeg?auto=compress&cs=tinysrgb&w=720&h=750&dpr=2')"
            break;
      case "Snow":
        body.style.backgroundImage= "url('https://images.pexels.com/photos/1855221/pexels-photo-1855221.jpeg?auto=compress&cs=tinysrgb&w=720&h=750&dpr=2')"
        break;
      default:
        body.style.backgroundImage= "url('https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=720')"
        break;
    }
  },
}

document.addEventListener("DOMContentLoaded", app.init())
