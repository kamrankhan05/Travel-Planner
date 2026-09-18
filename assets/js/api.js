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


/**
 * Current weather + today's sunrise/sunset for a given lat/lon.
 * Source: Open-Meteo Weather API.
 */

async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=sunrise,sunset&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API request failed`);
    return res.json();
}

/**
 * Country details by ISO alpha-2 country code.
 * Source: REST Countries API v3.1. Field list is restricted to what we
 * actually render, to keep the response small.
 */

async function fetchCountry(countryCode) {
  const fields = 'name,capital,languages,currencies';
  const url = `https://restcountries.com/v3.1/alpha/${countryCode}?fields=${fields}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Country API request failed`);
  return await res.json();
}

/**
 * City photo gallery via Wikimedia Commons — free, no API key, CORS-enabled.
 * Pulls files from the city's Commons category (e.g. "Category:Paris").
 * Not every city has a populated category, so this can legitimately return [].
 */

async function fetchGallery(cityName, limit = 8) {
  const category = encodeURIComponent(`Category:${cityName}`);
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=${category}&gcmtype=file&gcmlimit=${limit}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=600&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gallery API request failed`);
  const data = await res.json();
  const pages = data.query?.pages;
  if (!pages) return [];

  return Object.values(pages)
   .filter((p) => p.imageinfo?.[0])
    .map((p) => {
      const info = p.imageinfo[0];
      const meta = info.extmetadata ?? {};
      return {
        thumbUrl: info.thumburl ?? info.url,
        fullUrl: info.url,
        title:(meta.ObjectName?.value ?? p.title ?? '')
         .replace(/^File:/, '')
          .replace(/\.\w{3,4}$/, ''),
        credit: stripHtml(meta.Artist?.value ?? meta.Credit?.value ?? 'Wikimedia Commons'),
      };
    });
}


/**
 * Nearby tourist attractions via Wikipedia's geosearch — free, no API key.
 * Returns notable landmarks/points of interest within radius of a coordinate,
 * enriched with a thumbnail and short extract from each article.
 */
async function fetchNearbyAttractions(lat, lon, limit = 6) {
  const geoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=9000&gslimit=${limit}&format=json&origin=*`;
  const geoRes = await fetch(geoUrl);
  if (!geoRes.ok) throw new Error('Attractions request failed');
  const geoData = await geoRes.json();
  const results = geoData.query?.geosearch ?? [];
  if (!results.length) return [];
 
  const pageIds = results.map((r) => r.pageid).join('|');
  const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageIds}&prop=pageimages|extracts&exintro=1&explaintext=1&exchars=160&piprop=thumbnail&pithumbsize=400&format=json&origin=*`;
  const detailRes = await fetch(detailUrl);
  const detailData = await detailRes.json();
  const pages = detailData.query?.pages ?? {};
 
  return results.map((r) => {
    const page = pages[r.pageid];
    return {
      title: r.title,
      distanceMeters: r.dist,
      thumbUrl: page?.thumbnail?.source ?? null,
      extract: page?.extract ?? '',
      wikiUrl: `https://en.wikipedia.org/?curid=${r.pageid}`,
    };
  });
}

/**
 * Orchestrates the full search for a single city, with caching. Weather,
 * country, gallery, and attractions all fetch in parallel once geocoding
 * resolves the coordinates/country code — one failing doesn't block the rest.
 */
async function fetchDestinationData(city) {
  const cached = getCached(city);
  if (cached) return cached;
 
  const geo = await fetchGeocoding(city);
  if (!geo) return null;
 
  const [weather, country, gallery, attractions] = await Promise.allSettled([
    fetchWeather(geo.latitude, geo.longitude),
    fetchCountry(geo.country_code),
    fetchCityGallery(geo.name),
    fetchNearbyAttractions(geo.latitude, geo.longitude),
  ]);
 
  const result = {
    geo,
    weather: weather.status === 'fulfilled' ? weather.value : null,
    country: country.status === 'fulfilled' ? country.value : null,
    gallery: gallery.status === 'fulfilled' ? gallery.value : [],
    attractions: attractions.status === 'fulfilled' ? attractions.value : [],
  };
 
  setCached(city, result);
  return result;
}