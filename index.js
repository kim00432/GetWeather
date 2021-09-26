import { DEFAULT_OPTIONS, getForecast, createWeatherIcon } from './weather.service.js';
import { getGeolocation, getGeolocationInfo } from './map.service.js';

const searchedLocation = document.getElementById("searchInput")
const searchForm = document.getElementById('form')
const currentButton = document.getElementById("current")
const hourlyButton = document.getElementById("hourly")
const dailyButton = document.getElementById("daily")
const currentInfo = document.querySelector(".currentInfo")
const hourlyInfo = document.querySelector(".hourlyInfo")
const dailyInfo = document.querySelector(".dailyInfo")
const body = document.body

const app = {
  location: "Toronto",
  init: async function() {
    let locationName = JSON.parse(localStorage.getItem("location"))
    let weatherData = JSON.parse(localStorage.getItem("weather-data"))
    
    if (!locationName) {
      console.log("It's default", app.location)
      app.getWeatherData(app.location)
    } else {
      console.log("Local storage location:", locationName.City)
      //New data update
      const lat = weatherData.lat
      const lon = weatherData.lon
      const coord = {lat, lon}
      const forecast = await getForecast({coord})
      localStorage.setItem("weather-data", JSON.stringify(forecast))
      await app.getLocalStorageData()
    }
  
    app.addEventListeners() 
    await app.getCurrentLocation()
    setInterval(app.init, 100000) //update data after 100000 seconds 
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
    // Get a search location 
    searchForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      console.log("Search location :", searchedLocation.value)
      app.getWeatherData(searchedLocation.value)
      searchForm.reset();
    })
    
  //   let autocomplete = new google.maps.places.Autocomplete(searchedLocation)
  //   autocomplete.addListener('place_changed', function() {
  //     let locale = autocomplete.getPlace();
  //     // console.log(locale)
  //     // console.log(locale.geometry.location.lat(), locale.geometry.location.lng()) // Latitude and Longitude - if you need them
  // });
    //If the data in LocalStorage was updated on a different tab, update the current tab
     window.addEventListener('storage', () => {
        app.getLocalStorageData()
    });
  },
  // Click the current location icon
  clickCurrentLocation: async function (ev) {
    ev.preventDefault()
    const currentCityName = await getGeolocationInfo(DEFAULT_OPTIONS.coord)
    const forecast = await getForecast(DEFAULT_OPTIONS.coord)

    localStorage.setItem("location", JSON.stringify(currentCityName))
    localStorage.setItem("weather-data", JSON.stringify(forecast))
    await app.getLocalStorageData()

    console.log(forecast)
  },
  getWeatherData: async function (location) {
    const coord = await getGeolocation(location)
    const forecast = await getForecast({coord})
    const getCityName = await getGeolocationInfo(coord)  
    localStorage.setItem("weather-data", JSON.stringify(forecast))
    localStorage.setItem("location", JSON.stringify(getCityName))
    await app.getLocalStorageData()
  },
  // Get data from local storage
  getLocalStorageData: () => {
    let locationName = JSON.parse(localStorage.getItem("location"))
    let weatherData = JSON.parse(localStorage.getItem("weather-data"))
    
    app.currentWeatherInfo(locationName, weatherData)
    app.hourlyWeatherInfo(locationName, weatherData)
    app.dailyWeatherInfo(locationName, weatherData)
    app.changeBackground(weatherData.current.weather[0].main)
  },
  capitalizeFirstLetter: (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  // Current weather info 
  currentWeatherInfo: (location, data) => {
    let img = createWeatherIcon(data.current.weather[0].icon, data.current.weather[0].main)
    console.log(data.current)
  
    //Updated time - local, current
    const dt = new Date(data.current.dt * 1000).toLocaleString('en-US', {  weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: `${data.timezone}` }).slice(0, 25)
    const dt2 = new Date(data.current.dt * 1000).toLocaleString('en-US', {  weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).slice(0, 25)
    
    localStorage.setItem("local-date", dt)
    localStorage.setItem("current-date", dt2)

    let sr = new Date(data.current.sunrise * 1000).toLocaleString('en-US', {  hour: "2-digit", minute: "2-digit", timeZone: `${data.timezone}` })
    let ss = new Date(data.current.sunset * 1000).toLocaleString('en-US', {  hour: "2-digit", minute: "2-digit", timeZone: `${data.timezone}` })

    let div = document.createElement("div")
    div.innerHTML = `
    <span class="updatedTime">${dt}</span>
    <div class="currentInfoCard">
        <h5 class="current-title"><i class="material-icons location_on">location_on</i>${location.City}, ${location.Country}</h5>
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
            <div>Humidity</div>
            <img src="https://img.icons8.com/small/20/000000/hygrometer.png" alt="humidity"/>
            <div>${data.current.humidity}%</div>
          </div>
          <div class="current-info2-detail">
            <div>Wind</div>
            <img src="https://img.icons8.com/material/20/000000/near-me--v1.png" alt="wind"/>
            <div>${(data.current.wind_speed).toFixed(2)}m/s</div>
          </div>
          <div class="current-info2-detail">
            <div>Pressure</div>
            <img src="https://img.icons8.com/material/20/000000/barometer-gauge.png" alt="pressure"/>
            <div>${data.current.pressure}hPa</div>
          </div>
          <div class="current-info2-detail">
            <div>UV Index</div>
            <img src="https://img.icons8.com/material/20/000000/summer.png" alt="uni"/>
            <div>${Math.ceil(data.current.uvi)}</div>
          </div>
          <div class="current-info2-detail">
            <div>Sunrise</div>
            <img src="https://img.icons8.com/material/20/000000/sunrise.png" alt="sunrise"/>
            <div>${sr}</div>
          </div>
          <div class="current-info2-detail">
            <div>Sunset</div>
            <img src="https://img.icons8.com/material/20/000000/sunset.png" alt="sunset"/>
            <div>${ss}</div>
          </div>
        </div>
     </div>
    `
    //clean up the page
    currentInfo.innerHTML = " " 
    currentInfo.append(div)
    console.log(location, data)
  } ,
  // Hourly weather info 
  hourlyWeatherInfo: (location, data) =>{
    hourlyInfo.innerHTML = " "
    let div = document.createElement("div")
    div.setAttribute("class", "hourlyForecast")
    div.innerHTML= `<img src="https://img.icons8.com/material-outlined/20/000000/clock--v1.png" alt="clock"/>Hourly Forecast`

    let div1 = document.createElement("div")
    div1.setAttribute("class", "hourlyInfoCards")

    // hourly info based on local time
    const str = new Date().toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: `${data.timezone}` })
    let arr = []
    for (let i = 1; i < 7; i++) {
      const dt = parseInt(str) + i
      arr.push(dt)
      console.log(arr)

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
    console.log(location, data.hourly)
  },
  // daily weather info
  dailyWeatherInfo: (location, data) => {
    dailyInfo.innerHTML= " "
    let div = document.createElement("div")
    div.setAttribute("class", "dailyForecast")
    div.innerHTML= `<img src="https://img.icons8.com/material-outlined/20/000000/clock--v1.png" alt="clock"/>Daily Forecast`
    let div1 = document.createElement("div")
    div1.setAttribute("class", "dailyInfoCards")
    
    for (let i = 1; i < 7; i++) {
      const dt = new Date(data.daily[i].dt * 1000).toLocaleString('en-US', {  weekday: "short", month: "short", day: "numeric", timeZone: `${data.timezone}` })
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
    console.log(location, data.daily)
  },
  //change Background Image
  changeBackground: (data) => {
    console.log(data)
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
  }
}

document.addEventListener("DOMContentLoaded", app.init())
