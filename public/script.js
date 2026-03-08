// ========== CAROUSEL ==========
const track = document.getElementById('carouselTrack');
const slides = track.querySelectorAll('.carousel-slide');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');
const dotsContainer = document.getElementById('carouselDots');
let currentSlide = 0;
let autoplayTimeout;

// Create dots
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('carousel-dot');
  dot.setAttribute('aria-label', `Ir a slide ${i + 1}`);
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = dotsContainer.querySelectorAll('.carousel-dot');

// Get duration for current slide from data-duration attribute
function getSlideDuration(index) {
  const slide = slides[index];
  return parseInt(slide.getAttribute('data-duration')) || 5000;
}

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide = (index + slides.length) % slides.length;

  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');

  resetAutoplay();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);

// Autoplay with variable timing per slide
function startAutoplay() {
  const duration = getSlideDuration(currentSlide);
  autoplayTimeout = setTimeout(nextSlide, duration);
}

function resetAutoplay() {
  clearTimeout(autoplayTimeout);
  startAutoplay();
}

// Initialize first slide
slides[0].classList.add('active');
startAutoplay();

// Pause on hover
const carousel = document.querySelector('.carousel');
carousel.addEventListener('mouseenter', () => clearTimeout(autoplayTimeout));
carousel.addEventListener('mouseleave', startAutoplay);

// Touch support
let touchStartX = 0;
let touchEndX = 0;

carousel.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  clearTimeout(autoplayTimeout);
}, { passive: true });

carousel.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextSlide();
    else prevSlide();
  }
  startAutoplay();
}, { passive: true });

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
});


// ========== NAVBAR ==========
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navbarToggle');
const navMenu = document.getElementById('navbarMenu');
const navLinks = document.querySelectorAll('.navbar-link');

// Scroll shadow
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile toggle
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('open');
});

// Close mobile menu on link click
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
  });
});


// ========== ACTIVE SECTION HIGHLIGHT ==========
const sections = document.querySelectorAll('section[id]');

function highlightNav() {
  const scrollPos = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNav);
highlightNav();


// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
  const cards = document.querySelectorAll('.card');
  const headers = document.querySelectorAll('.section-header');
  const mapWrapper = document.querySelectorAll('.map-wrapper');

  [...cards, ...headers, ...mapWrapper].forEach(el => {
    el.classList.add('fade-in');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

initScrollAnimations();


// ========== CONTACT FORM ==========
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());

  if (!data.nombre || !data.celular || !data.empresa || !data.correo || !data.descripcion) {
    return;
  }

  contactForm.innerHTML = `
    <div class="form-success">
      <div class="success-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h3>Mensaje enviado</h3>
      <p>Gracias por contactarnos, ${data.nombre}. Un asesor se comunicará contigo a la brevedad.</p>
    </div>
  `;
});