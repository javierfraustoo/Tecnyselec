// ========== LOADER ==========
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.add('custom-cursor');
  }, 1400);
  setTimeout(() => loader.remove(), 2000);
});


// ========== CAROUSEL ==========
const imagesTrack = document.getElementById('carouselTrack');
const imageSlides = imagesTrack.querySelectorAll('.carousel-image-slide');
const captions = document.querySelectorAll('.carousel-text-panel .slide-caption');
const dotsContainer = document.getElementById('carouselDots');
let currentSlide = 0;
let autoplayTimeout;

// Create dots
imageSlides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.classList.add('carousel-dot');
  dot.setAttribute('aria-label', `Ir a slide ${i + 1}`);
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = dotsContainer.querySelectorAll('.carousel-dot');

function getSlideDuration(index) {
  return parseInt(imageSlides[index].getAttribute('data-duration')) || 5000;
}

function goToSlide(index) {
  imageSlides[currentSlide].classList.remove('active');
  captions[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');

  currentSlide = (index + imageSlides.length) % imageSlides.length;

  imagesTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  imageSlides[currentSlide].classList.add('active');
  captions[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');

  resetAutoplay();
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

document.querySelector('.carousel').addEventListener('click', (e) => {
  const btn = e.target.closest('.carousel-btn');
  if (!btn) return;
  if (btn.classList.contains('carousel-btn-prev')) prevSlide();
  if (btn.classList.contains('carousel-btn-next')) nextSlide();
});

function startAutoplay() {
  autoplayTimeout = setTimeout(nextSlide, getSlideDuration(currentSlide));
}

function resetAutoplay() {
  clearTimeout(autoplayTimeout);
  startAutoplay();
}

startAutoplay();

const carousel = document.querySelector('.carousel');
carousel.addEventListener('mouseenter', () => clearTimeout(autoplayTimeout));
carousel.addEventListener('mouseleave', startAutoplay);

let touchStartX = 0;
carousel.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  clearTimeout(autoplayTimeout);
}, { passive: true });

carousel.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextSlide(); else prevSlide();
  }
  startAutoplay();
}, { passive: true });

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
});


// ========== NAVBAR ==========
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navbarToggle');
const navMenu = document.getElementById('navbarMenu');
const navLinks = document.querySelectorAll('.navbar-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
});

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('open');
});

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
        if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
      });
    }
  });
}

window.addEventListener('scroll', highlightNav);
highlightNav();


// ========== SCROLL ANIMATIONS (UPGRADED) ==========
function initScrollAnimations() {
  // Section headers: fade up
  document.querySelectorAll('.section-header').forEach(header => {
    const title = header.querySelector('.section-title');
    const divider = header.querySelector('.section-divider');
    const subtitle = header.querySelector('.section-subtitle');
    if (title) title.classList.add('anim-fade-up');
    if (divider) divider.classList.add('anim-divider');
    if (subtitle) subtitle.classList.add('anim-fade-up');
  });

  // Cards: staggered fade-up per grid
  document.querySelectorAll('.services-grid, .clients-grid').forEach(grid => {
    grid.querySelectorAll('.card').forEach((card, i) => {
      card.classList.add('anim-fade-up');
      card.style.transitionDelay = `${i * 80}ms`;
    });
  });

  // Map wrapper
  document.querySelectorAll('.map-wrapper').forEach(el => el.classList.add('anim-scale-up'));

  // Contact info items: slide from left
  document.querySelectorAll('.contact-info-item').forEach((item, i) => {
    item.classList.add('anim-fade-left');
    item.style.transitionDelay = `${i * 120}ms`;
  });

  // Contact form: slide from right
  document.querySelectorAll('.contact-form').forEach(el => el.classList.add('anim-fade-right'));

  // Stats items already have anim-fade-up from HTML

  // CTA wrapper
  // CTA wrapper removed

  // Observe all animated elements
  const animEls = document.querySelectorAll('.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-scale-up, .anim-divider');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  animEls.forEach(el => observer.observe(el));
}

initScrollAnimations();


// ========== STAT COUNTERS ==========
function initCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  let started = false;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();

        function update(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.floor(eased * target).toLocaleString('es-MX');
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
      });
    }
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) observer.observe(statsSection);
}

initCounters();


