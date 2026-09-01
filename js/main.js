const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-links');

window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 30));

toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

document.querySelector('#year').textContent = new Date().getFullYear();

// Carga dinámica de Instagram
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("insta-feed");
  if (!container) return;

  fetch("/.netlify/functions/instagram")
    .then((res) => res.json())
    .then((data) => {
      const posts = data.data || data.media?.data || [];

      if (posts.length === 0) {
        container.innerHTML = "<p class='insta-loading'>No se encontraron publicaciones recientes.</p>";
        return;
      }

      container.innerHTML = "";

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
        container.appendChild(card);
      });
    })
    .catch(() => {
      container.innerHTML = "<p class='insta-loading'>Sigue nuestras novedades en Instagram.</p>";
    });
});

// Lógica de Modales (Donaciones y Voluntariado)
document.addEventListener('DOMContentLoaded', () => {

  // Auxiliar para manejar modales de forma segura
  const setupModal = (btnAbrirId, btnCerrarId, modalId, formName, exitoTitulo, exitoTexto) => {
    const btnAbrir = document.getElementById(btnAbrirId);
    const btnCerrar = document.getElementById(btnCerrarId);
    const modal = document.getElementById(modalId);
    const form = document.querySelector(`form[name="${formName}"]`);

    if (!btnAbrir || !modal || !form) return;

    // Crear contenedor para mensaje de éxito si no existe
    let exitoContainer = modal.querySelector('.modal-exito-mensaje');
    if (!exitoContainer) {
      exitoContainer = document.createElement('div');
      exitoContainer.className = 'modal-exito-mensaje';
      exitoContainer.style.display = 'none';
      exitoContainer.style.textAlign = 'center';
      exitoContainer.style.padding = '30px 10px';
      modal.querySelector('.modal-content').appendChild(exitoContainer);
    }

    const cerrarModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      
      // Restablecer formulario y vista al cerrar
      setTimeout(() => {
        form.reset();
        form.style.display = 'block';
        const header = modal.querySelector('.form-header');
        if (header) header.style.display = 'block';
        exitoContainer.style.display = 'none';
      }, 300);
    };

    btnAbrir.addEventListener('click', () => {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });

    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModal();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
      .then(() => {
        // Ocultar formulario y mostrar mensaje de éxito
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
      .catch((error) => console.error('Error al enviar el formulario:', error));
    });
  };

  // Inicializar Modal Donaciones
  setupModal(
    'btn-abrir-aporte',
    'btn-cerrar-aporte',
    'modal-aporte',
    'donaciones',
    '¡Gracias por tu propuesta!',
    'Hemos recibido tu información correctamente. Nos pondremos en contacto contigo muy pronto para coordinar.'
  );

  // Inicializar Modal Voluntariado
  setupModal(
    'btn-abrir-voluntario',
    'btn-cerrar-voluntario',
    'modal-voluntario',
    'voluntarios',
    '¡Bienvenido a la comunidad!',
    'Tu registro de voluntariado ha sido enviado con éxito. Te contactaremos pronto para coordinar tu participación.'
  );

});
