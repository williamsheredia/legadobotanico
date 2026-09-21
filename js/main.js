document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. CABECERA Y MENÚ HAMBURGUESA DINÁMICO
  // ==========================================
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.menu-toggle');
  const menuNav = document.querySelector('.nav-links');

  // Efecto traslúcido en scroll
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    });
  }

  // Apertura y cierre del menú móvil
  if (toggleBtn && menuNav) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = menuNav.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      toggleBtn.classList.remove('arrow'); // Detiene la animación pendular al abrir
    });

    // Cierre al seleccionar un enlace
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        menuNav.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Temporizador para alternar la animación de hojas en estado reposo
    setInterval(() => {
      if (!menuNav.classList.contains('open')) {
        toggleBtn.classList.toggle('arrow');
      }
    }, 3500);
  }

  // Año dinámico para el footer
  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ==========================================
  // 2. CARGA DINÁMICA DE FEED DE INSTAGRAM
  // ==========================================
  const instaContainer = document.getElementById("insta-feed");
  if (instaContainer) {
    fetch("/.netlify/functions/instagram")
      .then((res) => res.json())
      .then((data) => {
        const posts = data.data || data.media?.data || [];

        if (posts.length === 0) {
          instaContainer.innerHTML = "<p class='insta-loading'>No se encontraron publicaciones recientes.</p>";
          return;
        }

        instaContainer.innerHTML = "";

        posts.slice(0, 4).forEach((post) => {
          const imageUrl = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
          const date = new Date(post.timestamp).toLocaleDateString("es-PE", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
          const caption = post.caption || "Ver publicación en Instagram";

          const card = document.createElement("article");
          card.className = "insta-card";
          card.innerHTML = `
            <img src="${imageUrl}" alt="Publicación Legado Botánico" class="insta-media" loading="lazy">
            <div class="insta-body">
              <span class="insta-date">${date}</span>
              <p class="insta-caption">${caption}</p>
              <a href="${post.permalink}" target="_blank" rel="noopener noreferrer" class="insta-link">Ver en Instagram →</a>
            </div>
          `;
          instaContainer.appendChild(card);
        });
      })
      .catch(() => {
        instaContainer.innerHTML = "<p class='insta-loading'>Sigue nuestras novedades en Instagram.</p>";
      });
  }

  // ==========================================
  // 3. GESTIÓN DE MODALES POP-UP (AJAX)
  // ==========================================
  const setupModal = (btnAbrirId, btnCerrarId, modalId, formName, exitoTitulo, exitoTexto, btnFooterId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const form = modal.querySelector(`form[name="${formName}"]`);
    const btnCerrar = document.getElementById(btnCerrarId);
    const btnAbrir = document.getElementById(btnAbrirId);
    const btnFooter = document.getElementById(btnFooterId);

    if (!form) return;

    // Crear contenedor para mensaje de respuesta AJAX
    let exitoContainer = modal.querySelector('.modal-exito-mensaje');
    if (!exitoContainer) {
      exitoContainer = document.createElement('div');
      exitoContainer.className = 'modal-exito-mensaje';
      exitoContainer.style.display = 'none';
      exitoContainer.style.textAlign = 'center';
      exitoContainer.style.padding = '30px 10px';
      modal.querySelector('.modal-content').appendChild(exitoContainer);
    }

    const abrir = () => {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const cerrarModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      
      setTimeout(() => {
        form.reset();
        form.style.display = 'block';
        const header = modal.querySelector('.form-header');
        if (header) header.style.display = 'block';
        exitoContainer.style.display = 'none';
      }, 300);
    };

    if (btnAbrir) btnAbrir.addEventListener('click', abrir);
    if (btnFooter) btnFooter.addEventListener('click', abrir);
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModal();
    });

    // Envío en segundo plano para Netlify
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
      .then(() => {
        form.style.display = 'none';
        const header = modal.querySelector('.form-header');
        if (header) header.style.display = 'none';

        exitoContainer.innerHTML = `
          <span style="font-size: 3rem;">🌱</span>
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 15px 0 10px; color: var(--ink);">${exitoTitulo}</h3>
          <p style="color: var(--muted); line-height: 1.5;">${exitoTexto}</p>
        `;
        exitoContainer.style.display = 'block';
      })
      .catch((error) => console.error('Error al enviar formulario:', error));
    });
  };

  // Inicialización de Modales
  setupModal(
    'btn-abrir-aporte',
    'btn-cerrar-aporte',
    'modal-aporte',
    'donaciones',
    '¡Gracias por tu propuesta!',
    'Hemos recibido tu información correctamente. Nos pondremos en contacto contigo muy pronto para coordinar.',
    'btn-abrir-aporte-footer'
  );

  setupModal(
    'btn-abrir-voluntario',
    'btn-cerrar-voluntario',
    'modal-voluntario',
    'voluntarios',
    '¡Bienvenido a la comunidad!',
    'Tu registro de voluntariado ha sido enviado con éxito. Te contactaremos pronto para coordinar tu participación.',
    'btn-abrir-voluntario-footer'
  );

  // Cierre con la tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      const modalAporte = document.getElementById('modal-aporte');
      const modalVoluntario = document.getElementById('modal-voluntario');

      if (modalAporte?.classList.contains('active')) {
        document.getElementById('btn-cerrar-aporte')?.click();
      }
      if (modalVoluntario?.classList.contains('active')) {
        document.getElementById('btn-cerrar-voluntario')?.click();
      }
    }
  });

  // ==========================================
  // 4. SUSCRIPCIÓN AL BOLETÍN INFORMATIVO
  // ==========================================
  const newsletterForm = document.querySelector('form[name="boletin"]');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(newsletterForm);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
      .then(() => {
        newsletterForm.innerHTML = '<p style="color: #76d577; font-weight: bold; margin-top: 10px;">¡Gracias por unirte! 🌱</p>';
      })
      .catch((error) => console.error('Error en suscripción:', error));
    });
  }
});









