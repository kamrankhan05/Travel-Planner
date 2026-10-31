S
/**
 * ui.js
 * Rendering only. Reads data it's handed and updates the DOM.
 * Rules for this file:
 *   - Never calls fetch or anything from api.js.
 *   - Every function here takes data in and returns nothing (or a DOM node).
 */
 
const resultsEl = document.getElementById('results');
const stateLoading = document.getElementById('state-loading');
const stateEmpty = document.getElementById('state-empty');
const stateError = document.getElementById('state-error');
 
const overviewCard = document.getElementById('overview-card');
const mapSection = document.querySelector('.map-section');
const gallerySection = document.getElementById('gallery-section');
const attractionsSection = document.getElementById('attractions-section');

 
/**
 * Renders the destination overview cell from live geocoding data.
 * Languages is left as "—" here — renderCountry() fills it in once the
 * REST Countries call resolves, since geocoding doesn't return languages.
 */
function renderOverview(geo) {
  const cityEl = document.querySelector('.overview__city');
  const flagEl = document.querySelector('.overview__flag');
  const countryEl = document.querySelector('.overview__country');
  const popEl = document.getElementById('stat-population');
  const coordsEl = document.querySelectorAll('.overview__stats dd')[1];
  const languagesEl = document.getElementById('stat-languages');
 
  cityEl.childNodes[0].textContent = `${geo.name} `;
  flagEl.textContent = countryCodeToFlag(geo.country_code);
  flagEl.title = geo.country ?? '';
  countryEl.textContent = geo.country ?? '—';
 
  if (typeof geo.population === 'number') {
    popEl.dataset.countup = String(geo.population);
    animateCountUp(popEl, geo.population);
  } else {
    popEl.textContent = '—';
  }
 
  coordsEl.textContent = formatCoordinates(geo.latitude, geo.longitude);
  languagesEl.textContent = '—';
}


/**
 * Renders the local time card, derived from the geocoding timezone —
 * no separate time API needed.
 */
function renderTime(timeZone) {
  const valueEl = document.querySelector('.bento__cell--time .card__value');
  const descEl = document.querySelector('.bento__cell--time .card__desc');
  if (!timeZone) return;
 
  const now = new Date();
  valueEl.textContent = formatTime(now, timeZone);
  const offset = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(now)
    .find((p) => p.type === 'timeZoneName')?.value ?? '';
  descEl.textContent = `${formatDate(now, timeZone)} · ${offset}`;
}

 
/**
 * Renders the weather card from an Open-Meteo forecast response.
 */
function renderWeather(weather) {
  if (!weather?.current) {
    renderPendingCard('.bento__cell--weather', "Couldn't load weather");
    return;
  }
  const { current, daily } = weather;
  const tempEl = document.getElementById('stat-temp');
 
  tempEl.dataset.countup = String(Math.round(current.temperature_2m));
  animateCountUp(tempEl, current.temperature_2m, '°');
 
  document.getElementById('weather-desc').textContent = weatherCodeToDescription(current.weather_code);
  document.getElementById('weather-humidity').textContent = formatMetric(current.relative_humidity_2m, '%');
  document.getElementById('weather-wind').textContent = formatMetric(Math.round(current.wind_speed_10m), 'km/h');
  document.getElementById('weather-sunrise').textContent = formatClockFromIso(daily?.sunrise?.[0]);
  document.getElementById('weather-sunset').textContent = formatClockFromIso(daily?.sunset?.[0]);
}

 
/**
 * Renders the country + currency cards, and fills in the overview's
 * Languages stat, from a REST Countries v3.1 response.
 */
function renderCountry(country) {
  if (!country) {
    renderPendingCard('.bento__cell--country', "Couldn't load country data");
    renderPendingCard('.bento__cell--currency', "Couldn't load currency data");
    return;
  }
 
  const name = country.name?.common ?? '—';
  const capital = country.capital?.[0] ?? '—';
  const languages = formatLanguageList(country.languages);
  const currencyEntries = country.currencies ? Object.entries(country.currencies) : [];
  const [currencyCode, currencyInfo] = currencyEntries[0] ?? [null, null];
 
  document.getElementById('country-name').textContent = name;
  document.getElementById('country-capital').textContent = capital;
  document.getElementById('country-currency').textContent = currencyCode ?? '—';
  document.getElementById('stat-languages').textContent = languages;
 
  if (currencyCode) {
    document.getElementById('currency-code').textContent = `${currencyInfo.symbol ?? ''} ${currencyCode}`.trim();
    document.getElementById('currency-name').textContent = currencyInfo.name ?? currencyCode;
  }
}