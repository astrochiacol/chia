/**
 * AstroCHIA — Directorio de Científicas
 * Carga de datos • Búsqueda en tiempo real • Filtros • Registro dinámico • Exportación a Excel/CSV
 */
import { db, ref, onValue, set, push } from "./firebase-config.js";
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initNavigation();
  initDirectory();
  initYear();
});



let allScientists = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let uploadedPhotoBase64 = '';

/* ==========================================================================
   1. Carga y Gestión del Directorio
   ========================================================================== */
async function initDirectory() {
  const container = document.getElementById('directory-cards-container');
  const searchInput = document.getElementById('dir-search-input');
  const clearBtn = document.getElementById('dir-clear-btn');
  const filterPills = document.querySelectorAll('#dir-filter-pills .filter-pill');
  const exportBtn = document.getElementById('btn-export-excel');
  const resetBtn = document.getElementById('btn-reset-filters');

  // 1. Cargar datos desde Firebase Realtime Database y escuchar cambios en tiempo real
  const dbRef = ref(db, 'scientists');
  onValue(dbRef, (snap) => {
    const data = snap.val();
    allScientists = data ? Object.values(data) : [];
    renderCards();
    showNotification('Datos cargados');
  }, (error) => {
    console.warn('⚠️ Error al cargar datos desde Firebase:', error);
    allScientists = [];
  });



  // Render inicial

  // Búsqueda en tiempo real (por nombre, institución o campo)
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value.toLowerCase().trim();
      if (clearBtn) clearBtn.style.display = currentSearchTerm ? 'block' : 'none';
      renderCards();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchTerm = '';
      clearBtn.style.display = 'none';
      renderCards();
      searchInput.focus();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchTerm = '';
      if (clearBtn) clearBtn.style.display = 'none';
      currentCategory = 'all';
      filterPills.forEach(p => p.classList.toggle('active', p.getAttribute('data-filter') === 'all'));
      renderCards();
    });
  }

  // Filtros rápidos
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-filter').toLowerCase();
      renderCards();
    });
  });

  // Exportar a Excel (.csv)
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToCSV);
  }

  // Formulario de Registro
  initRegisterForm();
}

// Utility to show toast notifications
function showNotification(message, isError = false) {
  const notif = document.getElementById('notification');
  if (!notif) return;
  notif.textContent = message;
  notif.style.background = isError ? 'rgba(255,0,0,0.8)' : 'var(--gold-lunar)';
  notif.style.display = 'block';
  // Fade out after 3 seconds
  setTimeout(() => {
    notif.style.display = 'none';
  }, 3000);
}

/* ==========================================================================
   2. Renderizado de Tarjetas Sencillas y Elegantes
   ========================================================================== */
