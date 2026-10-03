/**
 * AstroCHIA — Lógica e Interactividad
 * Starfield Canvas • Filtrado de Científicas • Navegación y Animaciones
 */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initNavigation();
  initDirectoryFilters();
  initStatsCounter();
  initForms();
  initYear();
});

/* ==========================================================================
   1. Starfield Canvas — Fondo Estelar Interactivo
   ========================================================================== */
function initStarfield() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const starCount = Math.floor((width * height) / 4500);
  const stars = [];

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: Math.random() > 0.85 ? '#ffd166' : Math.random() > 0.7 ? '#9d4edd' : '#ffffff'
    });
  }

  // Estrellas Fugaces
  const shootingStars = [];

  function createShootingStar() {
    shootingStars.push({
      x: Math.random() * width * 0.8,
      y: Math.random() * height * 0.4,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 10 + 12,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      opacity: 1
    });
  }

  setInterval(() => {
    if (Math.random() > 0.4 && shootingStars.length < 3) {
      createShootingStar();
    }
  }, 4000);

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Dibujar estrellas
    for (let s of stars) {
      s.alpha += s.speed * s.direction;
      if (s.alpha > 0.95 || s.alpha < 0.15) {
        s.direction *= -1;
      }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
      ctx.fill();
    }

    // Dibujar estrellas fugaces
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      const tailX = ss.x - Math.cos(ss.angle) * ss.length;
      const tailY = ss.y - Math.sin(ss.angle) * ss.length;

      const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 209, 102, ${ss.opacity})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.opacity -= 0.015;

      if (ss.opacity <= 0 || ss.x > width || ss.y > height) {
        shootingStars.splice(i, 1);
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* ==========================================================================
   2. Navegación & Scroll
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('main-header');
  const toggleBtn = document.getElementById('nav-toggle-btn');
  const menuWrapper = document.getElementById('nav-menu-wrapper');
  const navLinks = document.querySelectorAll('.nav-link');

  // Efecto de fondo en scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Resaltar link activo en scroll
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Toggle de menú móvil
  if (toggleBtn && menuWrapper) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = menuWrapper.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar al dar click en un enlace
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuWrapper.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================================================
   3. Filtrado y Búsqueda en el Directorio
   ========================================================================== */
function initDirectoryFilters() {
  const searchInput = document.getElementById('scientist-search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const filterPills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.scientist-card');

  let currentCategory = 'all';
  let searchTerm = '';

  function filterCards() {
    cards.forEach(card => {
      const categories = card.getAttribute('data-category') || '';
      const textContent = card.innerText.toLowerCase();

      const matchesCategory = currentCategory === 'all' || categories.includes(currentCategory);
      const matchesSearch = searchTerm === '' || textContent.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
      }
    });
  }

  // Filtro por botones
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      currentCategory = pill.getAttribute('data-filter');
      filterCards();
    });
  });

  // Búsqueda en tiempo real
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      if (clearBtn) {
        clearBtn.style.display = searchTerm ? 'block' : 'none';
      }
      filterCards();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        clearBtn.style.display = 'none';
        filterCards();
        searchInput.focus();
      });
    }
  }
}

/* ==========================================================================
   4. Animación del Contador de Métricas
   ========================================================================== */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(numEl => {
          const target = parseInt(numEl.getAttribute('data-target'), 10);
          const isYear = target > 2000;
          const duration = 1600;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOutProgress * target);

            if (isYear) {
              numEl.innerText = currentVal;
            } else {
              numEl.innerText = `+${currentVal}`;
            }

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              numEl.innerText = isYear ? target : `+${target}`;
            }
          }

          requestAnimationFrame(updateCounter);
        });
      }
    });
  }, { threshold: 0.4 });

  const statsSection = document.getElementById('quick-stats-counter');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* ==========================================================================
   5. Manejo de Formularios
   ========================================================================== */
function initForms() {
  // Formulario de Registro
  const registerForm = document.getElementById('chia-register-form');
  const registerFeedback = document.getElementById('form-feedback');

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('form-submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Enviando registro...</span>';

      setTimeout(() => {
        registerFeedback.className = 'form-feedback success';
        registerFeedback.innerHTML = '✨ <strong>¡Solicitud enviada con éxito!</strong> Bienvenida a AstroCHIA. Revisaremos tus datos y te contactaremos en breve.';
        registerFeedback.style.display = 'block';
        registerForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Enviar Solicitud de Registro</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      }, 900);
    });
  }

  // Formulario Rápido de Contacto — Envío a astrochiacol@gmail.com
  const contactForm = document.getElementById('contact-quick-form');
  const contactFeedback = document.getElementById('contact-quick-feedback');
  const contactSubmitBtn = document.getElementById('contact-submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const message = document.getElementById('contact-msg').value;

      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.innerText = 'Enviando mensaje...';
      }

      try {
        const formData = new FormData();
        formData.append('_subject', `Nuevo mensaje de contacto de ${name} — AstroCHIA`);
        formData.append('Nombre', name);
        formData.append('Correo', email);
        formData.append('Mensaje', message);
        const response = await fetch('https://formsubmit.co/ajax/astrochiacol@gmail.com', {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData
        });

        if (response.ok) {
          contactFeedback.className = 'form-feedback success';
          contactFeedback.innerHTML = 'Mensaje enviado';
          contactFeedback.style.display = 'block';
          contactForm.reset();
        } else {
          throw new Error('Error al enviar');
        }
      } catch (err) {
        contactFeedback.className = 'form-feedback';
        contactFeedback.style.color = '#ffd166';
        contactFeedback.innerHTML = `⚠️ No pudimos enviar el formulario automáticamente. Puedes escribirnos directamente a <a href="mailto:astrochiacol@gmail.com?subject=Contacto AstroCHIA&body=${encodeURIComponent(message)}" style="color: var(--gold-lunar); text-decoration: underline;">astrochiacol@gmail.com</a>.`;
        contactFeedback.style.display = 'block';
      } finally {
        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.innerText = 'Enviar Mensaje';
        }
      }
    });
  }
}

/* ==========================================================================
   6. Año Automático en Footer
   ========================================================================== */
function initYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.innerText = new Date().getFullYear();
  }
}
