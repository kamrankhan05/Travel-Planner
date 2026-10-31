/**
 * motion.js
 * Presentational motion only — scroll parallax, staggered reveals, count-up numbers.
 * Reads the DOM, writes to the DOM. Never touches api.js or app.js's data flow.
 * Respects prefers-reduced-motion by no-op'ing everything below.
 */
 
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
document.addEventListener('DOMContentLoaded', () => {
  if (prefersReducedMotion) return;
 
  initHeroParallax();
  initStaggeredReveal();
  initCountUp();
});
 
/* ---------- 1. Scroll-linked hero parallax ---------- */
function initHeroParallax() {
  const heroImage = document.getElementById('hero-image-stack');
  const heroContent = document.querySelector('.hero__content');
  if (!heroImage || !heroContent) return;
 
  let ticking = false;
 
  function update() {
    const scrollY = window.scrollY;
    const heroHeight = window.innerHeight;
    const progress = Math.min(scrollY / heroHeight, 1);
 
    // Photo drifts and scales slightly slower than scroll (classic parallax).
    heroImage.style.transform = `scale(${1.06 + progress * 0.08}) translateY(${progress * 40}px)`;
 
    // Headline fades and lifts out as you scroll past it.
    heroContent.style.opacity = String(1 - progress * 1.4);
    heroContent.style.transform = `translateY(${progress * -60}px)`;
 
    ticking = false;
  }
 
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}