// ==========================================
  // 5. ROTACIÓN AUTOMÁTICA DE GALERÍA (CADA 3 SEGUNDOS)
  // ==========================================
  const galleryGrid = document.getElementById('dynamic-gallery');
  if (galleryGrid) {
    const mainImg = galleryGrid.querySelector('.item-main img');
    const mainCaption = galleryGrid.querySelector('.item-main .gallery-caption');
    const secondaryItems = Array.from(galleryGrid.querySelectorAll('.gallery-item:not(.item-main)'));

    let currentRotationIndex = 0;

    const rotateGalleryImage = () => {
      // Solo ejecutar rotación automática en pantallas de escritorio (> 768px)
      if (window.innerWidth <= 768 || secondaryItems.length === 0) return;

      const targetItem = secondaryItems[currentRotationIndex];
      const targetImg = targetItem.querySelector('img');
      const targetCaption = targetItem.querySelector('.gallery-caption');

      if (!targetImg || !mainImg) return;

      // Efecto suave de transición por opacidad
      mainImg.style.opacity = '0.3';
      targetImg.style.opacity = '0.3';

      setTimeout(() => {
        // Intercambio de rutas de imagen y leyendas
        const tempSrc = mainImg.src;
        const tempAlt = mainImg.alt;
        const tempText = mainCaption ? mainCaption.textContent : '';

        mainImg.src = targetImg.src;
        mainImg.alt = targetImg.alt;
        if (mainCaption && targetCaption) mainCaption.textContent = targetCaption.textContent;

        targetImg.src = tempSrc;
        targetImg.alt = tempAlt;
        if (targetCaption) targetCaption.textContent = tempText;

        mainImg.style.opacity = '1';
        targetImg.style.opacity = '1';
      }, 300);

      currentRotationIndex = (currentRotationIndex + 1) % secondaryItems.length;
    };

    // Rotación automática cada 3000 ms (3 segundos)
    let galleryInterval = setInterval(rotateGalleryImage, 3000);

    // Pausar rotación si el usuario pasa el cursor sobre la galería
    galleryGrid.addEventListener('mouseenter', () => clearInterval(galleryInterval));
    galleryGrid.addEventListener('mouseleave', () => {
      galleryInterval = setInterval(rotateGalleryImage, 3000);
    });
  }