// ========== 3D TILT EFFECT ==========
function initTilt() {
  // Only on devices with fine pointer (mouse)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cards = document.querySelectorAll('.services-grid .card, .clients-grid .card');

  cards.forEach(card => {
    card.classList.add('tilt-card');

    // Add glare element
    const glare = document.createElement('div');
    glare.classList.add('tilt-glare');
    card.appendChild(glare);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

      // Move glare
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18), transparent 60%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

initTilt();


// ========== RIPPLE EFFECT ON BUTTONS ==========
function initRipple() {
  const buttons = document.querySelectorAll('.btn-primary, .btn-submit, .btn-accent');

  buttons.forEach(btn => {
    btn.classList.add('btn-ripple');
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

initRipple();


// ========== MAGNETIC BUTTONS ==========
function initMagnetic() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const magneticBtns = document.querySelectorAll('.slide-btn');

  magneticBtns.forEach(btn => {
    btn.classList.add('btn-magnetic');

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

initMagnetic();


// ========== CUSTOM CURSOR ==========
function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const outer = document.getElementById('cursorOuter');
  const inner = document.getElementById('cursorInner');
  if (!outer || !inner) return;

  let mouseX = 0, mouseY = 0;
  let outerX = 0, outerY = 0;
  const speed = 0.15;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Inner dot follows immediately
    inner.style.left = mouseX + 'px';
    inner.style.top = mouseY + 'px';

    if (!outer.classList.contains('visible')) {
      outer.classList.add('visible');
      inner.classList.add('visible');
      outerX = mouseX;
      outerY = mouseY;
    }
  });

  // Outer ring follows with smooth lag
  function animateCursor() {
    outerX += (mouseX - outerX) * speed;
    outerY += (mouseY - outerY) * speed;
    outer.style.left = outerX + 'px';
    outer.style.top = outerY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover state on interactive elements
  const interactives = 'a, button, input, textarea, select, .card, .carousel-dot, .map-card';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) {
      outer.classList.add('hovering');
      inner.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) {
      outer.classList.remove('hovering');
      inner.classList.remove('hovering');
    }
  });

  // Click pulse
  document.addEventListener('mousedown', () => outer.classList.add('clicking'));
  document.addEventListener('mouseup', () => outer.classList.remove('clicking'));

  // Hide when cursor leaves window
  document.addEventListener('mouseleave', () => {
    outer.classList.remove('visible');
    inner.classList.remove('visible');
  });

  document.addEventListener('mouseenter', () => {
    outer.classList.add('visible');
    inner.classList.add('visible');
  });
}

initCursor();


// ========== SERVICES TOGGLE ==========
const servicesToggle = document.getElementById('servicesToggle');
const servicesGrid = document.getElementById('servicesGrid');
if (servicesToggle && servicesGrid) {
  const toggleText = servicesToggle.querySelector('.toggle-text');
  servicesToggle.addEventListener('click', () => {
    const isExpanded = servicesGrid.classList.toggle('expanded');
    servicesToggle.classList.toggle('expanded', isExpanded);
    if (toggleText) {
      toggleText.textContent = isExpanded ? 'Ver menos servicios' : 'Ver todos los servicios';
    }
  });
}


// ========== CLIENTS TOGGLE ==========
const clientsToggle = document.getElementById('clientsToggle');
const clientsGrid = document.querySelector('.clients-grid');
if (clientsToggle && clientsGrid) {
  const toggleText = clientsToggle.querySelector('.toggle-text');
  clientsToggle.addEventListener('click', () => {
    const isExpanded = clientsGrid.classList.toggle('expanded');
    clientsToggle.classList.toggle('expanded', isExpanded);
    if (toggleText) {
      toggleText.textContent = isExpanded ? 'Ver menos clientes' : 'Ver todos los clientes';
    }
  });
}


// ========== GO TO TOP ==========
const goTopBtn = document.getElementById('goTop');
if (goTopBtn) {
  window.addEventListener('scroll', () => {
    goTopBtn.classList.toggle('visible', window.scrollY > 500);
  });
  goTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


// ========== SEARCH ==========
function initSearch() {
  const searchBtn = document.getElementById('navbarSearchBtn');
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  const closeBtn = document.getElementById('searchClose');
  const resultsContainer = document.getElementById('searchResults');
  if (!searchBtn || !overlay) return;

  const searchItems = [
    { title: 'Inicio', desc: 'Página principal', section: '#inicio' },
    { title: 'Servicios', desc: 'Todos nuestros servicios de estacionamiento', section: '#servicios' },
    { title: 'Clientes', desc: 'Empresas que confían en Tecnyselec', section: '#clientes' },
    { title: 'Contacto', desc: 'Formulario de contacto y teléfono', section: '#contacto' },
    { title: 'Mapa de Clientes', desc: 'Ubicaciones donde hemos trabajado', section: '#mapa' },
    { title: 'Nuestras Cifras', desc: '+25 años, +40 clientes, +1,000 equipos', section: '#estadisticas' },
    { title: 'Equipamiento Automatizado', desc: 'Sistemas de cobro automatizado llave en mano', section: '#servicios' },
    { title: 'Mantenimiento', desc: 'Mantenimiento preventivo y correctivo', section: '#servicios' },
    { title: 'Boletos y Rollos Térmicos', desc: 'Suministro de consumibles compatibles', section: '#servicios' },
    { title: 'Barreras Vehiculares', desc: 'Control de acceso vehicular', section: '#servicios' },
    { title: 'CCTV', desc: 'Sistemas de videovigilancia HD', section: '#servicios' },
    { title: 'Obra Civil', desc: 'Topes, bolardos y señalización vial', section: '#servicios' },
    { title: 'Asesoría y Trámites', desc: 'Gestión de permisos municipales', section: '#servicios' },
    { title: 'Operación de Estacionamientos', desc: 'Gestión integral con personal capacitado', section: '#servicios' },
    { title: 'Soluciones a la Medida', desc: 'Proyectos personalizados', section: '#servicios' },
    { title: 'Plaza Río', desc: 'Centro comercial emblemático de Tijuana', section: '#clientes' },
    { title: 'Aeropuerto de Tijuana', desc: 'Estacionamiento del aeropuerto', section: '#clientes' },
    { title: 'Península Fashion Mall', desc: 'Centro comercial zona Río', section: '#clientes' },
    { title: 'Macroplaza Insurgentes', desc: 'Plaza de gran formato', section: '#clientes' },
    { title: 'Alameda Otay', desc: 'Town center moderno en Otay', section: '#clientes' },
  ];

  function openSearch() {
    overlay.classList.add('active');
    setTimeout(() => input.focus(), 150);
    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    overlay.classList.remove('active');
    input.value = '';
    document.body.style.overflow = '';
    renderResults('');
  }

  function renderResults(query) {
    if (!query.trim()) {
      resultsContainer.innerHTML = '<div class="search-hint">Escribe para buscar servicios, clientes o secciones</div>';
      return;
    }

    const q = query.toLowerCase();
    const filtered = searchItems.filter(item =>
      item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      resultsContainer.innerHTML = '<div class="search-hint">No se encontraron resultados</div>';
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => `
      <div class="search-result-item" data-section="${item.section}">
        <div class="search-result-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <div class="search-result-text">
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const target = document.querySelector(el.dataset.section);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        closeSearch();
      });
    });
  }

  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSearch();
  });
  closeBtn.addEventListener('click', closeSearch);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSearch();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  input.addEventListener('input', () => renderResults(input.value));
}

initSearch();


// ========== LANGUAGE SWITCHER ==========
function initLanguageSwitcher() {
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langCurrent = langBtn?.querySelector('.lang-current');
  if (!langBtn || !langDropdown) return;

  let currentLang = 'es';
  const originals = {};

  // Store original Spanish text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    originals[el.getAttribute('data-i18n')] = el.innerHTML;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    originals[el.getAttribute('data-i18n-ph')] = el.placeholder;
  });

  const T = {
    en: {
      'nav-inicio': 'Home', 'nav-servicios': 'Services', 'nav-clientes': 'Clients', 'nav-contacto': 'Contact',
      's1-title': '26+ years equipping parking facilities across the northern border.',
      's1-desc': 'We are the region\'s specialists with over 1,000 units installed in shopping centers, airports, and urban developments. We distribute the world\'s leading brands and offer the most comprehensive service: sales, installation, maintenance, and operations.',
      's1-btn': 'Learn about our history',
      's2-title': 'Trusted by the largest shopping centers.',
      's2-desc': 'We work hand in hand with the most important plazas and developments in the region, such as Plaza R\u00edo and Pen\u00ednsula Fashion Mall. We are known for providing robust solutions that support heavy daily traffic, ensuring the best end-user experience.',
      's2-btn': 'Our Clients',
      's3-title': 'Your parking never stops.',
      's3-desc': 'We protect your investment with preventive and corrective maintenance policies. Our expert technical team offers immediate response times so your payment systems, barriers and cameras operate at 100% capacity every day of the year.',
      's3-btn': 'Explore our services',
      's4-title': 'Top-tier technology and equipment.',
      's4-desc': 'We supply and install the best equipment on the market: vehicle barriers, automated payment systems, security cameras and protection posts. We are also your trusted supplier of consumables, tickets and thermal rolls.',
      's4-btn': 'View our products',
      's5-title': 'We design the exact solution for your project.',
      's5-desc': 'Planning to open or remodel a parking facility? We guide you from initial consulting, wiring design and installation, all the way to operational launch. Your project is safe with the true experts.',
      's5-btn': 'Quote your project today',
      'services-toggle-text': 'View all services',
      'clients-toggle-text': 'View all clients',
      'services-cta': 'Request a quote for your project',
      'sec-servicios-title': 'Our Services',
      'sec-servicios-sub': 'Comprehensive parking equipment solutions for shopping centers, residential complexes and public parking facilities.',
      'brands-title': 'Official Commercial Alliances',
      'brands-desc': 'We are distributors and strategic allies of the world\'s leading parking equipment brands. This allows us to guarantee quality, availability of original spare parts and specialized technical support in every project we undertake.',
      'brands-badge1': 'Authorized distributors',
      'brands-badge2': 'Direct factory support',
      'brands-badge3': 'Original spare parts',
      'stat1-label': 'Years of experience',
      'stat2-label': 'Active clients in the northwest region',
      'stat3-label': 'Equipment installed',
      'stat4-label': 'Technical support',
      'sec-clientes-title': 'Our Clients',
      'sec-clientes-sub': 'Companies and developments that trust Tecnyselec for their parking solutions in the region.',
      'sec-mapa-title': 'Client Locations',
      'sec-mapa-sub': 'Discover all the locations where Tecnyselec has installed, maintained or operated parking systems.',
      'map-card-title': 'Explore our locations',
      'map-card-desc': 'See on the interactive map all the parking facilities and plazas where we have installed, maintained or operated systems.',
      'map-card-btn': 'Open Interactive Map',
      'sec-contacto-title': 'Contact Us',
      'sec-contacto-sub': 'Fill out the form and an advisor will get in touch with you shortly, or if you prefer, contact us directly through the following channels.',
      'contact-phone': 'Phone',
      'contact-email': 'Email',
      'contact-location': 'Location',
      'contact-location-val': 'Tijuana, Baja California',
      'form-nombre': 'Full name',
      'form-nombre-ph': 'e.g. John Smith',
      'form-celular': 'Phone number',
      'form-celular-ph': 'e.g. 664 123 4567',
      'form-empresa': 'Company',
      'form-empresa-ph': 'e.g. ABC Shopping Center',
      'form-correo': 'Email address',
      'form-correo-ph': 'e.g. email@company.com',
      'form-desc': 'Project description',
      'form-desc-ph': 'Tell us about your project. What type of solution do you need?',
      'form-submit': 'I want to be contacted',
      'footer-tagline': 'Comprehensive parking equipment solutions for the border region of Mexico.',
      'footer-copy': '&copy; 2026 Tecnyselec Estacionamientos. All rights reserved.',
      'sec-testimonials-title': 'What Our Clients Say',
      'sec-testimonials-sub': 'The trust and satisfaction of our clients is our best endorsement.',
      'testimonial1-quote': 'Tecnyselec transformed our parking facility. The automated payment system reduced our losses by 40% and wait times were completely eliminated.',
      'testimonial1-author': 'Carlos Mendoza',
      'testimonial1-role': 'Operations Manager, Plaza R\u00edo',
      'testimonial2-quote': 'The support response is impressive. When we had a failure at 3am, the team arrived in less than an hour. That is priceless for our operation.',
      'testimonial2-author': 'Mar\u00eda Elena Torres',
      'testimonial2-role': 'Administrative Director, Tijuana Airport',
      'testimonial3-quote': 'We have been working with Tecnyselec for 8 years and have never considered switching providers. The quality of their equipment and after-sales service is on another level.',
      'testimonial3-author': 'Roberto S\u00e1nchez',
      'testimonial3-role': 'General Manager, Pabell\u00f3n Rosarito',
    },
    fr: {
      'nav-inicio': 'Accueil', 'nav-servicios': 'Services', 'nav-clientes': 'Clients', 'nav-contacto': 'Contact',
      's1-title': '26+ ans d\'expertise en stationnement dans la r\u00e9gion frontali\u00e8re nord.',
      's1-desc': 'Nous sommes les sp\u00e9cialistes de la r\u00e9gion avec plus de 1 000 \u00e9quipements install\u00e9s dans des centres commerciaux, a\u00e9roports et d\u00e9veloppements urbains. Nous distribuons les marques leaders mondiales et offrons le service le plus complet.',
      's1-btn': 'D\u00e9couvrez notre parcours',
      's2-title': 'La confiance des plus grands centres commerciaux.',
      's2-desc': 'Nous travaillons main dans la main avec les plus importants centres et d\u00e9veloppements de la r\u00e9gion, comme Plaza R\u00edo et Pen\u00ednsula Fashion Mall. Nous sommes reconnus pour offrir des solutions robustes qui supportent un trafic quotidien intense.',
      's2-btn': 'Nos Clients',
      's3-title': 'Votre stationnement ne s\u2019arr\u00eate jamais.',
      's3-desc': 'Nous prot\u00e9geons votre investissement avec des polices de maintenance pr\u00e9ventive et corrective. Notre \u00e9quipe technique experte offre des temps de r\u00e9ponse imm\u00e9diats pour que vos syst\u00e8mes fonctionnent \u00e0 100% de leur capacit\u00e9.',
      's3-btn': 'Explorez nos services',
      's4-title': 'Technologie et \u00e9quipements de premier niveau.',
      's4-desc': 'Nous fournissons et installons les meilleurs \u00e9quipements du march\u00e9 : barri\u00e8res v\u00e9hiculaires, syst\u00e8mes de paiement automatis\u00e9s, cam\u00e9ras de s\u00e9curit\u00e9 et bornes de protection.',
      's4-btn': 'Voir nos produits',
      's5-title': 'Nous concevons la solution exacte pour votre projet.',
      's5-desc': 'Vous pr\u00e9voyez d\u2019ouvrir ou de r\u00e9nover un stationnement ? Nous vous accompagnons du conseil initial \u00e0 la mise en service op\u00e9rationnelle. Votre projet est entre les mains des v\u00e9ritables experts.',
      's5-btn': 'Demandez un devis',
      'services-toggle-text': 'Voir tous les services',
      'clients-toggle-text': 'Voir tous les clients',
      'services-cta': 'Demandez un devis pour votre projet',
      'sec-servicios-title': 'Nos Services',
      'sec-servicios-sub': 'Solutions compl\u00e8tes en \u00e9quipements de stationnement pour centres commerciaux, r\u00e9sidences et parkings publics.',
      'brands-title': 'Alliances Commerciales Officielles',
      'brands-desc': 'Nous sommes distributeurs et alli\u00e9s strat\u00e9giques des marques leaders mondiales en \u00e9quipements de stationnement. Cela nous permet de garantir la qualit\u00e9, la disponibilit\u00e9 de pi\u00e8ces d\u2019origine et un support technique sp\u00e9cialis\u00e9.',
      'brands-badge1': 'Distributeurs autoris\u00e9s',
      'brands-badge2': 'Support direct usine',
      'brands-badge3': 'Pi\u00e8ces d\u2019origine',
      'stat1-label': 'Ann\u00e9es d\u2019exp\u00e9rience',
      'stat2-label': 'Clients actifs dans la r\u00e9gion nord-ouest',
      'stat3-label': '\u00c9quipements install\u00e9s',
      'stat4-label': 'Support technique',
      'sec-clientes-title': 'Nos Clients',
      'sec-clientes-sub': 'Entreprises et d\u00e9veloppements qui font confiance \u00e0 Tecnyselec pour leurs solutions de stationnement.',
      'sec-mapa-title': 'Emplacements de Nos Clients',
      'sec-mapa-sub': 'D\u00e9couvrez tous les emplacements o\u00f9 Tecnyselec a install\u00e9, entretenu ou exploit\u00e9 des syst\u00e8mes de stationnement.',
      'map-card-title': 'Explorez nos emplacements',
      'map-card-desc': 'Consultez sur la carte interactive tous les parkings et centres o\u00f9 nous avons install\u00e9, entretenu ou exploit\u00e9 des syst\u00e8mes.',
      'map-card-btn': 'Ouvrir la Carte Interactive',
      'sec-contacto-title': 'Contactez-nous',
      'sec-contacto-sub': 'Remplissez le formulaire et un conseiller vous contactera rapidement, ou contactez-nous directement par les moyens suivants.',
      'contact-phone': 'T\u00e9l\u00e9phone',
      'contact-email': 'Courriel',
      'contact-location': 'Emplacement',
      'contact-location-val': 'Tijuana, Basse-Californie',
      'form-nombre': 'Nom complet',
      'form-nombre-ph': 'ex. Jean Dupont',
      'form-celular': 'Num\u00e9ro de t\u00e9l\u00e9phone',
      'form-celular-ph': 'ex. 664 123 4567',
      'form-empresa': 'Entreprise',
      'form-empresa-ph': 'ex. Centre Commercial ABC',
      'form-correo': 'Adresse e-mail',
      'form-correo-ph': 'ex. courriel@entreprise.com',
      'form-desc': 'Description du projet',
      'form-desc-ph': 'Parlez-nous de votre projet. Quel type de solution recherchez-vous ?',
      'form-submit': 'Je souhaite \u00eatre contact\u00e9',
      'footer-tagline': 'Solutions compl\u00e8tes en \u00e9quipements de stationnement pour la r\u00e9gion frontali\u00e8re du Mexique.',
      'footer-copy': '&copy; 2026 Tecnyselec Estacionamientos. Tous droits r\u00e9serv\u00e9s.',
      'sec-testimonials-title': 'Ce Que Disent Nos Clients',
      'sec-testimonials-sub': 'La confiance et la satisfaction de nos clients sont notre meilleure r\u00e9f\u00e9rence.',
      'testimonial1-quote': 'Tecnyselec a transform\u00e9 notre stationnement. Le syst\u00e8me de paiement automatis\u00e9 a r\u00e9duit nos pertes de 40% et les temps d\'attente ont \u00e9t\u00e9 compl\u00e8tement \u00e9limin\u00e9s.',
      'testimonial1-author': 'Carlos Mendoza',
      'testimonial1-role': 'Directeur des Op\u00e9rations, Plaza R\u00edo',
      'testimonial2-quote': 'La r\u00e9ponse du support est impressionnante. Lors d\'une panne \u00e0 3h du matin, l\'\u00e9quipe est arriv\u00e9e en moins d\'une heure. \u00c7a n\'a pas de prix pour notre exploitation.',
      'testimonial2-author': 'Mar\u00eda Elena Torres',
      'testimonial2-role': 'Directrice Administrative, A\u00e9roport de Tijuana',
      'testimonial3-quote': 'Nous travaillons avec Tecnyselec depuis 8 ans et n\'avons jamais envisag\u00e9 de changer de fournisseur. La qualit\u00e9 de leurs \u00e9quipements et leur service apr\u00e8s-vente est d\'un autre niveau.',
      'testimonial3-author': 'Roberto S\u00e1nchez',
      'testimonial3-role': 'Directeur G\u00e9n\u00e9ral, Pabell\u00f3n Rosarito',
    },
    pt: {
      'nav-inicio': 'In\u00edcio', 'nav-servicios': 'Servi\u00e7os', 'nav-clientes': 'Clientes', 'nav-contacto': 'Contato',
      's1-title': '26+ anos equipando estacionamentos na fronteira norte.',
      's1-desc': 'Somos os especialistas da regi\u00e3o com mais de 1.000 equipamentos instalados em centros comerciais, aeroportos e desenvolvimentos urbanos. Distribu\u00edmos as marcas l\u00edderes mundiais e oferecemos o servi\u00e7o mais completo.',
      's1-btn': 'Conhe\u00e7a nossa trajet\u00f3ria',
      's2-title': 'A confian\u00e7a dos maiores centros comerciais.',
      's2-desc': 'Trabalhamos lado a lado com as pra\u00e7as e empreendimentos mais importantes da regi\u00e3o, como Plaza R\u00edo e Pen\u00ednsula Fashion Mall. Somos reconhecidos por oferecer solu\u00e7\u00f5es robustas que suportam tr\u00e1fego pesado di\u00e1rio.',
      's2-btn': 'Nossos Clientes',
      's3-title': 'Seu estacionamento nunca para.',
      's3-desc': 'Protegemos seu investimento com pol\u00edticas de manuten\u00e7\u00e3o preventiva e corretiva. Nossa equipe t\u00e9cnica especializada oferece tempos de resposta imediatos para que seus sistemas operem a 100% de sua capacidade.',
      's3-btn': 'Explore nossos servi\u00e7os',
      's4-title': 'Tecnologia e equipamentos de primeira linha.',
      's4-desc': 'Fornecemos e instalamos os melhores equipamentos do mercado: barreiras veiculares, sistemas de cobran\u00e7a automatizada, c\u00e2meras de seguran\u00e7a e postes de prote\u00e7\u00e3o.',
      's4-btn': 'Ver nossos produtos',
      's5-title': 'Projetamos a solu\u00e7\u00e3o exata para seu projeto.',
      's5-desc': 'Planeja abrir ou reformar um estacionamento? Acompanhamos voc\u00ea desde a consultoria inicial, design e instala\u00e7\u00e3o, at\u00e9 a opera\u00e7\u00e3o. Seu projeto est\u00e1 seguro com os verdadeiros especialistas.',
      's5-btn': 'Or\u00e7e seu projeto hoje',
      'services-toggle-text': 'Ver todos os servi\u00e7os',
      'clients-toggle-text': 'Ver todos os clientes',
      'services-cta': 'Solicite um or\u00e7amento para seu projeto',
      'sec-servicios-title': 'Nossos Servi\u00e7os',
      'sec-servicios-sub': 'Solu\u00e7\u00f5es integrais em equipamentos de estacionamento para centros comerciais, residenciais e estacionamentos p\u00fablicos.',
      'brands-title': 'Alian\u00e7as Comerciais Oficiais',
      'brands-desc': 'Somos distribuidores e aliados estrat\u00e9gicos das marcas l\u00edderes mundiais em equipamentos de estacionamento. Isso nos permite garantir qualidade, disponibilidade de pe\u00e7as originais e suporte t\u00e9cnico especializado.',
      'brands-badge1': 'Distribuidores autorizados',
      'brands-badge2': 'Suporte direto de f\u00e1brica',
      'brands-badge3': 'Pe\u00e7as originais',
      'stat1-label': 'Anos de experi\u00eancia',
      'stat2-label': 'Clientes ativos na regi\u00e3o noroeste',
      'stat3-label': 'Equipamentos instalados',
      'stat4-label': 'Suporte t\u00e9cnico',
      'sec-clientes-title': 'Nossos Clientes',
      'sec-clientes-sub': 'Empresas e empreendimentos que confiam na Tecnyselec para suas solu\u00e7\u00f5es de estacionamento.',
      'sec-mapa-title': 'Localiza\u00e7\u00f5es dos Nossos Clientes',
      'sec-mapa-sub': 'Conhe\u00e7a todas as localiza\u00e7\u00f5es onde a Tecnyselec instalou, manteve ou operou sistemas de estacionamento.',
      'map-card-title': 'Explore nossas localiza\u00e7\u00f5es',
      'map-card-desc': 'Veja no mapa interativo todos os estacionamentos e pra\u00e7as onde instalamos, mantivemos ou operamos sistemas.',
      'map-card-btn': 'Abrir Mapa Interativo',
      'sec-contacto-title': 'Entre em Contato',
      'sec-contacto-sub': 'Preencha o formul\u00e1rio e um consultor entrar\u00e1 em contato em breve, ou se preferir, comunique-se diretamente conosco.',
      'contact-phone': 'Telefone',
      'contact-email': 'E-mail',
      'contact-location': 'Localiza\u00e7\u00e3o',
      'contact-location-val': 'Tijuana, Baixa Calif\u00f3rnia',
      'form-nombre': 'Nome completo',
      'form-nombre-ph': 'ex. Jo\u00e3o Silva',
      'form-celular': 'N\u00famero de celular',
      'form-celular-ph': 'ex. 664 123 4567',
      'form-empresa': 'Empresa',
      'form-empresa-ph': 'ex. Centro Comercial ABC',
      'form-correo': 'Endere\u00e7o de e-mail',
      'form-correo-ph': 'ex. email@empresa.com',
      'form-desc': 'Descri\u00e7\u00e3o do projeto',
      'form-desc-ph': 'Conte-nos sobre seu projeto. Que tipo de solu\u00e7\u00e3o voc\u00ea precisa?',
      'form-submit': 'Quero ser contatado',
      'footer-tagline': 'Solu\u00e7\u00f5es integrais em equipamentos de estacionamento para a regi\u00e3o fronteiri\u00e7a do M\u00e9xico.',
      'footer-copy': '&copy; 2026 Tecnyselec Estacionamientos. Todos os direitos reservados.',
      'sec-testimonials-title': 'O Que Dizem Nossos Clientes',
      'sec-testimonials-sub': 'A confian\u00e7a e satisfa\u00e7\u00e3o dos nossos clientes \u00e9 nosso melhor respaldo.',
      'testimonial1-quote': 'A Tecnyselec transformou nosso estacionamento. O sistema de cobran\u00e7a automatizado reduziu nossas perdas em 40% e os tempos de espera foram completamente eliminados.',
      'testimonial1-author': 'Carlos Mendoza',
      'testimonial1-role': 'Gerente de Opera\u00e7\u00f5es, Plaza R\u00edo',
      'testimonial2-quote': 'A resposta de suporte \u00e9 impressionante. Quando tivemos uma falha \u00e0s 3h da manh\u00e3, a equipe chegou em menos de uma hora. Isso n\u00e3o tem pre\u00e7o para nossa opera\u00e7\u00e3o.',
      'testimonial2-author': 'Mar\u00eda Elena Torres',
      'testimonial2-role': 'Diretora Administrativa, Aeroporto de Tijuana',
      'testimonial3-quote': 'Trabalhamos com a Tecnyselec h\u00e1 8 anos e nunca consideramos mudar de fornecedor. A qualidade de seus equipamentos e seu servi\u00e7o p\u00f3s-venda \u00e9 de outro n\u00edvel.',
      'testimonial3-author': 'Roberto S\u00e1nchez',
      'testimonial3-role': 'Gerente Geral, Pabell\u00f3n Rosarito',
    }
  };

  // Service card translations (by nth-child)
  const serviceCards = [
    { title: { en: 'Automated Parking Equipment', fr: '\u00c9quipement de Stationnement Automatis\u00e9', pt: 'Equipamento de Estacionamento Automatizado' },
      desc: { en: 'Professional turnkey installation of automated payment systems, tailored to each project and budget.', fr: 'Installation professionnelle cl\u00e9 en main de syst\u00e8mes de paiement automatis\u00e9s, adapt\u00e9s \u00e0 chaque projet.', pt: 'Instala\u00e7\u00e3o profissional chave na m\u00e3o de sistemas de cobran\u00e7a automatizada, adaptados a cada projeto.' }},
    { title: { en: 'Preventive & Corrective Maintenance', fr: 'Maintenance Pr\u00e9ventive et Corrective', pt: 'Manuten\u00e7\u00e3o Preventiva e Corretiva' },
      desc: { en: 'Service policies with certified technicians and immediate response to keep your equipment running at 100%.', fr: 'Polices de service avec techniciens certifi\u00e9s et r\u00e9ponse imm\u00e9diate pour maintenir vos \u00e9quipements \u00e0 100%.', pt: 'Pol\u00edticas de servi\u00e7o com t\u00e9cnicos certificados e resposta imediata para manter seus equipamentos a 100%.' }},
    { title: { en: 'Tickets & Thermal Roll Supply', fr: 'Fourniture de Billets et Rouleaux Thermiques', pt: 'Fornecimento de Bilhetes e Rolos T\u00e9rmicos' },
      desc: { en: 'Tickets and thermal rolls compatible with all brands, with scheduled deliveries so you never run out.', fr: 'Billets et rouleaux thermiques compatibles avec toutes les marques, livraisons programm\u00e9es.', pt: 'Bilhetes e rolos t\u00e9rmicos compat\u00edveis com todas as marcas, com entregas programadas.' }},
    { title: { en: 'Vehicle Barriers for Access Control', fr: 'Barri\u00e8res V\u00e9hiculaires pour Contr\u00f4le d\u2019Acc\u00e8s', pt: 'Barreiras Veiculares para Controle de Acesso' },
      desc: { en: 'Manual, semi-automatic and automatic access solutions with quick, reliable installation for every budget.', fr: 'Solutions d\u2019acc\u00e8s manuelles, semi-automatiques et automatiques avec installation rapide et fiable.', pt: 'Solu\u00e7\u00f5es de acesso manuais, semiautom\u00e1ticas e autom\u00e1ticas com instala\u00e7\u00e3o r\u00e1pida e confi\u00e1vel.' }},
    { title: { en: 'Parking Operations', fr: 'Exploitation de Stationnements', pt: 'Opera\u00e7\u00e3o de Estacionamentos' },
      desc: { en: 'Comprehensive parking management with trained staff, periodic operational and financial reports.', fr: 'Gestion int\u00e9grale de stationnements avec personnel qualifi\u00e9, rapports op\u00e9rationnels et financiers.', pt: 'Gest\u00e3o integral de estacionamentos com pessoal capacitado, relat\u00f3rios operacionais e financeiros.' }},
    { title: { en: 'Comprehensive Parking Solutions', fr: 'Solutions Int\u00e9grales de Stationnement', pt: 'Solu\u00e7\u00f5es Integrais de Estacionamento' },
      desc: { en: 'Consulting, design, installation and commissioning for hospitals, residential and corporate parking.', fr: 'Conseil, conception, installation et mise en service pour h\u00f4pitaux, r\u00e9sidences et parkings d\u2019entreprise.', pt: 'Consultoria, design, instala\u00e7\u00e3o e comissionamento para hospitais, residenciais e estacionamentos corporativos.' }},
    { title: { en: 'CCTV Systems Installation', fr: 'Installation de Syst\u00e8mes CCTV', pt: 'Instala\u00e7\u00e3o de Sistemas CFTV' },
      desc: { en: 'HD video surveillance with night vision, remote monitoring and cloud storage for all types of properties.', fr: 'Vid\u00e9osurveillance HD avec vision nocturne, surveillance \u00e0 distance et stockage cloud.', pt: 'Videomonitoramento HD com vis\u00e3o noturna, monitoramento remoto e armazenamento em nuvem.' }},
    { title: { en: 'Road Civil Works', fr: 'Travaux de Voirie', pt: 'Obra Civil Vi\u00e1ria' },
      desc: { en: 'Speed bumps, bollards, road signage, parking space painting and vehicular circulation design.', fr: 'Ralentisseurs, bornes, signalisation routi\u00e8re, marquage au sol et conception de circulation.', pt: 'Lombadas, balizadores, sinaliza\u00e7\u00e3o vi\u00e1ria, pintura de vagas e design de circula\u00e7\u00e3o veicular.' }},
    { title: { en: 'Consulting & Permit Management', fr: 'Conseil et Gestion de Permis', pt: 'Assessoria e Gest\u00e3o de Licen\u00e7as' },
      desc: { en: 'Management of municipal permits, operating licenses, environmental and regulatory procedures.', fr: 'Gestion des permis municipaux, licences d\u2019exploitation, proc\u00e9dures environnementales et r\u00e9glementaires.', pt: 'Gest\u00e3o de licen\u00e7as municipais, alvar\u00e1s de opera\u00e7\u00e3o, tr\u00e2mites ambientais e regulat\u00f3rios.' }},
    { title: { en: 'Custom Solutions', fr: 'Solutions Sur Mesure', pt: 'Solu\u00e7\u00f5es Sob Medida' },
      desc: { en: 'Custom parking, access and surveillance projects with 26 years of multidisciplinary experience.', fr: 'Projets personnalis\u00e9s de stationnement, acc\u00e8s et surveillance avec 26 ans d\u2019exp\u00e9rience multidisciplinaire.', pt: 'Projetos personalizados de estacionamento, acesso e vigil\u00e2ncia com 26 anos de experi\u00eancia multidisciplinar.' }}
  ];
  const svcOriginals = [];

  // Client card translations
  const clientDescs = [
    { en: 'One of the most iconic shopping centers in Tijuana with high daily vehicle traffic.', fr: 'L\u2019un des centres commerciaux les plus embl\u00e9matiques de Tijuana avec un trafic quotidien \u00e9lev\u00e9.', pt: 'Um dos centros comerciais mais emblem\u00e1ticos de Tijuana com alto fluxo veicular di\u00e1rio.' },
    { en: 'Avant-garde architectural shopping center in the R\u00edo zone of Tijuana.', fr: 'Centre commercial d\u2019architecture avant-gardiste dans la zone R\u00edo de Tijuana.', pt: 'Centro comercial de arquitetura vanguardista na zona R\u00edo de Tijuana.' },
    { en: 'Large format shopping plaza with automated parking.', fr: 'Centre commercial grand format avec stationnement automatis\u00e9.', pt: 'Pra\u00e7a comercial de grande formato com estacionamento automatizado.' },
    { en: 'Parking system of the airport with the highest border traffic in Mexico.', fr: 'Syst\u00e8me de stationnement de l\u2019a\u00e9roport au plus fort trafic frontalier du Mexique.', pt: 'Sistema de estacionamento do aeroporto com maior tr\u00e1fego fronteiri\u00e7o do M\u00e9xico.' },
    { en: 'Modern town center in the Otay area with comprehensive access control.', fr: 'Centre urbain moderne dans la zone Otay avec contr\u00f4le d\u2019acc\u00e8s int\u00e9gral.', pt: 'Town center moderno na zona de Otay com sistema de controle de acesso integral.' },
    { en: 'Shopping center with automated parking and efficient payment solution.', fr: 'Centre commercial avec stationnement automatis\u00e9 et solution de paiement efficace.', pt: 'Centro comercial com solu\u00e7\u00e3o de estacionamento automatizado e cobran\u00e7a eficiente.' },
    { en: 'Reference shopping plaza with barrier and automated payment systems.', fr: 'Centre commercial de r\u00e9f\u00e9rence avec syst\u00e8mes de barri\u00e8res et paiement automatis\u00e9.', pt: 'Pra\u00e7a comercial de refer\u00eancia com sistema de barreiras e cobran\u00e7a automatizada.' },
    { en: 'Main shopping center of Playas de Rosarito with managed parking.', fr: 'Principal centre commercial de Playas de Rosarito avec stationnement g\u00e9r\u00e9.', pt: 'Principal centro comercial de Playas de Rosarito com estacionamento gerenciado.' },
    { en: 'Shopping center with comprehensive vehicle control and automated payment.', fr: 'Centre commercial avec contr\u00f4le v\u00e9hiculaire int\u00e9gral et paiement automatis\u00e9.', pt: 'Centro comercial com sistema integral de controle veicular e cobran\u00e7a automatizada.' }
  ];
  const clientOriginals = [];

  const btnMeInteresa = { en: 'I\'m Interested', fr: 'Je suis int\u00e9ress\u00e9', pt: 'Me Interessa' };
  const btnVerMas = { en: 'See More', fr: 'Voir Plus', pt: 'Ver Mais' };
  const ctaTexts = {
    title: { en: 'See all our clients', fr: 'Voir tous nos clients', pt: 'Ver todos os nossos clientes' },
    desc: { en: 'Explore the interactive map with all the locations where we have worked.', fr: 'Explorez la carte interactive avec tous les emplacements o\u00f9 nous avons travaill\u00e9.', pt: 'Explore o mapa interativo com todas as localiza\u00e7\u00f5es onde trabalhamos.' },
    btn: { en: 'View Map', fr: 'Voir la Carte', pt: 'Ver Mapa' }
  };

  // Footer nav links
  const footerNav = { en: 'Navigation', fr: 'Navigation', pt: 'Navega\u00e7\u00e3o' };
  const footerContact = { en: 'Contact', fr: 'Contact', pt: 'Contato' };

  function applyLang(lang) {
    if (lang === 'es') {
      // Restore originals
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (originals[key] !== undefined) el.innerHTML = originals[key];
      });
      document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (originals[key] !== undefined) el.placeholder = originals[key];
      });
      // Restore service cards
      document.querySelectorAll('.services-grid .card').forEach((card, i) => {
        if (svcOriginals[i]) {
          card.querySelector('.card-title').textContent = svcOriginals[i].title;
          card.querySelector('.card-description').textContent = svcOriginals[i].desc;
          const btn = card.querySelector('.btn');
          if (btn) btn.textContent = svcOriginals[i].btn;
        }
      });
      // Restore client cards
      document.querySelectorAll('.clients-grid .card-client').forEach((card, i) => {
        if (clientOriginals[i]) {
          card.querySelector('.card-description').textContent = clientOriginals[i].desc;
          const btn = card.querySelector('.btn');
          if (btn) btn.textContent = clientOriginals[i].btn;
        }
      });
      // CTA
      const cta = document.querySelector('.clients-cta-wrapper');
      if (cta && cta._origTitle) {
        cta.querySelector('.card-title').textContent = cta._origTitle;
        cta.querySelector('.card-description').textContent = cta._origDesc;
        cta.querySelector('.btn').textContent = cta._origBtn;
      }
      // Footer headings
      const fLinks = document.querySelectorAll('.footer-links h4');
      if (fLinks[0] && fLinks[0]._orig) fLinks[0].textContent = fLinks[0]._orig;
      if (fLinks[1] && fLinks[1]._orig) fLinks[1].textContent = fLinks[1]._orig;

      document.documentElement.lang = 'es';
    } else {
      const dict = T[lang];
      if (!dict) return;

      // data-i18n elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerHTML = dict[key];
      });
      // placeholders
      document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (dict[key]) el.placeholder = dict[key];
      });
      // Service cards
      document.querySelectorAll('.services-grid .card').forEach((card, i) => {
        if (!svcOriginals[i]) {
          svcOriginals[i] = {
            title: card.querySelector('.card-title').textContent,
            desc: card.querySelector('.card-description').textContent,
            btn: card.querySelector('.btn')?.textContent || ''
          };
        }
        if (serviceCards[i]) {
          card.querySelector('.card-title').textContent = serviceCards[i].title[lang] || serviceCards[i].title.en;
          card.querySelector('.card-description').textContent = serviceCards[i].desc[lang] || serviceCards[i].desc.en;
          const btn = card.querySelector('.btn');
          if (btn) btn.textContent = btnMeInteresa[lang] || btnMeInteresa.en;
        }
      });
      // Client cards
      document.querySelectorAll('.clients-grid .card-client').forEach((card, i) => {
        if (!clientOriginals[i]) {
          clientOriginals[i] = {
            desc: card.querySelector('.card-description').textContent,
            btn: card.querySelector('.btn')?.textContent || ''
          };
        }
        if (clientDescs[i]) {
          card.querySelector('.card-description').textContent = clientDescs[i][lang] || clientDescs[i].en;
          const btn = card.querySelector('.btn');
          if (btn) btn.textContent = btnVerMas[lang] || btnVerMas.en;
        }
      });
      // CTA card
      const cta = document.querySelector('.clients-cta-wrapper');
      if (cta) {
        if (!cta._origTitle) {
          cta._origTitle = cta.querySelector('.card-title').textContent;
          cta._origDesc = cta.querySelector('.card-description').textContent;
          cta._origBtn = cta.querySelector('.btn').textContent;
        }
        cta.querySelector('.card-title').textContent = ctaTexts.title[lang] || ctaTexts.title.en;
        cta.querySelector('.card-description').textContent = ctaTexts.desc[lang] || ctaTexts.desc.en;
        cta.querySelector('.btn').textContent = ctaTexts.btn[lang] || ctaTexts.btn.en;
      }
      // Footer headings
      const fLinks = document.querySelectorAll('.footer-links h4');
      if (fLinks[0]) { if (!fLinks[0]._orig) fLinks[0]._orig = fLinks[0].textContent; fLinks[0].textContent = footerNav[lang] || footerNav.en; }
      if (fLinks[1]) { if (!fLinks[1]._orig) fLinks[1]._orig = fLinks[1].textContent; fLinks[1].textContent = footerContact[lang] || footerContact.en; }

      document.documentElement.lang = lang;
    }
  }

  // Toggle dropdown
  let justOpened = false;
  langBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const willOpen = !langDropdown.classList.contains('open');
    langDropdown.classList.toggle('open');
    if (willOpen) {
      justOpened = true;
      setTimeout(() => { justOpened = false; }, 100);
    }
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (justOpened) return;
    if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
      langDropdown.classList.remove('open');
    }
  });

  // Language option click
  langDropdown.querySelectorAll('.lang-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const lang = opt.getAttribute('data-lang');
      if (lang === currentLang) { langDropdown.classList.remove('open'); return; }

      currentLang = lang;
      langCurrent.textContent = lang.toUpperCase();
      langDropdown.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      langDropdown.classList.remove('open');

      applyLang(lang);
    });
  });
}

initLanguageSwitcher();


// ========== CONTACT FORM ==========
const contactForm = document.getElementById('contactForm');
const submitBtn = contactForm.querySelector('.btn-submit');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());

  if (!data.nombre || !data.celular || !data.empresa || !data.correo || !data.descripcion) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Error al enviar');

    contactForm.innerHTML = `
      <div class="form-success">
        <div class="success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3>Mensaje enviado</h3>
        <p>Gracias por contactarnos, ${data.nombre}. Un asesor se comunicará contigo a la brevedad.</p>
      </div>
    `;
  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Quiero que me contacten';
    alert('Hubo un error al enviar tu mensaje. Por favor intenta de nuevo o llámanos al 664 630 1792.');
  }
});
