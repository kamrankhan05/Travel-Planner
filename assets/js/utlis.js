/**
 * utils.js
 * Reusable, dependency-free helper functions.
 * No DOM access and no fetch calls belong here — pure functions only.
 */

/**
 * Formats a Date object as a readable local time string, e.g. "14:32".
 * Will be used once real timezone data arrives from api.js (Phase 3).
 */
function formatTime(date, timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(date);
}

/**
 * Formats a Date object as a readable date string, e.g. "Thursday, 31 July".
 */
function formatDate(date, timeZone) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone,
  }).format(date);
}

/**
 * Rounds a temperature to the nearest whole degree and appends the unit.
 */
function formatTemp(value, unit = 'C') {
  return `${Math.round(value)}°${unit}`;
}

/**
 * Converts wind speed or similar metric values with a fixed unit label.
 */
function formatMetric(value, unit) {
  return `${value} ${unit}`;
}

/**
 * Formats a latitude/longitude pair, e.g. "48.8566° N, 2.3522° E".
 */
function formatCoordinates(lat, lon) {
  const latLabel = lat >= 0 ? 'N' : 'S';
  const lonLabel = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latLabel}, ${Math.abs(lon).toFixed(4)}° ${lonLabel}`;
}

/**
 * Formats a number with locale-aware thousands separators, e.g. 2102650 -> "2,102,650".
 */
function formatPopulation(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Converts an ISO 3166-1 alpha-2 country code (e.g. "FR") to a flag emoji.
 */
function countryCodeToFlag(code) {
  if (!code || code.length !== 2) return '';
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

/**
 * Converts an Open-Meteo WMO weather code into a short human label.
 */
function weatherCodeToDescription(code) {
  const map = {
    0: 'Clear sky',
    1: 'Mostly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with hail',
  };
  return map[code] ?? 'Unknown';
}

/**
 * Extracts an "HH:MM" clock string from an Open-Meteo local ISO datetime
 * (already timezone-adjusted when the API is called with timezone=auto).
 */
function formatClockFromIso(iso) {
  if (!iso) return '—';
  return iso.slice(11, 16);
}

/**
 * Generates a packing checklist from current weather conditions.
 * Pure function: weather data in, list of {label, reason} out.
 */
function generatePackingList(weather) {
  if (!weather?.current) return [];

  const temp = weather.current.temperature_2m;
  const wind = weather.current.wind_speed_10m;
  const code = weather.current.weather_code;
  const isWet = (code >= 51 && code <= 82) || (code >= 95 && code <= 99);
  const items = [];

  if (temp < 5) {
    items.push({ label: 'Heavy coat', reason: `It's ${formatTemp(temp)} — proper insulation matters` });
    items.push({ label: 'Gloves & wool hat', reason: 'Below 5° — extremities need cover' });
  } else if (temp < 15) {
    items.push({ label: 'Warm jacket', reason: `Cool at ${formatTemp(temp)} — layer up` });
    items.push({ label: 'Scarf', reason: 'Good for chilly mornings and evenings' });
  } else if (temp < 23) {
    items.push({ label: 'Light jacket or layers', reason: `Mild, ${formatTemp(temp)} — layers give flexibility` });
  } else if (temp < 30) {
    items.push({ label: 'Breathable clothing', reason: `Warm at ${formatTemp(temp)}` });
    items.push({ label: 'Sunscreen', reason: 'Worth it whenever it\u2019s this warm' });
  } else {
    items.push({ label: 'Lightweight, breathable fabrics', reason: `Hot — ${formatTemp(temp)}` });
    items.push({ label: 'Sun hat & extra water', reason: 'Stay ahead of the heat' });
  }

  if (isWet) {
    items.push({ label: 'Compact umbrella', reason: `${weatherCodeToDescription(code)} expected` });
    items.push({ label: 'Waterproof shoes', reason: 'Keep feet dry while exploring' });
  }

  if (wind > 25) {
    items.push({ label: 'Windbreaker', reason: `Wind around ${formatMetric(Math.round(wind), 'km/h')}` });
  }

  items.push({ label: 'Comfortable walking shoes', reason: 'Always worth it for a new city' });
  items.push({ label: 'Portable charger', reason: 'For maps, photos, and translation apps' });

  return items;
}

/**
 * Formats a REST Countries `languages` object as a short display string.
 * Some countries (e.g. India) list 20+ official languages — cap it so the
 * overview card doesn't blow out its layout.
 */
function formatLanguageList(languages, max = 3) {
  if (!languages) return '—';
  const names = Object.values(languages);
  if (names.length <= max) return names.join(', ');
  return `${names.slice(0, max).join(', ')} +${names.length - max} more`;
}

/**
 * Strips HTML tags from a string — Wikimedia Commons credit fields often
 * come back as "<a href=...>Name</a>" rather than plain text.
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Formats a distance in meters as a short label, switching to km past 1000m.
 */
function formatDistance(meters) {
  if (typeof meters !== 'number') return '';
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

// Exposed as plain globals for now (Phase 1, no bundler).
// If this project later moves to ES modules, swap these for named exports.