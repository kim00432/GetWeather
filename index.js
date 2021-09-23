import { DEFAULT_OPTIONS, getForecast, createWeatherIcon } from './weather.service.js';
import { getGeolocation } from './map.service.js';

const main = document.getElementById("root")
const searchedLocation = document.getElementById("searchInput")
const searchForm = document.getElementById('form')
const currentButton = document.getElementById("current")
const hourlyButton = document.getElementById("hourly")
const dailyButton = document.getElementById("daily")
const currentInfo = document.querySelector(".currentInfo")
const hourlyInfo = document.querySelector(".hourlyInfo")
const dailyInfo = document.querySelector(".dailyInfo")


// This is a demo of how to use the two API services.
// You should replace this with your own application logic.
const app = {
  location: " ",
  init: async function() {
    let locationName = JSON.parse(localStorage.getItem("location"))
    
    if(!locationName) {
      locationName = "Nepean"
      const forecast = await getForecast(DEFAULT_OPTIONS.coord);
      localStorage.setItem("weather-data", JSON.stringify(forecast))
      localStorage.setItem("location",  JSON.stringify(locationName))
      console.log("default location :", locationName)
    }
    await app.getLocalStorageData()
    await app.getCurrentLocation() //ready to load 
    app.addEventListeners()
    
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
    //geolocation failed
    console.error(err);
  },
  addEventListeners: () => {
    currentButton.addEventListener("click", app.clickCurrentLocation)

    hourlyButton.addEventListener("click", (ev) => {
      ev.preventDefault()
      hourlyInfo.classList.remove("hidden")
      dailyInfo.classList.add("hidden")
    })
    dailyButton.addEventListener("click", (ev) => {
      ev.preventDefault()
      dailyInfo.classList.remove("hidden")
      hourlyInfo.classList.add("hidden")
    })
    // Get a search location 
    searchForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      console.log("Search location :", searchedLocation.value)
      app.getWeatherData(searchedLocation.value)
      searchForm.reset();
    })
  },
  // Click the current location icon
  clickCurrentLocation: async function (ev) {
    ev.preventDefault()
    const forecast = await getForecast(DEFAULT_OPTIONS.coord)

    localStorage.setItem("weather-data", JSON.stringify(forecast))
    await app.getLocalStorageData()

    console.log(forecast)
  },
  getWeatherData: async function (location) {
    const coord = await getGeolocation(location)
    const forecast = await getForecast({coord})
    localStorage.setItem("location", JSON.stringify(location))
    localStorage.setItem("weather-data", JSON.stringify(forecast))
    await app.getLocalStorageData()
  },
  // Get data from local storage
  getLocalStorageData: () => {
    let locationName = JSON.parse(localStorage.getItem("location"))
    let weatherData = JSON.parse(localStorage.getItem("weather-data"))
    
    app.currentWeatherInfo(locationName, weatherData.current)
    app.hourlyWeatherInfo(locationName, weatherData.hourly)
    app.dailyWeatherInfo(locationName, weatherData.daily)
  },
  capitalizeFirstLetter: (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  
  // Current weather info 
  currentWeatherInfo: (location, data) => {
    let img = createWeatherIcon(data.weather[0].icon, data.weather[0].main)

    console.log(data)
  
    //Updated time 
    const dt = new Date(data.dt * 1000)+ ""
    let newDate = dt.slice(0, 21)
    localStorage.setItem("date", newDate)

    let sr = new Date(data.sunrise * 1000).toTimeString()
    let ss = new Date(data.sunset * 1000).toTimeString()
  
    const visibility = (data.visibility / 1000).toFixed(1) + "km"
    
  
    let div = document.createElement("div")
    div.innerHTML = `
    <span class="updatedTime">Last updated: ${newDate}</span>
    <div class="currentInfoCard">
        <h5 class="current-title"><i class="material-icons location_on">location_on</i>${location.City}, ${location.Country}</h5>
        <div class="current-main">
          <div class="current-image">
            <img src="${img.src}" alt="${img.alt}" class="current-image">
          </div>
          <div class="current-info1">
            <h4 class="temp">${data.temp}&degC</h4>
            <div>
              <div class="text">Feels like: ${data.feels_like}&degC</div> 
              <div class="text">${app.capitalizeFirstLetter(data.weather[0].description)}</div>
            </div>
          </div>
        </div>
        <div class="current-info2">
          <div class="current-info2-detail">
            <div>Humidity</div>
            <img src="https://img.icons8.com/small/24/000000/hygrometer.png"/>
            <div>${data.humidity}%</div>
          </div>
          <div class="current-info2-detail">
            <div>Wind</div>
            <img src="https://img.icons8.com/material/24/000000/near-me--v1.png"/>
            <div>${(data.wind_speed).toFixed(2)}m/s</div>
          </div>
          <div class="current-info2-detail">
            <div>Pressure</div>
            <img src="https://img.icons8.com/material/24/000000/barometer-gauge.png"/>
            <div>${data.pressure}hPa</div>
          </div>
          <div class="current-info2-detail">
            <div>UV Index</div>
            <img src="https://img.icons8.com/material/24/000000/summer.png"/>
            <div>${Math.ceil(data.uvi)}</div>
          </div>
          <div class="current-info2-detail">
            <div>Sunrise</div>
            <div>${sr}</div>
            <div>Sunset</div>
            <div>${ss}</div>
          </div>
        </div>
     </div>
    `
    //clean up the page
    currentInfo.innerHTML = " " 
    currentInfo.append(div)
    console.log(location, data, newDate)
  } ,
  // Hourly weather info 
  hourlyWeatherInfo: (location, data) =>{
    hourlyInfo.innerHTML = " "
    let div = document.createElement("div")
    div.setAttribute("class", "hourlyInfoCards")
    for (let i = 1; i < 7; i++) {
      const dt = new Date(data[i].dt * 1000).getHours()
      let newDt
      if (dt > 12) newDt = dt - 12 + "pm"
      else newDt = dt + "am"
      
      let div2 = document.createElement("div")
      div2.setAttribute("class", "hourlyInfoCard")
      let img = createWeatherIcon(data[i].weather[0].icon, data[i].weather[0].main)
      div2.innerHTML = `
        <div class="info-body">
          <h5 class="info-title">${newDt}</h5>
          <img src="${img.src}" class="weatherIcon" alt="${img.alt}">
          <p class="info-text">${data[i].temp}&degC</p>
        </div>
      `
      div.append(div2)
      hourlyInfo.append(div)
    }
    console.log(location, data)
  },
  // daily weather info
  dailyWeatherInfo: (location, data) => {
  dailyInfo.innerHTML= " "
  let div = document.createElement("div")
  div.setAttribute("class", "dailyInfoCards")
  for (let i = 1; i < 7; i++) {
    const dt = new Date(data[i].dt * 1000).getDay()
    
    let newDt
    if (dt == 0) newDt = "Sun"
    else if (dt == 1) newDt = "Mon"
    else if (dt == 2) newDt = "Tue"
    else if (dt == 3) newDt = "Wed"
    else if (dt == 4) newDt = "Thu"
    else if (dt == 5) newDt = "Fri"
    else if (dt == 6) newDt = "Sat"
    else newDt = "NaN"
    
    let img = createWeatherIcon(data[i].weather[0].icon, data[i].weather[0].main)
    let div2 = document.createElement("div")
    div2.setAttribute("class", "dailyInfoCard")
    div2.innerHTML = `
      <div class="info-body">
        <h5 class="info-title">${newDt}</h5>
        <img src="${img.src}" class="weatherIcon" alt="${img.alt}">
        <p class="info-text">${data[i].temp.day}&degC</p>
      </div>
    `
    div.append(div2)
    dailyInfo.append(div)
    }
    console.log(location, data)
  }
}

document.addEventListener("DOMContentLoaded", app.init())