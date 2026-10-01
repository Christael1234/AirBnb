// ---------- MOBILE MENU ----------
document.getElementById('menuBtn').addEventListener('click', ()=>{
  document.getElementById('navLinks').classList.toggle('mobile-open');
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- NUMBER COUNT-UP ----------
// Animates stats like "₦10,000,000" or "1,000,000" up from zero.
function countUp(el){
  const original = el.textContent.trim();
  const m = original.match(/^(₦?)([\d,]+)$/);
  if(!m || prefersReducedMotion) return;
  const target = parseInt(m[2].replace(/,/g, ''), 10);
  if(target < 10) return;
  const start = performance.now(), duration = 1400;
  const step = now => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = m[1] + Math.round(target * eased).toLocaleString('en-NG');
    if(t < 1) requestAnimationFrame(step); else el.textContent = original;
  };
  requestAnimationFrame(step);
}

// ---------- SCROLL REVEAL ----------
// Runs after page scripts have rendered rooms, prizes and T&Cs.
document.addEventListener('DOMContentLoaded', ()=>{
  if(prefersReducedMotion || !('IntersectionObserver' in window)) return;
  const selector = [
    '.section-head', '.intro-block', '.vmv-card', '.unit-card', '.feature', '.stats .stat',
    '.raffle-stat', '.raffle-table-wrap', '.raffle-table tbody tr', '.tc-item', '.raffle-banner',
    '.booking-wrap > *', '.amenities span', '.cta-band .wrap > *', 'footer .wrap > *',
  ].join(',');
  const els = [...document.querySelectorAll(selector)];
  document.documentElement.classList.add('js-reveal');

  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('in');
    io.unobserve(el);
    if(el.matches('.stat, .raffle-stat')) countUp(el.querySelector('b'));
  }), {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});

  els.forEach(el => {
    // Stagger siblings (cards in a grid, rows in a table) so they cascade in.
    const siblings = [...el.parentElement.children].filter(c => els.includes(c));
    el.style.setProperty('--d', Math.min(siblings.indexOf(el), 8) * 70 + 'ms');
    el.classList.add('reveal');
    // Once shown, drop the reveal classes so hover transitions work normally.
    el.addEventListener('transitionend', function done(e){
      if(e.target !== el || e.propertyName !== 'opacity' || !el.classList.contains('in')) return;
      el.classList.remove('reveal', 'in');
      el.style.removeProperty('--d');
      el.removeEventListener('transitionend', done);
    });
    io.observe(el);
  });
});

// ---------- MODALS ----------
// Used by the order confirmation and payment success dialogs.
const openModals = [];
function openModal(id, onDismiss){
  const modal = document.getElementById(id);
  modal.hidden = false;
  document.body.classList.add('modal-open');
  const dismiss = onDismiss || (() => closeModal(id));
  openModals.push({modal, dismiss});
  modal.onclick = e => { if(e.target === modal) dismiss(); };
  const focusEl = modal.querySelector('[data-autofocus]') || modal.querySelector('button');
  if(focusEl) focusEl.focus();
}
function closeModal(id){
  const modal = document.getElementById(id);
  modal.hidden = true;
  modal.onclick = null;
  const i = openModals.findIndex(m => m.modal === modal);
  if(i !== -1) openModals.splice(i, 1);
  if(!openModals.length) document.body.classList.remove('modal-open');
}
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && openModals.length) openModals[openModals.length - 1].dismiss();
});

// ---------- FORM HELPERS ----------
const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = v => /^[0-9+\s()-]{7,20}$/.test(v);

// Highlights the first bad field and shows a message under the pay button.
function formError(errorElId, inputId, message){
  const errEl = document.getElementById(errorElId);
  errEl.textContent = message;
  if(inputId){
    const input = document.getElementById(inputId);
    input.classList.remove('invalid');
    void input.offsetWidth; // restart the shake animation
    input.classList.add('invalid');
    input.focus();
    input.addEventListener('input', () => input.classList.remove('invalid'), {once: true});
  }
}

function setLoading(btn, loading){
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}
