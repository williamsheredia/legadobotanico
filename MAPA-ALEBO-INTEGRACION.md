# Integración del mapa interactivo ALEBO

Los archivos del mapa ya están creados en la rama `mapa-territorial-alebo`:

- `css/mapa-alebo.css`
- `js/mapa-alebo.js`

**Importante:** el `index.html` que está en GitHub todavía no contiene los últimos cambios del boceto de cuatro proyectos que Williams compartió en la conversación. Por eso no se reemplazó ese archivo: hacerlo habría sobrescrito trabajo más reciente. Integra estos tres fragmentos en tu copia actual de `index.html`.

## 1. En el `<head>`

Debajo de la referencia a `css/styles.css`, agrega:

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="stylesheet" href="css/mapa-alebo.css">
```

## 2. Entre Proyectos e Instagram Feed

Justo después del cierre de la sección `#proyectos` y antes del comentario `<!-- INSTAGRAM FEED -->`, pega:

```html
  <!-- MAPA INTERACTIVO ALEBO -->
  <section class="section map-section" id="mapa-proyectos">
    <div class="container">
      <div class="section-heading map-intro">
        <span class="eyebrow">Nuestro territorio</span>
        <h2>Proyectos <span>en el mapa</span></h2>
        <p>Conoce dónde desarrollamos nuestras iniciativas de restauración, biodiversidad, educación ambiental y recuperación hídrica.</p>
      </div>

      <div class="map-switcher" role="group" aria-label="Vistas del mapa">
        <button type="button" id="alebo-map-mode" aria-pressed="true">Mapa de proyectos</button>
        <button type="button" id="alebo-areas-mode" aria-pressed="false">Área de trabajo</button>
      </div>
      <p class="map-status" id="alebo-map-status" aria-live="polite">Cargando mapa de proyectos...</p>
      <div id="alebo-map" class="alebo-map" role="region" aria-label="Mapa interactivo de los proyectos de Legado Botánico"></div>
      <div class="alebo-map-note">
        <span aria-hidden="true">🌱</span>
        <span><strong>Información territorial en desarrollo.</strong> Los puntos identifican ubicaciones de referencia. Las áreas de intervención se incorporarán cuando sus límites hayan sido georreferenciados y validados por ALEBO.</span>
      </div>
    </div>
  </section>
```

## 3. Antes de cerrar `</body>`

Debajo de `<script src="js/main.js"></script>`, agrega:

```html
<script src="js/mapa-alebo.js"></script>
```

## Qué incluye esta primera versión

- Cuatro ubicaciones con las coordenadas suministradas.
- Marcadores seleccionables con información breve.
- Botón «Llegar» que abre indicaciones de Google Maps.
- Botón «Ir al proyecto» que abre la página HTML correspondiente, incluido Río Surco.
- Zoom, desplazamiento y límites generales del mapa.
- Dos vistas: todos los proyectos y puntos de referencia de las áreas de trabajo.

La vista «Área de trabajo» todavía no dibuja polígonos. Para Cerro La Milla y Río Surco se incorporarán únicamente después de validar sus vértices o trazados reales. El Jardín Botánico se identifica sólo mediante su marcador, sin exponer referencias privadas.
