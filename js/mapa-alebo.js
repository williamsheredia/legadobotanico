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
      axis: "terrestre",
      quechua: "Kawsay Ñan",
      program: "Senderos de Vida",
      axisLabel: "Eje Terrestre",
      name: "Proyecto Forestal Cerro La Milla",
      category: "Restauración ecológica",
      description: "Recuperación progresiva del ecosistema urbano mediante restauración forestal y participación comunitaria.",
      lat: -12.017780116256922,
      lng: -77.06914329553611,
      placeId: "ChIJ5z0fPQDPBZERYccC9_AwvXE",
      page: "proyectos/cerro-la-milla.html"
    },
    {
      id: "rio",
      number: "2",
      axis: "hidrico",
      quechua: "Kawsay Mayu",
      program: "Ríos de Vida",
      axisLabel: "Eje Hídrico",
      name: "Proyecto Río Surco",
      category: "Recuperación hídrica y comunitaria",
      description: "Nodo piloto del eje Ríos de Vida. El punto indica una referencia del tramo de intervención de 405 metros.",

      lat: -12.139021754667617,
      lng: -77.00770241815576,
      mapsUrl: "https://www.google.com/maps/place/Rios+de+vida+-+R%C3%ADo+Surco/@-12.1390453,-77.01028,17z/data=!3m1!4b1!4m6!3m5!1s0x9105b9006fbf162f:0x7b7068b47b47cab0!8m2!3d-12.1390506!4d-77.0077051!16s%2Fg%2F11_0d48_49",
      page: "proyectos/rio-surco.html"
    },
    {
      id: "biohuerto",
      number: "3",
      axis: "educativo",
      quechua: "Kawsay Yachay",
      program: "Escuelas de Vida",
      axisLabel: "Eje Educativo",
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
      axis: "educativo",
      quechua: "Kawsay Yachay",
      program: "Escuelas de Vida",
      axisLabel: "Eje Educativo",
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

    // En pantallas táctiles, el mapa no captura los gestos de desplazamiento.
    // Los marcadores siguen siendo interactivos mediante toque.
    if (L.Browser.touch) {
      map.dragging.disable();
      map.touchZoom.disable();
    }

    const zoomControl = map.zoomControl.getContainer();
    const hideZoomControl = () => zoomControl?.classList.add("alebo-zoom-hidden");
    const showZoomControl = () => zoomControl?.classList.remove("alebo-zoom-hidden");

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
    }).addTo(map);

    const allProjects = L.layerGroup();
    const workAreas = L.layerGroup();
    let currentMode = "projects";
    let hoverCloseTimer = null;
    let hoverOpenTimer = null;
    let countdownTimer = null;
    let pointerInside = false;

    const clearHoverClose = () => {
      if (hoverCloseTimer) {
        window.clearTimeout(hoverCloseTimer);
        hoverCloseTimer = null;
      }
    };

    const clearHoverOpen = () => {
      if (hoverOpenTimer) {
        window.clearTimeout(hoverOpenTimer);
        hoverOpenTimer = null;
      }
    };

    const restoreProjectsView = () => {
      if (currentMode !== "projects") return;
      const bounds = L.latLngBounds(points).pad(0.08);
      map.flyToBounds(bounds, {
        paddingTopLeft: [22, 22],
        paddingBottomRight: [72, 22],
        duration: 1
      }).once("moveend", showZoomControl);
    };

    const clearCountdown = (marker) => {
      if (countdownTimer) {
        window.clearTimeout(countdownTimer);
        countdownTimer = null;
      }
      const markerElement = marker?.getElement()?.querySelector(".alebo-marker");
      markerElement?.classList.remove("alebo-countdown");
    };

    const schedulePopupClose = (marker, delay = 180) => {
      clearHoverClose();
      hoverCloseTimer = window.setTimeout(() => {
        marker.closePopup();
        hoverCloseTimer = null;
      }, delay);
    };

    const makeMarker = (project) => {
      const icon = L.divIcon({
        className: "",
        html: '<div class="alebo-marker alebo-marker--' + project.axis + '"><span>' + project.number + '</span></div>',
        iconSize: [34, 42],
        iconAnchor: [17, 38],
        popupAnchor: [0, -36]
      });
      const mapsLink = project.mapsUrl || (project.placeId
        ? "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent(project.name) +
          "&query_place_id=" + encodeURIComponent(project.placeId)
        : "https://www.google.com/maps/dir/?api=1&destination=" +
          encodeURIComponent(project.lat + "," + project.lng));
      const mapsLabel = (project.mapsUrl || project.placeId) ? "Ver ficha en Maps" : "Llegar";
      const popup = `
        <div class="alebo-popup alebo-popup--${project.axis}">
          <span class="alebo-popup-kicker">${escapeHTML(project.quechua)} · ${escapeHTML(project.program)}</span>
          <span class="alebo-popup-axis">${escapeHTML(project.axisLabel)}</span>
          <h3 class="alebo-popup-title">${escapeHTML(project.name)}</h3>
          <p class="alebo-popup-description">${escapeHTML(project.description)}</p>
          <div class="alebo-popup-actions">
            <a href="${mapsLink}" target="_blank" rel="noopener noreferrer">${mapsLabel}</a>
            <a href="${project.page}">Ver proyecto en ALEBO</a>
          </div>
        </div>`;
      const marker = L.marker([project.lat, project.lng], { icon });
      marker.projectId = project.id;
      const isNarrowMap = mapElement.clientWidth <= 600;
      const popupMaxWidth = Math.max(220, Math.min(290, mapElement.clientWidth - 64));

      marker.bindPopup(popup, {
        maxWidth: popupMaxWidth,
        autoPan: true,
        autoPanPaddingTopLeft: isNarrowMap ? [16, 16] : [36, 88],
        autoPanPaddingBottomRight: isNarrowMap ? [16, 16] : [36, 36],
        keepInView: false
      });

      // Una sola secuencia para cursor y pantalla táctil:
      // primero acerca el mapa y, al terminar, abre la ficha y su contador.
      const startProjectExperience = () => {
        if (currentMode !== "projects" || pointerInside) return;
        pointerInside = true;
        clearCountdown(marker);
        clearHoverClose();
        hideZoomControl();

        const openProjectPopup = () => {
          marker.openPopup();

          const markerElement = marker.getElement()?.querySelector(".alebo-marker");
          markerElement?.classList.add("alebo-countdown");

          countdownTimer = window.setTimeout(() => {
            countdownTimer = null;
            marker.closePopup();
          }, 8000);
        };

        map.flyTo([project.lat, project.lng], 16, {
          duration: 0.8
        });
        map.once("moveend", openProjectPopup);
      };

      const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      if (hasHover) {
        // Computadora: iniciar al pasar el cursor sobre el marcador.
        marker.on("mouseover", startProjectExperience);
      } else {
        // Móvil/tablet: Leaflet abre el popup automáticamente al tocar.
        // Desactivamos esa apertura inmediata para ejecutar antes el zoom.
        marker.off("click", marker._openPopup, marker);
        marker.on("click", startProjectExperience);
      }

      // La X del popup y el cierre automático cancelan el contador.
      marker.on("popupclose", () => {
        clearCountdown(marker);
        pointerInside = false;
      });

      return marker;
    };

    projects.forEach((project) => {
      const marker = makeMarker(project);
      marker.addTo(allProjects);
      if (project.id === "cerro" || project.id === "rio") marker.addTo(workAreas);
    });

    allProjects.addTo(map);
    const points = projects.map((project) => [project.lat, project.lng]);
    map.fitBounds(L.latLngBounds(points).pad(0.08), {
      paddingTopLeft: [22, 22],
      paddingBottomRight: [72, 22]
    });

    // Al cerrar una ficha (por cursor o manualmente), recuperar el encuadre general.
    map.on("popupclose", restoreProjectsView);

    const mapMode = document.getElementById("alebo-map-mode");
    const areasMode = document.getElementById("alebo-areas-mode");
    const status = document.getElementById("alebo-map-status");

    const setMode = (mode) => {
      currentMode = mode;
      clearHoverClose();
      clearHoverOpen();
      pointerInside = false;
      clearCountdown();
      showZoomControl();
      map.closePopup();
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
        map.fitBounds(L.latLngBounds(points).pad(0.08), {
          paddingTopLeft: [22, 22],
          paddingBottomRight: [72, 22]
        });
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