function renderCards() {
  const container = document.getElementById('directory-cards-container');
  const countText = document.getElementById('results-count-text');
  const noResultsMsg = document.getElementById('no-results-msg');
  if (!container) return;

  const filtered = allScientists.filter(scientist => {
    // Coincidencia de búsqueda (Nombre, Institución o Áreas)
    const nameMatch = scientist.nombre.toLowerCase().includes(currentSearchTerm);
    const instMatch = (scientist.institucion || '').toLowerCase().includes(currentSearchTerm);
    const titleMatch = (scientist.titulo || '').toLowerCase().includes(currentSearchTerm);
    const areasString = (Array.isArray(scientist.areas) ? scientist.areas.join(' ') : (scientist.areas || '')).toLowerCase();
    const areasMatch = areasString.includes(currentSearchTerm);

    const matchesSearch = currentSearchTerm === '' || (nameMatch || instMatch || titleMatch || areasMatch);

    // Coincidencia de categoría
    let matchesCategory = currentCategory === 'all';
    if (!matchesCategory) {
      matchesCategory = areasString.includes(currentCategory);
    }

    return matchesSearch && matchesCategory;
  });

  // Contador
  if (countText) {
    if (allScientists.length === 0) {
      countText.innerText = '0 investigadoras registradas';
    } else {
      countText.innerText = `${filtered.length} investigadora${filtered.length === 1 ? '' : 's'} encontrada${filtered.length === 1 ? '' : 's'}`;
    }
  }

  // Estado si el directorio está completamente en blanco
  if (allScientists.length === 0) {
    container.innerHTML = `
      <div class="glass-panel no-results-box" style="grid-column: 1 / -1; padding: 60px 24px; text-align: center;">
        <div class="no-results-icon" style="font-size: 3rem; margin-bottom: 14px;">✨🔭</div>
        <h3 style="font-family: var(--font-heading); color: var(--gold-lunar); font-size: 1.4rem; margin-bottom: 10px;">
          Directorio listo para inaugurarse
        </h3>
        <p style="color: var(--text-secondary); max-width: 520px; margin: 0 auto 24px; font-size: 0.95rem; line-height: 1.6;">
          Aún no hay científicas registradas en la base de datos. Puedes empezar a cargar los perfiles oficiales usando el formulario de abajo.
        </p>
        <a href="#registro-directorio" class="btn btn-primary">
          <span>+ Cargar Primera Investigadora</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        </a>
      </div>
    `;
    if (noResultsMsg) noResultsMsg.style.display = 'none';
    return;
  }

  // Estado si una búsqueda no arroja coincidencias
  if (filtered.length === 0) {
    container.innerHTML = '';
    if (noResultsMsg) noResultsMsg.style.display = 'block';
    return;
  }

  if (noResultsMsg) noResultsMsg.style.display = 'none';

  container.innerHTML = filtered.map(item => {
    const areas = Array.isArray(item.areas) 
      ? item.areas 
      : (typeof item.areas === 'string' ? item.areas.split(',').map(s => s.trim()) : []);

    const initials = item.nombre
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();

    // Foto opcional o avatar con placeholder
    const avatarHtml = item.foto && item.foto.trim()
      ? `<div class="card-avatar-photo"><img src="${item.foto}" alt="${item.nombre}" class="member-img"></div>`
      : `<div class="card-avatar-photo"><img src="https://via.placeholder.com/84?text=${initials}" alt="${item.nombre}" class="member-img"></div>`;

    // Enlaces de contacto (redes y/o correo si los proporcionaron)
    let contactLinksHtml = '';
    if (item.correo) {
      contactLinksHtml += `<a href="mailto:${item.correo}" class="contact-pill-btn" title="Enviar correo">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <span>Correo</span>
      </a>`;
    }
    if (item.redes) {
      contactLinksHtml += `<a href="${item.redes}" target="_blank" rel="noopener" class="contact-pill-btn" title="Ver perfil">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        <span>Perfil / Red</span>
      </a>`;
    }

    return `
      <article class="scientist-card-simple glass-panel">
        <div class="card-simple-header">
          ${avatarHtml}
          <div class="card-title-group">
            <h3 class="scientist-card-name">${escapeHTML(item.nombre)}</h3>
            <p class="scientist-card-degree">${escapeHTML(item.titulo || '')}</p>
            <p class="scientist-card-role">${escapeHTML(item.profesion || '')}</p>
          </div>
          <p class="scientist-card-location"> Ubicación: ${escapeHTML(item.pais || 'Desconocida')}</p>
        </div>

        <div class="card-institution-row">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4"/></svg>
          <span>${escapeHTML(item.institucion || 'Investigadora Independiente')}</span>
        </div>

        <div class="scientist-tags">
          ${areas.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}
        </div>

        ${contactLinksHtml ? `<div class="card-simple-footer">${contactLinksHtml}</div>` : ''}
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   3. Manejo del Formulario de Registro
   ========================================================================== */
function initRegisterForm() {
  const form = document.getElementById('scientist-register-form');
  const fileInput = document.getElementById('form-foto-file');
  const previewContainer = document.getElementById('photo-preview-container');
  const previewImg = document.getElementById('photo-preview-img');
  const feedback = document.getElementById('register-feedback');
  const submitBtn = document.getElementById('btn-submit-register');
    
  // Previsualización de foto (opcional)
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedPhotoBase64 = event.target.result;
          if (previewImg && previewContainer) {
            previewImg.src = uploadedPhotoBase64;
            previewContainer.style.display = 'flex';
          }
        };
        reader.readAsDataURL(file);
      } else {
        uploadedPhotoBase64 = '';
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewImg) previewImg.src = '';
    }
  });
  }
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('form-nombre').value.trim();
        const tituloPrefix = document.getElementById('form-titulo-prefix').value;
        const tituloSuffix = document.getElementById('form-titulo-suffix').value.trim();
        const titulo = tituloPrefix ? (tituloPrefix + (tituloSuffix ? ' ' + tituloSuffix : '')) : tituloSuffix;
      const profesion = document.getElementById('form-profesion').value.trim();
      const institucion = document.getElementById('form-institucion').value.trim();
      const areasRaw = document.getElementById('form-areas').value.trim();
      const correo = document.getElementById('form-correo').value.trim();
      const redes = document.getElementById('form-redes').value.trim();
      const ciudad = document.getElementById('form-ciudad').value.trim();
      const pais = document.getElementById('form-pais').value.trim();

      const areasArray = areasRaw
        ? areasRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const newScientist = {
        id: Date.now(),
        nombre,
        titulo,
        profesion,
        institucion,
        ciudad,
        pais,
        areas: areasArray,
        correo,
        redes,
        foto: '' // will be set after Imgur upload if applicable
      };

      // Agregar al inicio del arreglo
      allScientists.unshift(newScientist);

      // Desactivar botón mientras se guarda
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Guardando registro...</span>';

      try {
        // If a photo was selected, upload it to Firebase Storage and store the download URL
        if (uploadedPhotoBase64) {
          console.log('Uploading photo to Firebase Storage');
          const photoURL = await uploadToFirebase(uploadedPhotoBase64);
          if (photoURL) {
            newScientist.foto = photoURL;
          }
        }
        await persistScientistsToFirebase(allScientists);
        feedback.className = 'form-feedback success';
        feedback.innerHTML = `✨ <strong>¡Registro exitoso!</strong> Tu tarjeta ha sido creada y agregada al directorio de científicas.`;
      } catch (err) {
        feedback.className = 'form-feedback';
        feedback.innerHTML = `⚠️ <strong>¡Error!</strong> No se pudo guardar la información.`;
        console.error(err);
      } finally {
        if (feedback) feedback.style.display = 'block';
        // Reset del formulario
        form.reset();
        uploadedPhotoBase64 = '';
        if (previewContainer) previewContainer.style.display = 'none';
        // Reactivar botón
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtn) submitBtn.innerHTML = '<span>Guardar y Agregar al Directorio</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        // Actualizar UI
        renderCards();
        document.getElementById('directory-cards-container').scrollIntoView({ behavior: 'smooth' });
      }
    });



  }
}

// Map functionality removed




/**
 * Persiste el listado de científicas en Firebase Realtime Database y retorna una promesa.
 */
function persistScientistsToFirebase(scientists) {
  // Ensure we write to the correct path and log the payload for debugging
  console.debug('Persisting scientists to Firebase:', scientists);
  const dbRef = ref(db, '/scientists');
  return set(dbRef, scientists)
    .then(() => {
      console.info('✅ Científicas guardadas en Firebase Realtime Database');
    })
    .catch((e) => {
      console.error('❌ Error guardando científicas en Firebase:', e);
      throw e;
    });
}

  async function uploadToFirebase(base64Data) {
    console.log('Attempting to upload image to Firebase Storage');
    console.log('Base64 data preview:', base64Data.substring(0,30), '...');
    try {
      const storage = getStorage();
      const fileName = `scientist_${Date.now()}`;
      const imgRef = storageRef(storage, `images/cientificas/${fileName}`);
      // uploadString with 'data_url' preserves the data URL header
      await uploadString(imgRef, base64Data, 'data_url');
      const downloadURL = await getDownloadURL(imgRef);
      console.info('✅ Image uploaded to Firebase Storage:', downloadURL);
      return downloadURL;
    } catch (err) {
      console.error('❌ Error uploading image to Firebase Storage:', err);
      return '';
    }
  }



async function uploadImageToRepo(base64Data) {
  try {
    const fileName = `scientist_${Date.now()}.png`;
    const baseUrl = window.location.origin;
    const resp = await fetch(`${baseUrl}/.netlify/functions/upload-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64Data, fileName })
    });
    console.log('Upload response status:', resp.status);
    if (!resp.ok) {
      const err = await resp.text();
      console.error('❌ GitHub upload failed:', err);
      return '';
    }
    const data = await resp.json();
    if (!data.url) {
      console.warn('⚠️ No URL returned from upload-image function');
      return '';
    }
    return data.url;
  } catch (e) {
    console.error('❌ Error uploading image to GitHub via Netlify:', e);
    return '';
  }
}


