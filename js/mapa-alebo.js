/* ==========================================================================
   MAPA INTERACTIVO ALEBO — Leaflet
   Coordenadas suministradas para los cuatro proyectos.
   Los límites territoriales no se dibujan hasta contar con geometría validada.
   ========================================================================== */
(() => {
  "use strict";

  const mapElement = document.getElementById("alebo-map");
  if (!mapElement || mapElement.dataset.initialized === "true") return;
  mapElement.dataset.initialized = "true";

  const projects = [
    {
      id: "cerro",
      number: "1",
      name: "Proyecto Forestal Cerro La Milla",
      category: "Restauración ecológica",
      description: "Recuperación progresiva del ecosistema urbano mediante restauración forestal y participación comunitaria.",
      lat: -12.017075315035395,
      lng: -77.06906334601695,
      page: "proyectos/cerro-la-milla.html"
    },
    {
      id: "rio",
      number: "2",
      name: "Proyecto Río Surco",
      category: "Recuperación hídrica y comunitaria",
      description: "Nodo piloto del eje Ríos de Vida. El punto indica una referencia del tramo de intervención de 405 metros.",
      lat: -12.139051,
      lng: -77.007705,
      page: "proyectos/rio-surco.html"
    },
    {
      id: "biohuerto",
      number: "3",
      name: "Biohuerto Escolar I.E.I. Luis Enrique X",
      category: "Educación, cultivo y alimentación",
      description: "Espacio educativo para acercar a los niños a la tierra, las plantas y el cultivo de alimentos.",
      lat: -12.035374428703891,
      lng: -77.09511497185004,
      page: "proyectos/biohuerto-luis-enrique-x.html"
    },
    {
      id: "jardin",
      number: "4",
      name: "Proyecto Jardín Botánico",
      category: "Biodiversidad y educación ambiental",
      description: "Espacio de vegetación y aprendizaje ambiental para promover la biodiversidad urbana.",
      lat: -12.035662330393931,
      lng: -77.08583855200143,
      page: "proyectos/jardin-botanico.html"
    }
  ];

  const loadLeaflet = () => new Promise((resolve, reject) => {
    if (window.L) return resolve();
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  loadLeaflet().then(() => {
    const map = L.map(mapElement, {
      scrollWheelZoom: false,
      zoomControl: true,
      minZoom: 11,
      maxZoom: 19,
      maxBounds: [[-12.19, -77.125], [-11.99, -76.975]],
      maxBoundsViscosity: 0.82
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
    }).addTo(map);

    const allProjects = L.layerGroup();
    const workAreas = L.layerGroup();

    const makeMarker = (project) => {
      const icon = L.divIcon({
        className: "",
        html: '<div class="alebo-marker"><span>' + project.number + '</span></div>',
        iconSize: [34, 42],
        iconAnchor: [17, 38],
        popupAnchor: [0, -36]
      });
      const destination = encodeURIComponent(project.lat + "," + project.lng);
      const directions = "https://www.google.com/maps/dir/?api=1&destination=" + destination;
      const popup = `
        <div class="alebo-popup">
          <span class="alebo-popup-kicker">${escapeHTML(project.category)}</span>
          <h3 class="alebo-popup-title">${escapeHTML(project.name)}</h3>
          <p class="alebo-popup-description">${escapeHTML(project.description)}</p>
          <div class="alebo-popup-actions">
            <a href="${directions}" target="_blank" rel="noopener noreferrer">Llegar</a>
            <a href="${project.page}">Ir al proyecto</a>
          </div>
        </div>`;
      return L.marker([project.lat, project.lng], { icon }).bindPopup(popup, { maxWidth: 290 });
    };

    projects.forEach((project) => {
      const marker = makeMarker(project);
      marker.addTo(allProjects);
      if (project.id === "cerro" || project.id === "rio") marker.addTo(workAreas);
    });

    allProjects.addTo(map);
    const points = projects.map((project) => [project.lat, project.lng]);
    map.fitBounds(L.latLngBounds(points).pad(0.16), { padding: [22, 22] });

    const mapMode = document.getElementById("alebo-map-mode");
    const areasMode = document.getElementById("alebo-areas-mode");
    const status = document.getElementById("alebo-map-status");

    const setMode = (mode) => {
      const isAreas = mode === "areas";
      if (isAreas) {
        map.removeLayer(allProjects);
        workAreas.addTo(map);
        map.fitBounds(L.latLngBounds([
          [-12.017075315035395, -77.06906334601695],
          [-12.139051, -77.007705]
        ]).pad(0.28), { padding: [24, 24] });
        status.textContent = "Vista territorial: se muestran los puntos de referencia de Cerro La Milla y Río Surco. Los perímetros se incorporarán cuando sus trazados estén georreferenciados y validados.";
      } else {
        map.removeLayer(workAreas);
        allProjects.addTo(map);
        map.fitBounds(L.latLngBounds(points).pad(0.16), { padding: [22, 22] });
        status.textContent = "Explora los cuatro proyectos de ALEBO. Selecciona un marcador para consultar su información.";
      }
      mapMode.setAttribute("aria-pressed", String(!isAreas));
      areasMode.setAttribute("aria-pressed", String(isAreas));
      window.setTimeout(() => map.invalidateSize(), 120);
    };

    mapMode?.addEventListener("click", () => setMode("projects"));
    areasMode?.addEventListener("click", () => setMode("areas"));
    status.textContent = "Explora los cuatro proyectos de ALEBO. Selecciona un marcador para consultar su información.";
    window.setTimeout(() => map.invalidateSize(), 200);
  }).catch(() => {
    mapElement.innerHTML = '<p style="padding:24px;text-align:center;color:#294b37">No fue posible cargar el mapa. Comprueba tu conexión e inténtalo nuevamente.</p>';
  });
})();
