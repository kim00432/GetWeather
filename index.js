import { DEFAULT_OPTIONS, getForecast, createWeatherIcon } from './weather.service.js';
import { getGeolocation } from './map.service.js';

const main = document.getElementById("root")
const searchedLocation = document.getElementById("searchInput")
const searchForm= document.getElementById('form')
const currentButton = document.getElementById("current")
const hourlyButton = document.getElementById("hourly")
const dailyButton = document.getElementById("daily")
const currentInfo = document.querySelector(".currentInfo")
const hourlyInfo = document.querySelector(".hourlyInfo")
const dailyInfo = document.querySelector(".dailyInfo")


// This is a demo of how to use the two API services.
// You should replace this with your own application logic.
const app = {
  location: "Toronto", //default
  init: async function() {
    try {
      const coord = await getGeolocation(location);

      //Store data in localStorage
      const forecast = await getForecast({ coord });
      localStorage.setItem("weather-data", JSON.stringify(forecast))
      localStorage.setItem("location", JSON.stringify(app.location))
      console.log(forecast);

      await app.getLocalStorageData()
  
    } catch (error) {
      console.log(error.message);
    }

    await app.getCurrentLocation()

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
    hourlyButton.addEventListener("click", (ev) => {
      ev.preventDefault()
      app.hourlyWeatherInfo()
    })
    dailyButton.addEventListener("click", (ev) => {
      ev.preventDefault()
      app.dailyWeatherInfo()
    })

  },

  // Get data from local storage
  getLocalStorageData() {
    let locationName = JSON.parse(localStorage.getItem("location"))
    let weatherData = JSON.parse(localStorage.getItem("weather-data"))
    
    app.hourlyWeatherInfo(locationName, weatherData.hourly)
    app.dailyWeatherInfo(locationName, weatherData.daily)
  },
  

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