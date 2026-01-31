import { Injectable, OnDestroy } from '@angular/core';
import { MapService } from '@app/core/services/map-service/map.service';
import { View } from 'ol';
import { DragBox, DragPan, MouseWheelZoom } from 'ol/interaction';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * @description Servicio encargardo de realizar las acciones de Zoom Clic, reset y Panea en el mapa.
 *
 * @author javier.munoz@igac.gov.co
 * @version 1.0.0
 * @since 24/06/2025
 * @class MapNavButtonsService
 */
@Injectable()
export class NavButtonsMapService implements OnDestroy {
  // Propiedades privadas para almacenar el estado de las interacciones
  private mouseWheelZoom: MouseWheelZoom | null = null; // Almacena la interacción MouseWheelZoom
  private dragPan: DragPan | null = null; // Almacena la interacción DragPan
  // Subjects para Identificar si se está dibujando y límites de zoom
  private isPaningSubject = new BehaviorSubject<boolean>(false);
  // Observables públicos
  isPaning$: Observable<boolean> = this.isPaningSubject.asObservable();
  constructor(private mapService: MapService) {}

  /**
   * Limpiar los recursos al destruir el servicio.
   *
   * @memberof MapNavButtonsService
   */
  ngOnDestroy(): void {
    this.isPaningSubject.next(false);
    this.isPaningSubject.complete();
  }

  /**
   * Resetea la vista del mapa a las coordenadas y zoom iniciales.
   *
   * @param initialCenter - Coordenadas iniciales para centrar el mapa.
   * @param initialZoom - Nivel de zoom inicial para el mapa.
   * @memberof MapNavButtonsService
   *
   * @description
   * Este método se encarga de centrar el mapa en las coordenadas proporcionadas
   * y ajustar el nivel de zoom al valor especificado, permitiendo un reinicio
   * rápido de la vista del mapa a su estado inicial.
   */
  resetView(initialCenter: number[], initialZoom: number): void {
    const map = this.mapService.getMap(); // Obtener el mapa
    if (map) {
      // Verificar si el mapa no es null
      const view: View = map.getView(); // Obtener la vista del mapa
      if (!view) {
        console.warn('No se pudo obtener la vista actual.');
        return;
      }
      const currentZoom = view.getZoom(); // Obtener el zoom actual, verificando si la vista existe
      if (currentZoom) {
        // Centrar el mapa en las coordenadas proporcionadas y ajustar el zoom
        view.setCenter(initialCenter); // Cambiar a la posición inicial deseada
        view.setZoom(initialZoom); //cambiar al zoom inicial deseado
        const viewport = map.getViewport(); // Obtener el viewport del mapa
        if (viewport) {
          viewport.style.cursor = 'default';
          this.dispatchEscapeEvent();
        }
        map.getInteractions().forEach(interaction => {
          if (interaction instanceof DragBox) {
            map.removeInteraction(interaction); // Eliminar las interacciones si son de tipo DragBox
          }
        });
      } else {
        console.warn('No se pudo obtener el zoom actual.');
      }
    } else {
      console.warn('El mapa no está disponible aún.');
    }
  }

  // Activa o desactiva el zoom con la rueda del ratón
  toggleMouseWheelZoom(enable: boolean): void {
    const map = this.mapService.getMap(); // Obtener el mapa
    if (map) {
      if (enable) {
        // Solo añadir una nueva interacción si no existe
        if (!this.mouseWheelZoom) {
          this.mouseWheelZoom = new MouseWheelZoom();
          map.addInteraction(this.mouseWheelZoom);
        }
      } else {
        // Eliminar todas las interacciones MouseWheelZoom para asegurar que el zoom se desactiva
        map.getInteractions().forEach(interaction => {
          if (interaction instanceof MouseWheelZoom) {
            map.removeInteraction(interaction);
          }
        });
        this.mouseWheelZoom = null; // Resetear la referencia
      }
    } else {
      console.warn('El mapa no está disponible aún.');
    }
  }

  zoomIn(): void {
    const map = this.mapService.getMap(); // Obtener el mapa
    if (map) {
      const view = map.getView();
      if (view) {
        const zoom = view.getZoom() || 0;
        view.setZoom(zoom + 1);
      } else {
        console.warn('La vista no está disponible aún.');
      }
    } else {
      console.warn('El mapa no está disponible aún.');
    }
  }
  // Aumenta el nivel de zoom del mapa o activa zoom con rectángulo según typeZoom
  zoomOut(): void {
    const map = this.mapService.getMap(); // Obtener el mapa
    if (map) {
      const view = map.getView();
      if (view) {
        const zoom = view.getZoom() || 0;
        view.setZoom(zoom - 1);
      } else {
        console.warn('La vista no está disponible aún.');
      }
    } else {
      console.warn('El mapa no está disponible aún.');
    }
  }

  // Emitir evento Escape para cancelar interacciones activas
  private dispatchEscapeEvent(): void {
    try {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          bubbles: true,
          cancelable: true,
        })
      );
    } catch (error) {
      console.error('Error al emitir evento Escape', error);
    }
  }

  /**
   * Activa/desactiva el paneo del mapa.
   * @param enable - Estado deseado del paneo
   */
  togglePan(enable: boolean): void {
    const map = this.mapService.getMap(); // Obtener el mapa
    if (map) {
      const viewport = map.getViewport(); // Obtener el viewport del mapa
      if (enable) {
        viewport.style.cursor = 'grab'; // Mano abierta
        if (!this.dragPan) {
          // Añadir una nueva interacción DragPan si no existe
          this.dragPan = new DragPan();
          map.addInteraction(this.dragPan);
        }
      } else {
        viewport.style.cursor = 'default'; // Cursor normal
        this.dragPan = null;
      }
      this.isPaningSubject.next(enable); // Indica el estado del paneo
    } else {
      console.warn('El mapa no está disponible aún.');
    }
  }
}
