import { Injectable } from '@angular/core';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Stroke, Style } from 'ol/style';

import { MapService } from '@app/core/services/map-service/map.service';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

// 👉 helpers
type Extent = [number, number, number, number];

/**
 * Servicio: `GridService`
 * -----------------------
 * Genera y gestiona una **capa de grilla** (líneas verticales/horizontales) para el visor.
 *
 * Características:
 * - **Auto-densidad** basada en la resolución del mapa: intenta que cada celda tenga ~48 px
 *   (configurable mediante constantes internas y con "clamps" para evitar extremos).
 * - Alternativamente, permite forzar una densidad aproximada usando `idealCells` (modo compat).
 * - Limita el número de líneas por eje (`MAX_LINES_PER_AXIS`) para evitar bloqueos en vistas muy grandes.
 * - Expone una API para crear/asegurar/actualizar/mostrar/ocultar la grilla, así como para
 *   **prepararla** en modo exportación (expandir extent, fijar estilo, y evitar re-cálculo por movimiento).
 *
 * Casos de uso:
 * - Mostrar la grilla en el visor (actualización automática en `moveend`).
 * - Preparar una grilla grande y estática para exportación (evita cortes).
 *
 * Notas:
 * - El estilo por defecto usa `rgba(0,0,0,0.2)` y ancho `1`. Se puede personalizar.
 * - La grilla se monta en el **LayerLevel.UPPER** (encima de las capas base).
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  02-09-2025
 * @version
 *  2.0.0
 */
@Injectable({ providedIn: 'root' })
export class GridService {
  private gridLayer: VectorLayer | null = null;

  // Ajustes internos para auto-densidad visual (px por celda)
  private readonly TARGET_CELL_PX = 48; // tamaño deseado ~48 px por celda
  private readonly MIN_CELL_PX = 24; // clamp inferior
  private readonly MAX_CELL_PX = 96; // clamp superior
  private readonly MAX_LINES_PER_AXIS = 1200; // límite duro por eje para evitar bloqueos

  constructor(private mapService: MapService) {}

  // ===========================================================================
  // =============== UTILIDADES INTERNAS (no públicas) ========================
  // ===========================================================================

  /**
   * Calcula un **paso** (en unidades del SR de la vista) a partir de una resolución (mapa)
   * y un tamaño visual objetivo en píxeles, aplicando clamps de seguridad.
   *
   * @param resolution  Resolución del mapa (unidades por píxel).
   * @param desiredPx   Tamaño objetivo de celda en píxeles.
   * @returns           Paso en unidades del SR.
   */
  private computeStepFromResolution(
    resolution: number,
    desiredPx: number
  ): number {
    const px = Math.min(
      Math.max(desiredPx, this.MIN_CELL_PX),
      this.MAX_CELL_PX
    );
    return resolution * px;
  }

  /**
   * Decide el **paso** final a usar para un `extent`:
   * - Si se provee `idealCells`, usa el esquema tradicional: `min(W/idealCells, H/idealCells)`.
   * - Si NO se provee, usa **auto-densidad** con la resolución del mapa (`TARGET_CELL_PX`).
   * - Aplica un **cap** para que el nº de líneas por eje no exceda `MAX_LINES_PER_AXIS`.
   *
   * @param ext         Extent `[minX, minY, maxX, maxY]`.
   * @param idealCells  (Opcional) nº "ideal" de celdas por eje (modo compatible).
   * @returns           Paso en unidades del SR (>= 1e-9).
   */
  private decideStep(ext: Extent, idealCells?: number): number {
    const [minX, minY, maxX, maxY] = ext;
    const W = Math.max(maxX - minX, 1e-9);
    const H = Math.max(maxY - minY, 1e-9);

    let step: number;

    if (idealCells && idealCells > 0) {
      // Compatibilidad: respeta comportamiento anterior si se especifica idealCells
      step = Math.min(W / idealCells, H / idealCells);
    } else {
      // Auto-densidad basada en resolución del mapa actual
      const map = this.mapService.getMap();
      const res = map?.getView()?.getResolution();
      // Fallback si no hay mapa/res: ~48 celdas por eje
      step = res
        ? this.computeStepFromResolution(res, this.TARGET_CELL_PX)
        : Math.min(W / 48, H / 48);
    }

    // Cap de seguridad por eje: evita generar "infinitas" líneas
    const nx = Math.ceil(W / step) + 1;
    const ny = Math.ceil(H / step) + 1;
    if (nx > this.MAX_LINES_PER_AXIS || ny > this.MAX_LINES_PER_AXIS) {
      const kx = W / (this.MAX_LINES_PER_AXIS - 1);
      const ky = H / (this.MAX_LINES_PER_AXIS - 1);
      step = Math.max(step, Math.min(kx, ky));
    }

    return Math.max(step, 1e-9);
  }

