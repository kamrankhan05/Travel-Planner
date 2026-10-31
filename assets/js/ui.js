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