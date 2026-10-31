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

 
/* ---------- 2. Staggered reveal for bento cells ---------- */
function initStaggeredReveal() {
  const cells = document.querySelectorAll('.bento__cell');
  if (!cells.length) return;
 
  cells.forEach((cell, i) => {
    cell.style.opacity = '0';
    cell.style.transform = 'translateY(28px)';
    cell.style.transitionDelay = `${i * 70}ms`;
  });
 
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'opacity 650ms cubic-bezier(0.16,1,0.3,1), transform 650ms cubic-bezier(0.16,1,0.3,1)';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
 
  cells.forEach((cell) => observer.observe(cell));
}
 
/* ---------- 3. Count-up numbers ---------- */
 
/**
 * Animates a single element's text from 0 to `end`, easing out.
 * Exposed globally so ui.js can trigger it directly after a live search
 * (the element is already on screen at that point, so no observer needed).
 */
function animateCountUp(el, end, suffix = '', duration = 900) {
  if (prefersReducedMotion) {
    el.textContent = Math.round(end).toLocaleString('en-US') + suffix;
    return;
  }
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
    const value = Math.round(end * eased);
    el.textContent = value.toLocaleString('en-US') + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
 
function initCountUp() {
  const targets = document.querySelectorAll('[data-countup]');
  if (!targets.length) return;
 
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = parseFloat(el.dataset.countup);
      const suffix = el.dataset.countupSuffix || '';
      animateCountUp(el, end, suffix);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });
 
  targets.forEach((el) => observer.observe(el));
}