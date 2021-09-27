const API_TOKEN = 'pk.54e6bde995b733b937c5aa0d96961017';
const BASE_URL = 'https://us1.locationiq.com/v1';

export async function getGeolocation(location) {
  const url = `${BASE_URL}/search.php?key=${API_TOKEN}&q=${location}&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  return { lat: data[0].lat, lon: data[0].lon };
}

export async function getLocationName (location) {
  const url = `${BASE_URL}/reverse.php?key=${API_TOKEN}&lat=${location.lat}&lon=${location.lon}&format=json`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const data = await response.json()
  const city = JSON.stringify(data.address.city)
  const str = JSON.parse(city)
  
  console.log("Current location:", str)
  return str
}