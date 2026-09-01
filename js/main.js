const header=document.querySelector('.site-header');const toggle=document.querySelector('.menu-toggle');const menu=document.querySelector('.nav-links');window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30));toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));document.querySelector('#year').textContent=new Date().getFullYear();

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

      // Procesar únicamente las primeras 4 publicaciones
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

// Manejo del formulario de donaciones con AJAX para evitar el 404 de Netlify
document.addEventListener('DOMContentLoaded', () => {
  const btnAbrirAporte = document.getElementById('btn-abrir-aporte');
  const btnCerrarAporte = document.getElementById('btn-cerrar-aporte');
  const modalAporte = document.getElementById('modal-aporte');
  const formDonaciones = document.querySelector('form[name="donaciones"]');

  if (btnAbrirAporte && modalAporte) {
    // Abrir modal
    btnAbrirAporte.addEventListener('click', () => {
      modalAporte.classList.add('active');
      modalAporte.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });

    // Cerrar modal
    const cerrarModal = () => {
      modalAporte.classList.remove('active');
      modalAporte.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (btnCerrarAporte) btnCerrarAporte.addEventListener('click', cerrarModal);

    modalAporte.addEventListener('click', (e) => {
      if (e.target === modalAporte) cerrarModal();
    });

    // Envío del formulario sin recarga de página
    if (formDonaciones) {
      formDonaciones.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(formDonaciones);

        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        })
        .then(() => {
          // Reemplaza el contenido del modal por mensaje de éxito
          const modalContent = modalAporte.querySelector('.modal-content');
          modalContent.innerHTML = `
            <button type="button" class="modal-close" id="btn-cerrar-exito">&times;</button>
            <div style="text-align: center; padding: 30px 10px;">
              <span style="font-size: 3rem;">🌱</span>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 15px 0 10px; color: var(--ink);">¡Gracias por tu propuesta!</h3>
              <p style="color: var(--muted); line-height: 1.5;">Hemos recibido tu información correctamente. Nos pondremos en contacto contigo muy pronto para coordinar.</p>
            </div>
          `;
          
          document.getElementById('btn-cerrar-exito').addEventListener('click', cerrarModal);
        })
        .catch((error) => console.error('Error al enviar el formulario:', error));
      });
    }
  }
});