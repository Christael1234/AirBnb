// ---------- HERO SLIDER ----------
let currentSlide = 0;
const slides = document.querySelectorAll('#heroSlider .slide');
const dots = document.querySelectorAll('#sliderDots .dot');
function gotoSlide(i){
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = i;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}
setInterval(()=>{ gotoSlide((currentSlide + 1) % slides.length); }, 5000);

// Load the remaining hero images only after the page has finished loading,
// so the first slide isn't competing with six other large images.
window.addEventListener('load', ()=>{
  document.querySelectorAll('#heroSlider .slide[data-bg]').forEach(s=>{
    s.style.backgroundImage = `url('${s.dataset.bg}')`;
  });
});
