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

// Lógica para abrir y cerrar el Modal Pop-up de Donaciones
document.addEventListener('DOMContentLoaded', () => {
  const btnAbrirAporte = document.getElementById('btn-abrir-aporte');
  const btnCerrarAporte = document.getElementById('btn-cerrar-aporte');
  const modalAporte = document.getElementById('modal-aporte');

  if (btnAbrirAporte && modalAporte) {
    // Abrir modal
    btnAbrirAporte.addEventListener('click', () => {
      modalAporte.classList.add('active');
      modalAporte.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; // Evita scroll de fondo
    });

    // Cerrar modal con botón X
    if (btnCerrarAporte) {
      btnCerrarAporte.addEventListener('click', () => {
        modalAporte.classList.remove('active');
        modalAporte.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    }

    // Cerrar modal al hacer clic en el fondo oscuro fuera del contenido
    modalAporte.addEventListener('click', (e) => {
      if (e.target === modalAporte) {
        modalAporte.classList.remove('active');
        modalAporte.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }
});