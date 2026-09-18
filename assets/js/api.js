/**
 * api.js
 * All network requests live here, one function per API.
 *   - app.js is the only module that calls these functions.
 */
 
const cache = new Map();

function getCached(city) {
  return cache.get(city.toLowerCase());
}

function setCached(city, data) {
  cache.set(city.toLowerCase(), data);
}

 
/**
 * Geocoding — resolves a city name to coordinates, country, population, and
 * timezone in one call. Also doubles as the source for the Local Time card,
 * since Open-Meteo already returns an IANA timezone — no separate time API.
 * Source: Open-Meteo Geocoding API.
 */

async function fetchGeocoding(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding API request failed`);
  
  const data = await res.json();
  return data.results?.[0] ?? null;
}
