const API_TOKEN = 'THIS_NEEDS_TO_BE_YOUR_API_KEY';
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