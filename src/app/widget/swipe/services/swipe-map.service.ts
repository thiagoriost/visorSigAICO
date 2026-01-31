import { Injectable } from '@angular/core';
import { MapService } from '@app/core/services/map-service/map.service';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile.js';
import { Tile as TileSource } from 'ol/source';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import RenderEvent from 'ol/render/Event';

@Injectable({ providedIn: 'root' })
export class SwipeMapService {
  private swipeDivisor: HTMLElement | null = null;
  private prerenderListener: ((evt: RenderEvent) => void) | null = null;
  private postrenderListener: ((evt: RenderEvent) => void) | null = null;
  private currentSwipeLayer: TileLayer<TileSource> | null = null;

  constructor(private mapService: MapService) {
    this.inicializarLimpiezaGlobal();
  }

  activarSwipe(layerId: string) {
    this.desactivarSwipe();
    const map = this.mapService.getMap();
    console.log('Mapa >>> ', map);
    if (!map) return;

    const layersGrup = this.mapService.getLayerGroupByName(
      LayerLevel.INTERMEDIATE
    );
    const layers = layersGrup?.getLayers().getArray();

    const targetLayer = layers?.find(l => l.get('id') === layerId);
    console.log('targetLayer >>> ', targetLayer);

    if (!targetLayer) return;

    // Asegura que la capa esté encima
    map.removeLayer(targetLayer);
    map.addLayer(targetLayer);

    if (targetLayer) {
      if (targetLayer instanceof TileLayer) {
        this.currentSwipeLayer = targetLayer;
        this.agregarSwipe(targetLayer, map);
      } else {
        console.warn('La capa no es de tipo TileLayer, swipe no aplicado');
      }
    }
  }
  desactivarSwipe(): void {
    const map = this.mapService.getMap();
    if (!map || !this.currentSwipeLayer) return;

    const layer = this.currentSwipeLayer;

    // 1. Remover eventos de swipe si existen
    if (this.prerenderListener) {
      layer.un('prerender', this.prerenderListener);
      this.prerenderListener = null;
    }

    if (this.postrenderListener) {
      layer.un('postrender', this.postrenderListener);
      this.postrenderListener = null;
    }

    // 2. Eliminar divisor
    if (this.swipeDivisor && this.swipeDivisor.parentElement) {
      this.swipeDivisor.parentElement.removeChild(this.swipeDivisor);
      this.swipeDivisor = null;
    }

    // 3. Forzar render limpio del canvas

    const layersGrup = this.mapService.getLayerGroupByName(
      LayerLevel.INTERMEDIATE
    );
    //  const layers = layersGrup?.getLayers().getArray();

    layersGrup
      ?.getLayers()
      .getArray()
      .forEach(lyr => {
        //map.getLayers().forEach((lyr) => {
        // Asegúrate de que es un TileLayer con un contexto de canvas válido
        console.log('Layer >>> ', lyr);
        if (lyr instanceof TileLayer) {
          (lyr as TileLayer<TileSource>).once(
            'prerender',
            (evt: RenderEvent) => {
              const ctx = evt.context as CanvasRenderingContext2D;
              try {
                ctx.restore?.(); // limpia cualquier estado pendiente
              } catch {
                // ignora errores
              }
            }
          );
        }
      });

    // 4. Reinsertar capa para limpiar cualquier estado de render en ella
    map.removeLayer(layer);
    map.addLayer(layer);

    this.currentSwipeLayer = null;

    // 5. Forzar render de todo el mapa (todas las capas)
    map.render();
  }

  private agregarSwipe(layer: TileLayer<TileSource>, map: Map): void {
    if (this.swipeDivisor) return;

    const mapTarget = map.getTargetElement();
    if (!mapTarget) return;

    const mapRect = mapTarget.getBoundingClientRect();
    const initialLeft = mapRect.width / 2;

    this.swipeDivisor = document.createElement('div');
    this.swipeDivisor.id = 'swipe-divisor';
    this.swipeDivisor.style.cssText = `
    position: absolute;
    top: 0;
    left: ${initialLeft}px;
    width: 5px;
    height: 100%;
    background: orange;
    z-index: 1000;
    cursor: ew-resize;
  `;
    mapTarget.appendChild(this.swipeDivisor);

    const moveHandler = (e: MouseEvent) => {
      const rect = mapTarget.getBoundingClientRect();
      const relX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      this.swipeDivisor!.style.left = `${relX}px`;

      // ELIMINA listeners anteriores si están activos
      if (this.prerenderListener) {
        layer.un('prerender', this.prerenderListener);
      }

      if (this.postrenderListener) {
        layer.un('postrender', this.postrenderListener);
      }

      // ASIGNA NUEVOS listeners A LAS PROPIEDADES DE LA CLASE
      this.prerenderListener = evt => {
        const ctx = evt.context as CanvasRenderingContext2D;
        if (!ctx || !ctx.canvas) return;

        const width = ctx.canvas.width * (relX / rect.width);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, ctx.canvas.height);
        ctx.clip();
      };

      this.postrenderListener = evt => {
        const ctx = evt.context as CanvasRenderingContext2D;
        if (ctx) ctx.restore();
      };

      layer.on('prerender', this.prerenderListener);
      layer.on('postrender', this.postrenderListener);

      map.render();
    };

    // Activar arrastre del divisor
    this.swipeDivisor.addEventListener('mousedown', () => {
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener(
        'mouseup',
        () => {
          console.log('Activar arrastre del divisor');
          window.removeEventListener('mousemove', moveHandler);
        },
        { once: true }
      );
    });

    // Render inicial centrado
    const initialMouseEvent = new MouseEvent('mousemove', {
      clientX: mapRect.left + initialLeft,
      clientY: mapRect.top + mapRect.height / 2,
    });
    moveHandler(initialMouseEvent);
  }
  private inicializarLimpiezaGlobal(): void {
    console.log('inicializarLimpiezaGlobal >>> ');
    const group = this.mapService.getLayerGroupByName(LayerLevel.INTERMEDIATE);
    console.log('Grupo INTERMEDIATE:', group);
    if (!group) return;

    group.getLayers().on('add', event => {
      const lyr = event.element;
      if (lyr instanceof TileLayer) {
        lyr.once('prerender', (evt: RenderEvent) => {
          const ctx = evt.context as CanvasRenderingContext2D;
          try {
            ctx.restore?.();
          } catch (e) {
            console.warn('[inicializarLimpiezaGlobal] once.prerender', e);
          }
        });
      }
    });
  }
}
