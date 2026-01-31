// @app/shared/services/map-export/map-export-core.service.ts
import { Injectable, OnDestroy } from '@angular/core';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import Layer from 'ol/layer/Layer';
import LayerGroup from 'ol/layer/Group';
import BaseLayer from 'ol/layer/Base';
import VectorLayer from 'ol/layer/Vector';
import ImageStatic from 'ol/source/ImageStatic';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/Vector';
import { Extent } from 'ol/extent';

import { MapService } from '@app/core/services/map-service/map.service';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectProxyURL } from '@app/core/store/map/map.selectors';
import { Subject, takeUntil } from 'rxjs';

/** Propiedades opcionales esperadas en capas del visor (usadas para detectar WFS). */
interface LayerProps {
  id?: string;
  nombre?: string;
  titulo?: string;
  name?: string;
  urlServicioWFS?: string;
  wfs?: boolean;
}

/**
 * Servicio núcleo de exportación de mapa: `MapExportCoreService`
 * --------------------------------------------------------------
 * Encapsula la lógica “core” para preparar y capturar la visualización del mapa
 * en un contexto off-screen:
 *
 * - Crear un mapa limpio clonado en center/resolution del visor (sin controles ni interacciones).
 * - Recuperar capas de los grupos `INTERMEDIATE` y `UPPER`.
 * - Filtrar capas WFS visibles (si se requieren para otros flujos).
 * - Cargar capas WMS y vectoriales en el mapa limpio usando `ImageStatic` (para WMS)
 *   y clonando features/estilos (para vector).
 * - Utilidades para esperar el render de OL y capturar el canvas como imagen.
 *
 * El servicio se apoya en NgRx para obtener `proxyUrl` y así encaminar peticiones WMS
 * (evitar CORS y permitir `toDataURL` del canvas).
 *
 * Ajustes clave (timing/captura):
 * - Decodificación explícita de imágenes WMS antes de agregarlas.
 * - Espera de `rendercomplete` + 1 frame adicional.
 * - Captura sin `setTimeout`, usando composición de todos los canvas.
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  18-08-2025
 * @version
 *  1.1.0
 */
@Injectable({ providedIn: 'root' })
export class MapExportCoreService implements OnDestroy {
  private destroy$ = new Subject<void>();
  /** URL de proxy leída del store para enrutar solicitudes WMS. */
  private proxyUrl = '';

