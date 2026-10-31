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