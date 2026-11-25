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

    map.zoomControl.setPosition("bottomleft");
    const zoomControl = map.zoomControl.getContainer();
    const hideZoomControl = () => zoomControl?.classList.add("alebo-zoom-hidden");
    const showZoomControl = () => zoomControl?.classList.remove("alebo-zoom-hidden");
    const isNarrowMap = mapElement.clientWidth <= 600;
    const projectsBoundsPadding = isNarrowMap ? 0.08 : 0.08;
    const projectsFitOptions = isNarrowMap
      ? { paddingTopLeft: [8, 8], paddingBottomRight: [8, 8] }
      : { paddingTopLeft: [22, 22], paddingBottomRight: [72, 22] };

    const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
    }).addTo(map);
    const satelliteLayer = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    });


    // Geometrías territoriales del Cerro La Milla, validadas visualmente.
    const cerroAridCoordinates = [[-12.013900864911662,-77.06569558228065],[-12.013705019485931,-77.0657426166612],[-12.012781558998471,-77.06527054788586],[-12.012235876312658,-77.06593573570565],[-12.01332724057842,-77.06666529654025],[-12.012109949381957,-77.06713736531559],[-12.012555743611461,-77.06741585740855],[-12.013332290793583,-77.06808104522833],[-12.014297724707687,-77.068317079616],[-12.015410068185961,-77.0690037251074],[-12.014486613546827,-77.07020535471732],[-12.015032291671,-77.07065596582105],[-12.015494018450624,-77.07059159280622],[-12.0162075946432,-77.07127823829762],[-12.016774256742716,-77.07104220390995],[-12.01746684213318,-77.07170739172975],[-12.018117451028061,-77.07119240761119],[-12.018579172515455,-77.07149281501367],[-12.020426050621653,-77.07144989969711],[-12.019817421762736,-77.07185759545764],[-12.01925096274674,-77.07346737864717],[-12.019922554571846,-77.0733708190631],[-12.020762041965016,-77.07329571721249],[-12.020940432698643,-77.07495868676195],[-12.0220422552266,-77.07337081907055],[-12.022650879052934,-77.07316697119029],[-12.023007657897198,-77.07233012199764],[-12.02410947196268,-77.07205117226704],[-12.025169307868516,-77.07051694874721],[-12.02602976567961,-77.07078516961583],[-12.027047620715237,-77.07031846525405],[-12.027866099276308,-77.07028627874662],[-12.027661220699509,-77.0694174244896],[-12.0277784227,-77.06938978788787],[-12.026382809822106,-77.06959363575889],[-12.024661893802477,-77.06977602596754],[-12.023108862522934,-77.07070943466802],[-12.02218543430089,-77.07073089233961],[-12.020873740994428,-77.06847783679737],[-12.019971292315814,-77.0682203447381],[-12.019152789679206,-77.06861731165922],[-12.018281816249425,-77.0692395841358],[-12.017715157323797,-77.06935760132963],[-12.01646640473927,-77.06808086986906],[-12.01586826065003,-77.06793066613983],[-12.01521764631863,-77.06728693599166],[-12.015228140110636,-77.06725474947125],[-12.013958388307133,-77.06593510268566],[-12.013900864911662,-77.06569558228065]];
    const cerroInterventionCoordinates = [[-12.01759427504744,-77.06925228714537],[-12.017449986635407,-77.06905916810038],[-12.01722699530767,-77.0689009177723],[-12.016788882396323,-77.06912354111519],[-12.016767894933567,-77.0693622577118],[-12.01699613350314,-77.06942931293558],[-12.017122058148349,-77.06939444421921],[-12.017192890735389,-77.06931129574176],[-12.017305698150324,-77.06933275341335],[-12.017428999224201,-77.06950173257725],[-12.017573287643183,-77.06927642702539]];
    const cerroCrestCoordinates = [[-12.013958388307133,-77.06593510268566],[-12.015228140110636,-77.06725474947125],[-12.01521764631863,-77.06728693599166],[-12.01586826065003,-77.06793066613983],[-12.01646640473927,-77.06808086986906],[-12.017715157323797,-77.06935760132963],[-12.018281816249425,-77.0692395841358],[-12.019152789679206,-77.06861731165922],[-12.019971292315814,-77.0682203447381],[-12.020873740994428,-77.06847783679737],[-12.02218543430089,-77.07073089233961],[-12.023108862522934,-77.07070943466802],[-12.024661893802477,-77.06977602596754],[-12.026382809822106,-77.06959363575889],[-12.0277784227,-77.06938978788787]];

    const allProjects = L.layerGroup();
    const workAreas = L.layerGroup();
    let currentMode = "projects";
    let hoverCloseTimer = null;
    let hoverOpenTimer = null;
    let countdownTimer = null;
    // Solo un proyecto puede estar activo durante cada experiencia.
    let activeMarker = null;
    let cerroPresentationTimer = null;
    let cerroPresentationOpen = false;
    const cerroTerritoryLayer = L.layerGroup();
    const cerroAridArea = L.polygon(cerroAridCoordinates, {
      color: "#7778C5", weight: 2.5, opacity: 0.95,
      fillColor: "#4B4D9A", fillOpacity: 0.36, lineJoin: "round"
    });
    const cerroIntervention = L.polygon(cerroInterventionCoordinates, {
      color: "#F2D22E", weight: 3, opacity: 1,
      fillColor: "#F2D22E", fillOpacity: 0.78, lineJoin: "round"
    });
    const cerroCrest = L.polyline(cerroCrestCoordinates, {
      color: "#F8F5E9", weight: 3, opacity: 0.98, lineCap: "round", lineJoin: "round"
    });
    const cerroFocus = L.latLngBounds(cerroAridCoordinates);
    const interventionAnchor = L.latLng(-12.01718, -77.06922);
    const interventionLabel = L.latLng(-12.01555, -77.06795);
    const interventionLeader = L.polyline([interventionAnchor, interventionLabel], {
      color: "#F2D22E", weight: 2.5, opacity: 1, lineCap: "round"
    });
    const interventionDot = L.circleMarker(interventionAnchor, {
      radius: 5, color: "#5A4B13", weight: 2, fillColor: "#F2D22E", fillOpacity: 1
    });
    const interventionTag = L.marker(interventionLabel, {
      interactive: false,
      icon: L.divIcon({
        className: "alebo-cerro-callout",
        html: '<span>Área de intervención ALEBO</span><strong>3.472 m²</strong>',
        iconSize: [170, 42],
        iconAnchor: [0, 21]
      })
    });
    cerroTerritoryLayer.addLayer(cerroAridArea);
    cerroTerritoryLayer.addLayer(cerroCrest);
    cerroTerritoryLayer.addLayer(cerroIntervention);
    cerroTerritoryLayer.addLayer(interventionLeader);
    cerroTerritoryLayer.addLayer(interventionDot);
    cerroTerritoryLayer.addLayer(interventionTag);

    const cerroPanel = L.DomUtil.create("div", "alebo-cerro-panel");
    cerroPanel.setAttribute("aria-label", "Información del Proyecto Forestal Cerro La Milla");
    cerroPanel.innerHTML = `
      <button type="button" class="alebo-cerro-panel-close" aria-label="Cerrar presentación">&times;</button>
      <span class="alebo-cerro-kicker">Kawsay Ñan · Senderos de Vida</span>
      <span class="alebo-cerro-axis">Eje Terrestre</span>
      <h3>Proyecto Forestal Cerro La Milla</h3>
      <p>Recuperación progresiva del ecosistema urbano mediante restauración forestal y participación comunitaria.</p>
      <div class="alebo-cerro-actions">
        <a href="https://www.google.com/maps/search/?api=1&query=Proyecto%20Forestal%20Cerro%20La%20Milla&query_place_id=ChIJ5z0fPQDPBZERYccC9_AwvXE" target="_blank" rel="noopener noreferrer">Ver ficha en Maps</a>
        <a href="proyectos/cerro-la-milla.html">Ver proyecto en ALEBO</a>
      </div>`;
    mapElement.appendChild(cerroPanel);
    L.DomEvent.disableClickPropagation(cerroPanel);
    L.DomEvent.disableScrollPropagation(cerroPanel);
    cerroPanel.querySelector(".alebo-cerro-panel-close").addEventListener("click", () => closeCerroPresentation());


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

    const getProjectsBounds = () => L.latLngBounds(points).pad(projectsBoundsPadding);
    const getProjectsFitOptions = () => {
      const bounds = getProjectsBounds();
      // En móvil, iniciar un nivel más alejado: equivale al primer toque en «−».
      const overviewZoom = map.getBoundsZoom(bounds, false, L.point(8, 8)) - (isNarrowMap ? 1 : 0);
      return {
        ...projectsFitOptions,
        ...(isNarrowMap ? { maxZoom: overviewZoom } : {})
      };
    };

    const restoreProjectsView = () => {
      if (currentMode !== "projects") return;
      const bounds = getProjectsBounds();
      map.flyToBounds(bounds, {
        ...getProjectsFitOptions(),
        duration: 1
      }).once("moveend", showZoomControl);
    };

    const clearCountdown = (marker) => {
      if (countdownTimer) {
        window.clearTimeout(countdownTimer);
        countdownTimer = null;
      }
      const markerElement = marker?.getElement()?.querySelector(".alebo-marker");
      markerElement?.classList.remove("alebo-countdown", "alebo-cerro-marker-offset");
    };

    const schedulePopupClose = (marker, delay = 180) => {
      clearHoverClose();
      hoverCloseTimer = window.setTimeout(() => {
        marker.closePopup();
        hoverCloseTimer = null;
      }, delay);
    };

    const closeCerroPresentation = () => {
      if (!cerroPresentationOpen) return;
      cerroPresentationOpen = false;
      if (cerroPresentationTimer) {
        window.clearTimeout(cerroPresentationTimer);
        cerroPresentationTimer = null;
      }
      cerroPanel.classList.remove("is-visible");
      cerroTerritoryLayer.removeFrom(map);
      satelliteLayer.removeFrom(map);
      if (!map.hasLayer(streetLayer)) streetLayer.addTo(map);
      if (activeMarker) clearCountdown(activeMarker);
      activeMarker = null;
      map.flyToBounds(getProjectsBounds(), {
        ...getProjectsFitOptions(), duration: 1
      }).once("moveend", showZoomControl);
    };

    const openCerroPresentation = (marker) => {
      cerroPresentationOpen = true;
      const mobile = mapElement.clientWidth <= 600;
      if (map.hasLayer(streetLayer)) map.removeLayer(streetLayer);
      satelliteLayer.addTo(map);
      cerroTerritoryLayer.addTo(map);
      cerroPanel.classList.add("is-visible");
      const padding = mobile
        ? { paddingTopLeft: [12, 218], paddingBottomRight: [12, 14] }
        : { paddingTopLeft: [24, 24], paddingBottomRight: [365, 24] };
      map.flyToBounds(cerroFocus, {
        ...padding, maxZoom: mobile ? 15 : 16, duration: 1.15
      });
      const markerElement = marker.getElement()?.querySelector(".alebo-marker");
      markerElement?.classList.add("alebo-countdown", "alebo-cerro-marker-offset");
      cerroPresentationTimer = window.setTimeout(closeCerroPresentation, 8000);
    };

    const makeMarker = (project) => {
      const icon = L.divIcon({
        className: "",
        html: '<div class="alebo-marker alebo-marker--' + project.axis + '"><span>' + project.number + '</span></div>',
        iconSize: [34, 42],
        iconAnchor: [17, 38],
        popupAnchor: [0, -36]
      });
      // En móvil, los marcadores 3 y 4 se separan solo en la vista general.
      // El pequeño conector señala la coordenada geográfica original.
      const overviewOffset = isNarrowMap && (project.id === "biohuerto" || project.id === "jardin");
      const overviewIcon = overviewOffset ? L.divIcon({
        className: "alebo-marker-offset-icon",
        html: project.id === "biohuerto"
          ? '<span class="alebo-marker-leader alebo-marker-leader--left"></span><div class="alebo-marker nebo-marker--educativo"><span>3</span></div>'
          : '<span class="alebo-marker-leader nebo-marker-leader--right"></span><div class="alebo-marker nebo-marker--educativo"><span>4</span></div>',
        // Cada marcador conserva un área de toque de 34 px, sin invadir al vecino.
        iconSize: [34, 42],
        iconAnchor: project.id === "biohuerto" ? [39, 38] : [-5, 38],
        popupAnchor: [0, -36]
      }) : icon;
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
      const marker = L.marker([project.lat, project.lng], { icon: overviewIcon });
      marker.projectId = project.id;
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
        // Bloquea los demás marcadores hasta cerrar la ficha activa.
        if (currentMode !== "projects" || activeMarker) return;
        activeMarker = marker;
        clearCountdown(marker);
        clearHoverClose();
        hideZoomControl();
        // Al seleccionar, el marcador vuelve a su coordenada visual exacta.
        if (overviewOffset) marker.setIcon(icon);

        const openProjectPopup = () => {
          // Evita que una animación pendiente abra una ficha que ya no está activa.
          if (activeMarker !== marker || currentMode !== "projects") return;
          if (project.id === "cerro") {
            openCerroPresentation(marker);
            return;
          }
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

      // Desactivar siempre la apertura automática de Leaflet: en PC también
      // permitiría abrir una segunda ficha por clic, saltándose el bloqueo.
      marker.off("click", marker._openPopup, marker);

      if (hasHover) {
        // Computadora: iniciar al pasar el cursor sobre el marcador.
        marker.on("mouseover", startProjectExperience);
      } else {
        // Móvil/tablet: abrir solo mediante la secuencia personalizada de toque.
        marker.on("click", startProjectExperience);
      }

      // La X del popup y el cierre automático cancelan el contador.
      marker.on("popupclose", () => {
        clearCountdown(marker);
        // Solo la ficha que inició la secuencia puede liberar el bloqueo.
        if (activeMarker !== marker) return;
        activeMarker = null;
        if (overviewOffset && currentMode === "projects") marker.setIcon(overviewIcon);
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
    map.fitBounds(getProjectsBounds(), getProjectsFitOptions());

    // Al cerrar una ficha (por cursor o manualmente), recuperar el encuadre general.
    map.on("popupclose", restoreProjectsView);

    const mapMode = document.getElementById("alebo-map-mode");
    const areasMode = document.getElementById("alebo-areas-mode");
    const status = document.getElementById("alebo-map-status");

    const setMode = (mode) => {
      currentMode = mode;
      clearHoverClose();
      clearHoverOpen();
      if (cerroPresentationOpen) closeCerroPresentation();
      if (activeMarker) clearCountdown(activeMarker);
      activeMarker = null;
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
        status.textContent = "Vista territorial: se muestran los puntos de referencia de Cerro La Milla y Río Surco.";
      } else {
        map.removeLayer(workAreas);
        allProjects.addTo(map);
        map.fitBounds(getProjectsBounds(), getProjectsFitOptions());
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