  constructor(
    private mapService: MapService,
    private store: Store<MapState>
  ) {
    // Suscripción a la URL de proxy desde el store (con lifecycle-safe unsubscribe)
    this.store
      .select(selectProxyURL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(url => {
        // diagnóstico de proxy
        if (url) {
          this.proxyUrl = url;

          console.debug('[MapExportCore] proxyUrl actualizado:', this.proxyUrl);
        }
      });
  }

  /** Limpieza de suscripciones del servicio. */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * createCleanMap()
   * ----------------
   * Crea un mapa “limpio” off-screen que clona `center` y `resolution` del visor actual,
   * con proyección indicada y sin controles/interacciones. Agrega una base OSM con
   * `crossOrigin: 'anonymous'` para evitar tainted canvas y permite renderizar
   * capas vectoriales adicionales si se proveen.
   *
   * @param container     Elemento HTML donde montar el mapa temporal.
   * @param _extent       (Compat) No se usa para posicionar; se conserva por firma histórica.
   * @param projection    Código EPSG (ej. 'EPSG:3857').
   * @param vectorLayers  Capas vectoriales a incluir encima de la base.
   * @returns             Instancia de `ol/Map` lista para render off-screen.
   */
  public createCleanMap(
    container: HTMLElement,
    _extent: [number, number, number, number],
    projection: string,
    vectorLayers: VectorLayer[] = []
  ): Map {
    console.group('[MapExportCore] createCleanMap');
    console.time('[MapExportCore] createCleanMap');
    const zoomFactor = 0.65;

    try {
      const original = this.mapService.getMap();
      if (!original) {
        console.error('[MapExportCore] No hay mapa original activo');
        // devolvemos un mapa mínimo para evitar NPE aguas abajo
      }
      const v0 = original?.getView();

      const baseResolution = v0?.getResolution();
      const resolution =
        typeof baseResolution === 'number'
          ? baseResolution * zoomFactor
          : undefined;

      const view = new View({
        projection,
        center: v0?.getCenter(),
        resolution,
        constrainResolution: false,
        enableRotation: false,
      });

      const baseLayer = new TileLayer({
        source: new OSM({ crossOrigin: 'anonymous' }),
      });

      const map = new Map({
        target: container,
        view,
        controls: [],
        interactions: [],
        layers: [baseLayer, ...vectorLayers],
        pixelRatio: 1,
      });

      map.updateSize();

      console.debug('[MapExportCore] mapa limpio creado', {
        projection,
        zoomFactor,
        resolution,
        layers: map.getLayers().getLength(),
      });

      return map;
    } catch (e) {
      console.error('[MapExportCore] Error creando mapa limpio:', e);
      const fallback = new Map({
        target: container,
        controls: [],
        interactions: [],
      });
      return fallback;
    } finally {
      console.timeEnd('[MapExportCore] createCleanMap');
      console.groupEnd();
    }
  }

  /**
   * getIntermediateAndUpperLayers()
   * --------------------------------
   * Devuelve un arreglo plano con las capas de los grupos `INTERMEDIATE` y `UPPER`
   * del mapa principal (excluye base/sistema). Útil para exportar solo “lo visible”.
   *
   * @returns Array de `Layer` correspondientes a INTERMEDIATE y UPPER.
   */
  public getIntermediateAndUpperLayers(): Layer[] {
    console.group('[MapExportCore] getIntermediateAndUpperLayers');
    try {
      const map = this.mapService.map;
      if (!map) {
        console.error('[MapExportCore] No hay mapa en mapService.map');
        return [];
      }

      const roots = map.getLayers().getArray();
      const layers: Layer[] = [];

      const intermediate = roots.find(
        (g): g is LayerGroup =>
          g instanceof LayerGroup && g.get('name') === LayerLevel.INTERMEDIATE
      );
      const upper = roots.find(
        (g): g is LayerGroup =>
          g instanceof LayerGroup && g.get('name') === LayerLevel.UPPER
      );

      [intermediate, upper].forEach(group => {
        if (!group) return;
        group
          .getLayers()
          .getArray()
          .forEach(child => {
            if (child instanceof Layer) layers.push(child);
          });
      });

      console.debug('[MapExportCore] capas recogidas', {
        intermediate: !!intermediate,
        upper: !!upper,
        total: layers.length,
      });

      return layers;
    } catch (e) {
      console.error(
        '[MapExportCore] Error obteniendo capas INTERMEDIATE/UPPER:',
        e
      );
      return [];
    } finally {
      console.groupEnd();
    }
  }

  /**
   * getVisibleWFSLayers()
   * ---------------------
   * Filtra un conjunto de capas base para retornar solo aquellas marcadas como WFS,
   * visibles y con metadatos suficientes para construir peticiones (typename + URL).
   *
   * @param layers Conjunto de capas a inspeccionar.
   * @returns      Arreglo de `CapaMapa` listo para consumo WFS.
   */
  public getVisibleWFSLayers(layers: BaseLayer[]): CapaMapa[] {
    console.group('[MapExportCore] getVisibleWFSLayers');
    try {
      const out: CapaMapa[] = [];
      for (const layer of layers) {
        const props = layer.getProperties() as unknown as LayerProps;
        if (
          props.wfs &&
          props.urlServicioWFS &&
          props.nombre &&
          layer.getVisible()
        ) {
          out.push({
            id: props.id ?? props.nombre,
            titulo: props.titulo ?? props.name ?? 'Capa sin título',
            nombre: props.nombre,
            urlServicioWFS: props.urlServicioWFS,
            wfs: true,
            leaf: true,
          });
        }
      }
      console.debug('[MapExportCore] WFS visibles:', out.length);
      return out;
    } catch (e) {
      console.error('[MapExportCore] Error filtrando capas WFS visibles:', e);
      return [];
    } finally {
      console.groupEnd();
    }
  }

  /**
   * loadExportMapLayers()
   * ---------------------
   * Procesa y agrega al mapa limpio (`mapV2`) un conjunto de capas visuales:
   * - **WMS** → se piden vía `GetMap` y se añaden como `ImageStatic`.
   * - **Vector** → se clonan features y estilos en un `VectorLayer` nuevo.
   *
   * Usa el `view/size` del **propio mapa limpio** para construir la petición,
   * garantizando que la imagen WMS esté alineada con el canvas de exportación.
   *
   * @param mapV2  Mapa destino off-screen.
   * @param layers Capas del visor original a reproducir.
   */
  public async loadExportMapLayers(mapV2: Map, layers: Layer[]): Promise<void> {
    console.group('[MapExportCore] loadExportMapLayers');
    console.time('[MapExportCore] loadExportMapLayers');
    try {
      const view = mapV2.getView();
      const size = mapV2.getSize();
      if (!size || size.length !== 2) {
        console.warn('[MapExportCore] Tamaño inválido del mapa limpio', size);
        return;
      }
      const extent = view.calculateExtent(size);

      console.debug('[MapExportCore] view/size/extent', { size, extent });

      const processed = await Promise.all(
        layers.map(layer =>
          this.processLayer(layer, view, [size[0], size[1]], extent)
        )
      );
      processed.forEach(l => {
        if (l) mapV2.addLayer(l);
      });

      console.log(
        '[MapExportCore] capas procesadas/agregadas:',
        processed.filter(Boolean).length
      );
    } catch (e) {
      console.error('[MapExportCore] Error al procesar capas:', e);
    } finally {
      console.timeEnd('[MapExportCore] loadExportMapLayers');
      console.groupEnd();
    }
  }

  /**
   * processLayer()
   * --------------
   * Convierte una capa del visor original a una representación exportable:
   * - `TileWMS` → genera URL `GetMap` (via proxy), **decodifica la imagen** y crea `ImageLayer` con `ImageStatic`.
   * - `VectorLayer` → clona features y mantiene estilo/visibilidad/opacity.
   * - Otras capas → retorna `null` (no se exportan).
   *
   * @param layer   Capa de origen.
   * @param view    View del mapa limpio (para SRS).
   * @param size    Tamaño del canvas en píxeles [w, h].
   * @param extent  BBOX calculado del mapa limpio.
   * @returns       `Layer` exportable o `null` si no aplica.
   */
  private async processLayer(
    layer: Layer,
    view: View,
    size: [number, number],
    extent: Extent
  ): Promise<Layer | null> {
    console.groupCollapsed('[MapExportCore] processLayer');
    console.debug('[MapExportCore] capa origen', layer);
    try {
      let source: TileWMS | VectorSource | undefined;
      if (
        layer instanceof TileLayer ||
        layer instanceof VectorLayer ||
        layer instanceof ImageLayer
      ) {
        source = layer.getSource();
      }

      // --- WMS -> ImageStatic (vía proxy para evitar CORS/tainted) ---
      if (source instanceof TileWMS) {
        const params = new URLSearchParams({
          SERVICE: 'WMS',
          VERSION: '1.1.1',
          REQUEST: 'GetMap',
          LAYERS: String(source.getParams().LAYERS),
          STYLES: '',
          FORMAT: 'image/png',
          TRANSPARENT: 'TRUE',
          SRS: view.getProjection().getCode(),
          BBOX: extent.join(','),
          WIDTH: String(size[0]),
          HEIGHT: String(size[1]),
        });

        const urls = source.getUrls();
        if (!urls?.length) {
          console.error('[MapExportCore] WMS sin URLs configuradas');
          return null;
        }

        const wmsBaseUrl = urls[0].replace(/\?$/, '');
        const wmsUrl = `${wmsBaseUrl}?${params.toString()}`;
        const proxiedUrl = (this.proxyUrl || '') + encodeURIComponent(wmsUrl);

        console.debug('[MapExportCore] WMS GetMap', { wmsUrl, proxiedUrl });

        try {
          const blob = await this.fetchWithRetry(proxiedUrl, 3, 1000);
          if (!blob.type.startsWith('image/')) {
            console.error(
              '[MapExportCore] WMS devolvió un blob no imagen:',
              blob.type
            );
            return null;
          }

          // Crea un ObjectURL e intenta **decodificar** la imagen antes de usarla en OL.
          const imgUrl = URL.createObjectURL(blob);
          await this.decodeImage(imgUrl);

          const imgLayer = new ImageLayer({
            source: new ImageStatic({
              url: imgUrl,
              imageExtent: extent,
              projection: view.getProjection(),
            }),
            visible: layer.getVisible(),
            opacity: layer.getOpacity(),
          });

          console.log('[MapExportCore] WMS layer listo');
          return imgLayer;
        } catch (e) {
          console.error(
            '[MapExportCore] Error descargando/decodificando WMS:',
            e
          );
          return null;
        }
      }

      // --- Vector -> clonar features y estilo tal cual ---
      if (layer instanceof VectorLayer && source instanceof VectorSource) {
        try {
          const cloned = source.getFeatures().map(f => f.clone());
          const clonedSource = new VectorSource({ features: cloned });
          const vLayer = new VectorLayer({
            source: clonedSource,
            style: layer.getStyle(),
            opacity: layer.getOpacity(),
            visible: layer.getVisible(),
            properties: layer.getProperties(),
          });
          console.log('[MapExportCore] Vector layer clonado', {
            features: cloned.length,
          });
          return vLayer;
        } catch (e) {
          console.error('[MapExportCore] Error clonando capa vectorial:', e);
          return null;
        }
      }

      // Otras capas no exportables en este flujo
      return null;
    } catch (err) {
      console.error('[MapExportCore] Error en processLayer:', err);
      return null;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * fetchWithRetry()
   * ----------------
   * Realiza `fetch` con reintentos simples (backoff fijo).
   *
   * @param url     Recurso a solicitar.
   * @param retries Número de reintentos restantes.
   * @param delay   Espera (ms) entre intentos.
   * @returns       `Blob` del recurso descargado.
   */
  private async fetchWithRetry(
    url: string,
    retries = 1,
    delay = 500
  ): Promise<Blob> {
    console.groupCollapsed('[MapExportCore] fetchWithRetry');
    console.debug('[MapExportCore] GET', { url, retries, delay });
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      console.debug('[MapExportCore] OK', { type: blob.type, size: blob.size });
      return blob;
    } catch (error) {
      console.error('[MapExportCore] fetch error:', error);
      if (retries > 0) {
        await new Promise(r => setTimeout(r, delay));
        return this.fetchWithRetry(url, retries - 1, delay);
      }
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * decodeImage()
   * -------------
   * Pre-carga y decodifica una imagen para garantizar que esté lista en memoria
   * antes de que OpenLayers la use dentro de un `ImageStatic`. Esto reduce
   * condiciones de carrera donde `rendercomplete` se emite antes de que
   * el bitmap esté disponible.
   *
   * @param url URL (incluye `blob:`) a decodificar.
   */
  private async decodeImage(url: string): Promise<void> {
    console.groupCollapsed('[MapExportCore] decodeImage');
    console.debug('[MapExportCore] decodificando', { url });
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    try {
      await img.decode();
      console.debug('[MapExportCore] decode() OK');
    } catch (e) {
      console.warn('[MapExportCore] decode() fallback onload/onerror', e);
      await new Promise<void>(res => {
        img.onload = () => res();
        img.onerror = () => res(); // no bloquear indefinidamente
      });
    } finally {
      console.groupEnd();
    }
  }

  /**
   * waitForMapToRender()
   * --------------------
   * Devuelve una promesa que se resuelve cuando OL emite `rendercomplete`.
   * Añade un frame extra (`requestAnimationFrame`) para asegurar que cualquier
   * operación de composición pendiente haya sido aplicada.
   *
   * @param map Mapa a observar.
   */
  public async waitForMapToRender(map: Map): Promise<void> {
    console.groupCollapsed('[MapExportCore] waitForMapToRender');
    console.time('[MapExportCore] waitForMapToRender');
    try {
      await new Promise<void>(resolve => {
        const done = () => {
          map.un('rendercomplete', done);
          resolve();
        };
        map.once('rendercomplete', done);
        map.renderSync();
      });
      // Frame extra por seguridad
      await new Promise(r => requestAnimationFrame(r));
      console.debug('[MapExportCore] rendercomplete OK');
    } catch (e) {
      console.error('[MapExportCore] Error esperando rendercomplete:', e);
    } finally {
      console.timeEnd('[MapExportCore] waitForMapToRender');
      console.groupEnd();
    }
  }

  /**
   * captureMapAsImage()
   * -------------------
   * Captura el viewport del `cleanMap` como DataURL PNG **sin** usar `setTimeout`.
   * Espera el render real y compone todos los canvas en un único bitmap,
   * lo que evita desalineaciones y canvases “vacíos”.
   *
   * @param cleanMap Mapa limpio ya renderizado.
   * @returns        DataURL PNG o `null` si falla/no hay canvas.
   */
  public async captureMapAsImage(cleanMap: Map): Promise<string | null> {
    console.group('[MapExportCore] captureMapAsImage');
    console.time('[MapExportCore] captureMapAsImage');
    try {
      // Espera render “real”
      await this.waitForMapToRender(cleanMap);

      // Componer todos los canvas del viewport (resistente a multi-layer)
      const size = cleanMap.getSize();
      if (!size) {
        console.error('[MapExportCore] tamaño del mapa nulo en capture');
        return null;
      }

      const composed = this.composeViewportToCanvas(cleanMap, size[0], size[1]);

      try {
        const dataUrl = composed.toDataURL('image/png');
        console.log('[MapExportCore] captura OK', {
          width: composed.width,
          height: composed.height,
        });
        return dataUrl;
      } catch (e) {
        console.error('[MapExportCore] Error toDataURL en captura:', e);
        return null;
      }
    } catch (e) {
      console.error('[MapExportCore] ERROR general en captureMapAsImage:', e);
      return null;
    } finally {
      console.timeEnd('[MapExportCore] captureMapAsImage');
      console.groupEnd();
    }
  }

  public async ensureCanvasesNotTainted(map: Map): Promise<void> {
    console.group('[MapExportCore] ensureCanvasesNotTainted');

    try {
      // 1) Esperar a que el mapa realmente termine de renderizar
      await this.waitForMapToRender(map);

      // 2) Revisar cada canvas de capa
      const canvases = map
        .getViewport()
        .querySelectorAll<HTMLCanvasElement>(
          '.ol-layer canvas, .ol-layer > canvas'
        );

      for (const c of Array.from(canvases)) {
        if (!c.width || !c.height) continue;

        try {
          const ctx = c.getContext('2d');
          if (!ctx) continue;

          // Esta llamada dispara el mismo check de seguridad que toDataURL.
          // Si el canvas está tainted por CORS, Firefox/Chrome lanzarán excepción.
          ctx.getImageData(0, 0, 1, 1);
        } catch (err) {
          console.error(
            '[MapExportCore] Canvas tainted detectado antes de exportar',
            err,
            { canvas: c }
          );
          throw new Error('Canvas tainted: alguna capa viola CORS.');
        }
      }

      console.debug(
        '[MapExportCore] Todos los canvas son seguros para captura'
      );
    } finally {
      console.groupEnd();
    }
  }

  /**
   * composeViewportToCanvas()
   * -------------------------
   * Compone en un único `canvas` de salida todos los `canvas` que OpenLayers
   * genera dentro del viewport, **respetando**:
   * - La **transformación CSS** (`transform: matrix(a,b,c,d,e,f)`) que posiciona cada capa.
   * - La **opacidad** heredada del contenedor de la capa (`.ol-layer`).
   * - El **orden de apilamiento** aproximado usando `z-index`.
   * - La diferencia entre tamaño **físico** y **CSS** del canvas (corrigiendo el **DPR**).
   *
   * Objetivo:
   * Reproducir **exactamente** lo que se ve en el visor en un canvas final de tamaño fijo
   * (`outWidth × outHeight`), sin desplazamientos ni desalineaciones entre capas.
   *
   * Flujo:
   * 1) Crear un canvas destino con las dimensiones solicitadas y limpiar su contenido.
   * 2) Seleccionar todos los canvas de capas dentro del viewport (variaciones DOM posibles).
   * 3) Ordenar los canvas por `z-index` (contenedor) para respetar el apilamiento visual.
   * 4) Para cada canvas:
   *    4.1) Saltar si no tiene ancho/alto.
   *    4.2) Tomar **opacidad** del contenedor y asignarla a `globalAlpha`.
   *    4.3) Leer y **aplicar** la **matriz de transformación** CSS con `ctx.setTransform(...)`;
   *         si no existe, usar la identidad.
   *    4.4) Calcular y compensar el **DPR** (`width/clientWidth`) escalando inversamente.
   *    4.5) Dibujar el canvas en `(0,0)` (las transformaciones ya posicionan correctamente).
   * 5) Restaurar transformaciones y alpha del contexto y devolver el canvas compuesto.
   *
   * Notas:
   * - Se recomienda usar mapas de exportación con `pixelRatio: 1` para máxima consistencia
   *   entre equipos/monitores.
   * - El contenedor del mapa **no** debe estar en `display: none`; use `visibility:hidden`
   *   para que `clientWidth` sea válido.
   * - Esta implementación maneja `matrix(...)` (2D). Si el navegador aplicara `matrix3d(...)`,
   *   habría que extender el parseo.
   *
   * @param map        Mapa off-screen ya renderizado (con sus capas listas).
   * @param outWidth   Ancho del canvas de salida, en píxeles.
   * @param outHeight  Alto del canvas de salida, en píxeles.
   * @returns          Canvas con la composición final del viewport.
   */
  public composeViewportToCanvas(
    map: Map,
    outWidth: number,
    outHeight: number
  ): HTMLCanvasElement {
    // No abrimos un group aquí para no saturar consola por iteración; solo un debug resumido
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = outWidth;
    exportCanvas.height = outHeight;

    const ctx = exportCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, outWidth, outHeight);

    // Selecciona todos los canvas de capas (algunos navegadores usan .ol-layer > canvas)
    const canvases = map
      .getViewport()
      .querySelectorAll<HTMLCanvasElement>(
        '.ol-layer canvas, .ol-layer > canvas'
      );

    // Orden (aprox.) por zIndex para respetar apilamiento visual
    const ordered = Array.from(canvases).sort((a, b) => {
      const za = parseFloat(
        getComputedStyle(a.parentElement as HTMLElement).zIndex || '0'
      );
      const zb = parseFloat(
        getComputedStyle(b.parentElement as HTMLElement).zIndex || '0'
      );
      return za - zb;
    });

    console.debug('[MapExportCore] composeViewportToCanvas', {
      layers: ordered.length,
      outWidth,
      outHeight,
    });

    for (const c of ordered) {
      if (!c.width || !c.height) continue;

      // Opacidad heredada del contenedor de capa
      const parent = c.parentElement as HTMLElement | null;
      const opacity = parent
        ? parseFloat(getComputedStyle(parent).opacity || '1')
        : 1;
      if (opacity === 0) continue;
      ctx.globalAlpha = isNaN(opacity) ? 1 : opacity;

      // Transform CSS aplicada por OL (matrix(a, b, c, d, e, f) en unidades CSS px)
      const tr = getComputedStyle(c).transform;
      if (tr && tr !== 'none') {
        // matrix(a, b, c, d, e, f)
        const m = tr.match(/^matrix\((.+)\)$/);
        if (m) {
          const [a, b, c2, d, e, f] = m[1].split(',').map(v => parseFloat(v));
          ctx.setTransform(a, b, c2, d, e, f);
        } else {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }

      // Ajuste por DPR del propio canvas (ancho físico vs ancho CSS)
      const dpr = c.width / c.clientWidth || 1;
      if (dpr !== 1) {
        ctx.scale(1 / dpr, 1 / dpr);
      }

      ctx.drawImage(c, 0, 0);
    }

    // Limpieza: restaurar estado gráfico
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;

    return exportCanvas;
  }
}
