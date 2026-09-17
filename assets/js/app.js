/**
 * app.js
 * Main controller. Handles events, owns loading/error state transitions,
 * and is the only module that calls both api.js and ui.js.
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const cityInput = document.getElementById('city-input');
  const resultSection = document.getElementById('results');

  form.addEventListener('submit', handleSearch);

  async function handleSearch(event) {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;
    
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setResultState('loading');

    try {
      const data = await fetchDestinationsData(city);
      displayDestinationsData(data);
      if (!data){
        setResultState('error');
        return
      }

      renderOverview(data.geo);
      renderTime(data.geo.timezone);
      renderWeather(data.weather);
      renderCountry(data.country);
      renderPackingList(data.weather,data.geo.name);
      renderGallery(data.gallery, data.geo.name);
      renderAttractions(data.attractions, data.geo.name);

      renderMap(data.geo.lat, data.geo.lon, data.geo.name);
      updateHeroBackground(data.geo.name);

      setResultState('loaded');
    } catch (err) {
      console.error(err);
      setResultState('error');
    }
  }
});