/* ==========================================================================
   4. Exportar Datos a Archivo Excel / CSV
   ========================================================================== */
function exportToCSV() {
  if (!allScientists || allScientists.length === 0) {
    alert('No hay investigadoras registradas para exportar.');
    return;
  }

  // Encabezados para Excel
  const headers = ['Nombre', 'Titulo', 'Profesion', 'Institucion', 'Ciudad', 'Pais', 'Areas_de_Investigacion', 'Correo', 'Redes_o_Perfil'];

  const rows = allScientists.map(s => {
    const areas = Array.isArray(s.areas) ? s.areas.join('; ') : s.areas || '';
    return [
      `"${(s.nombre || '').replace(/"/g, '""')}"`,
      `"${(s.titulo || '').replace(/"/g, '""')}"`,
      `"${(s.profesion || '').replace(/"/g, '""')}"`,
      `"${(s.institucion || '').replace(/"/g, '""')}"`,
      `"${(s.ciudad || '').replace(/"/g, '""')}"`,
      `"${(s.pais || '').replace(/"/g, '""')}"`,
      `"${areas.replace(/"/g, '""')}"`,
      `"${(s.correo || '').replace(/"/g, '""')}"`,
      `"${(s.redes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  // \uFEFF es el BOM de UTF-8 para que Microsoft Excel abra los acentos (ñ, tildes) automáticamente bien
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `directorio_cientificas_astrochia_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   5. Starfield Canvas Background
   ========================================================================== */
function initStarfield() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const starCount = Math.floor((width * height) / 4800);
  const stars = [];

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      direction: Math.random() > 0.5 ? 1 : -1,
      color: Math.random() > 0.85 ? '#ffd166' : Math.random() > 0.7 ? '#9d4edd' : '#ffffff'
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let s of stars) {
      s.alpha += s.speed * s.direction;
      if (s.alpha > 0.95 || s.alpha < 0.15) s.direction *= -1;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
      ctx.fill();
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
   6. Navegación Móvil y Utilidades
   ========================================================================== */
function initNavigation() {
  const toggleBtn = document.getElementById('nav-toggle-btn');
  const menuWrapper = document.getElementById('nav-menu-wrapper');

  if (toggleBtn && menuWrapper) {
    toggleBtn.addEventListener('click', () => {
      menuWrapper.classList.toggle('open');
    });
  }
}

function initYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.innerText = new Date().getFullYear();
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getDefaultScientists() {
  return [];
}