  /**
   * Genera `Feature[]` de líneas verticales y horizontales para el `extent` y `step` dados.
   *
   * @param ext   Extent en unidades del SR.
   * @param step  Paso en unidades del SR (si es inválido/<=0, devuelve arreglo vacío).
   */
  private buildGridFeatures(ext: Extent, step: number): Feature[] {
    const [xmin, ymin, xmax, ymax] = ext;
    const feats: Feature[] = [];

    // Evitar NaN/loop infinito
    if (!isFinite(step) || step <= 0) return feats;

    // Líneas verticales
    for (let x = xmin; x <= xmax + 1e-9; x += step) {
      feats.push(
        new Feature(
          new LineString([
            [x, ymin],
            [x, ymax],
          ])
        )
      );
    }
    // Líneas horizontales
    for (let y = ymin; y <= ymax + 1e-9; y += step) {
      feats.push(
        new Feature(
          new LineString([
            [xmin, y],
            [xmax, y],
          ])
        )
      );
    }
    return feats;
  }

  // ===========================================================================
  // ========================== API PÚBLICA ====================================
  // ===========================================================================

  /**
   * Crea una **nueva** `VectorLayer` de grilla para un `extent` dado
   * (sin añadirla al mapa). Por compatibilidad, usa `idealCells=100`.
   *
   * @param extent  Extent a cubrir.
   * @returns       Capa vectorial de grilla (no visible por defecto).
   */
  createGridLayer(extent: Extent): VectorLayer {
    const [xmin, ymin, xmax, ymax] = extent;
    const step = this.decideStep(extent, /*idealCells*/ 100); // compat: 100 “aprox”
    const features = this.buildGridFeatures([xmin, ymin, xmax, ymax], step);

    this.gridLayer = new VectorLayer({
      source: new VectorSource({ features }),
      style: new Style({
        stroke: new Stroke({ color: 'rgba(0,0,0,0.2)', width: 1 }),
      }),
      visible: false,
    });
    return this.gridLayer;
  }

  /**
   * Devuelve un `extent` **expandido** de forma centrada (factor > 1 lo agranda).
   *
   * @param ext     Extent base.
   * @param factor  Factor de expansión (por defecto 4).
   * @returns       Extent expandido.
   */
  expandExtent(ext: Extent, factor = 4): Extent {
    const [minX, minY, maxX, maxY] = ext;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const w = (maxX - minX) * factor;
    const h = (maxY - minY) * factor;
    return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2] as Extent;
  }

  /**
   * Asegura que exista la **gridLayer** interna para un `extent` dado,
   * creándola si no existe o reemplazando sus features si ya está creada.
   * Usa `idealCells=32` por compatibilidad.
   *
   * @param extent  Extent a cubrir.
   * @returns       La capa de grilla administrada por el servicio.
   */
  ensureGridLayer(extent: Extent): VectorLayer {
    const step = this.decideStep(extent, /*idealCells*/ 32);
    const features = this.buildGridFeatures(extent, step);

    if (!this.gridLayer) {
      this.gridLayer = new VectorLayer({
        source: new VectorSource({ features }),
        style: new Style({
          stroke: new Stroke({ color: 'rgba(0,0,0,0.2)', width: 1 }),
        }),
        visible: false,
        properties: { name: 'gridLayer' },
      });
    } else {
      const src = this.gridLayer.getSource() as VectorSource;
      src.clear();
      src.addFeatures(features);
    }
    return this.gridLayer;
  }

  /**
   * Variante interna que **también** actualiza estilo y permite ajustar densidad.
   *
   * @param extent     Extent a cubrir.
   * @param idealCells (opcional) densidad clásica (si no se define → auto-densidad).
   * @param color      Color del trazo en CSS rgba/hex.
   * @param width      Ancho del trazo en px.
   * @returns          Capa de grilla administrada.
   */
  private ensureGridLayerForExtent(
    extent: Extent,
    idealCells = 32,
    color = 'rgba(0,0,0,0.22)',
    width = 1
  ): VectorLayer {
    const step = this.decideStep(extent, idealCells);
    const feats = this.buildGridFeatures(extent, step);

    if (!this.gridLayer) {
      this.gridLayer = new VectorLayer({
        source: new VectorSource({ features: feats }),
        style: new Style({ stroke: new Stroke({ color, width }) }),
        visible: false,
        properties: { name: 'gridLayer' },
      });
    } else {
      const src = this.gridLayer.getSource() as VectorSource;
      src.clear();
      src.addFeatures(feats);
      this.gridLayer.setStyle(
        new Style({ stroke: new Stroke({ color, width }) })
      );
    }
    return this.gridLayer!;
  }

  /**
   * Cambia la **visibilidad** de la grilla (si existe).
   * @param visible `true` para mostrar, `false` para ocultar.
   */
  setGridVisibility(visible: boolean) {
    if (this.gridLayer) this.gridLayer.setVisible(visible);
  }

  /**
   * Retorna la **capa de grilla** administrada (o `null` si aún no existe).
   */
  getGridLayer(): VectorLayer | null {
    return this.gridLayer;
  }

  /**
   * **Prepara** la capa de grilla para visor o exportación.
   *
   * Modo visor (sin `exportExtent`):
   * - Calcula extent a partir de la vista actual.
   * - Escucha `moveend` para actualizar densidad/dibujo al navegar.
   *
   * Modo exportación (con `exportExtent`):
   * - **Expande** el extent para evitar cortes (por defecto `expandBy=5`).
   * - Fija la grilla sin listeners de navegación (estática).
   *
   * @param visible       Si debe quedar visible al final.
   * @param exportExtent  (opcional) extent específico de exportación.
   * @param opts          (opcional) ajustes: `expandBy`, `idealCells`, `color`, `width`.
   */
  prepareGridLayer(
    visible: boolean,
    exportExtent?: Extent,
    opts?: {
      expandBy?: number;
      idealCells?: number;
      color?: string;
      width?: number;
    }
  ): void {
    const map = this.mapService.getMap();
    if (!map) {
      console.warn('No hay mapa cargado');
      return;
    }

    // 1) Determinar extent (expandido si viene de exportación)
    let extent: Extent;
    if (exportExtent) {
      extent = this.expandExtent(exportExtent, opts?.expandBy ?? 5);
    } else {
      extent = map.getView().calculateExtent(map.getSize()) as Extent;
    }

    // 2) Asegurar/actualizar capa con estilo/densidad
    const gridLayer = this.ensureGridLayerForExtent(
      extent,
      opts?.idealCells ?? undefined, // si viene, se respeta; si no, auto-densidad
      opts?.color ?? 'rgba(0,0,0,0.22)',
      opts?.width ?? 1
    );

    // 3) Insertar en el grupo superior si aún no está
    const upper = this.mapService.getLayerGroupByName(LayerLevel.UPPER);
    if (upper && !upper.getLayers().getArray().includes(gridLayer)) {
      upper.getLayers().push(gridLayer);
    }

    // 4) Listener de moveend solo en modo visor (no exportación)
    map.un('moveend', this.onMapMoveEnd);
    if (!exportExtent) {
      map.on('moveend', this.onMapMoveEnd);
    }

    // 5) Visibilidad final
    this.setGridVisibility(visible);
  }

  /**
   * Listener de `moveend` (modo visor): recalcula y actualiza la grilla
   * para el extent visible actual.
   */
  private onMapMoveEnd = (): void => {
    const map = this.mapService.getMap();
    if (!map) return;
    const extent = map.getView().calculateExtent(map.getSize()) as Extent;
    this.updateGridLayer(extent);
  };

  /**
   * **Cierra** la grilla del mapa:
   * - Quita la capa del grupo superior si estaba insertada.
   * - Desuscribe el listener de `moveend`.
   * - Limpia la referencia interna.
   */
  closeGridLayer(): void {
    const map = this.mapService.getMap();
    if (!map) return;

    const upper = this.mapService.getLayerGroupByName(LayerLevel.UPPER);
    const gridLayer = this.gridLayer;

    this.setGridVisibility(false);
    map.un('moveend', this.onMapMoveEnd);

    if (
      upper &&
      gridLayer &&
      upper.getLayers().getArray().includes(gridLayer)
    ) {
      upper.getLayers().remove(gridLayer);
    }
    this.gridLayer = null;
  }

  /**
   * Reemplaza el **source** de la grilla para un nuevo `extent`, recalculando
   * densidad con `idealCells=32` (compatibilidad).
   *
   * @param extent  Extent a cubrir.
   */
  updateGridLayer(extent: Extent): void {
    if (!this.gridLayer) return;
    const step = this.decideStep(extent, /*idealCells*/ 32);
    const source = new VectorSource({
      features: this.buildGridFeatures(extent, step),
    });
    this.gridLayer.setSource(source);
  }

  /**
   * (Compat interno) Genera un `VectorSource` nuevo con auto-densidad/idealCells=32.
   * @param extent Extent a cubrir.
   */
  private generateGridSource(extent: Extent): VectorSource {
    const step = this.decideStep(extent, /*idealCells*/ 32);
    return new VectorSource({ features: this.buildGridFeatures(extent, step) });
  }

  /**
   * Crea una **capa de grilla independiente** (no administrada), útil para
   * exportaciones ad-hoc. Permite expandir el extent y personalizar estilo.
   *
   * @param extent Extent base.
   * @param opts   Opciones: `idealCells`, `color`, `width`, `expandBy`.
   * @returns      `VectorLayer` lista y **visible**.
   */
  makeStandaloneGridLayer(
    extent: Extent,
    opts?: {
      idealCells?: number;
      color?: string;
      width?: number;
      expandBy?: number;
    }
  ): VectorLayer {
    const ex = this.expandExtent(extent, opts?.expandBy ?? 3);
    const step = this.decideStep(ex, opts?.idealCells);
    const feats = this.buildGridFeatures(ex, step);

    const source = new VectorSource({ features: feats });
    return new VectorLayer({
      source,
      visible: true,
      style: new Style({
        stroke: new Stroke({
          color: opts?.color ?? 'rgba(0,0,0,0.2)',
          width: opts?.width ?? 1,
        }),
      }),
      properties: { name: 'exportGridLayer' },
    });
  }
}
