import { Injectable, ElementRef } from '@angular/core';
import { Overlay } from 'ol';
import { Coordinate } from 'ol/coordinate';
import { MapService } from '@app/core/services/map-service/map.service';

/**
 * Servicio para la gestión de un único popup en el mapa.
 *
 * Permite crear, actualizar y cerrar un popup utilizando un Overlay de OpenLayers.
 * El popup se crea a partir de un elemento HTML proporcionado por un componente Angular.
 *
 * @author Carlos ...
 * @date 25-08-2025
 * @version 1.0.1
 */
@Injectable({
  providedIn: 'root',
})
export class InfoPanelService {
  /** Array para almacenar los Overlay activos del popup (solo uno a la vez) */
  private arrayPopups: { id: number; overlay: Overlay }[] = [];
  private nextId = 1;

  /**
   * Constructor del servicio
   *
   * @param mapService Servicio para obtener la referencia al mapa de OpenLayers
   */
  constructor(private mapService: MapService) {}

  /**
   * Crea un popup en el mapa en las coordenadas especificadas.
   * Si ya existe un popup abierto, lo cierra antes de crear uno nuevo.
   *
   * @param coordinates Coordenadas donde se ubicará el popup (EPSG:4326 o transformadas según el mapa)
   * @param componenteHTML Elemento HTML que contendrá el contenido del popup
   */
  public createPopup(
    coordinates: Coordinate,
    componenteHTML: ElementRef<HTMLDivElement>
  ): number {
    const map = this.mapService.getMap();
    if (!map) throw new Error('No hay mapa disponible');

    // Crear overlay en la posición indicada
    const overlay = new Overlay({
      element: componenteHTML.nativeElement,
      positioning: 'bottom-center',
      offset: [0, -30],
      stopEvent: true,
    });

    map.addOverlay(overlay);
    overlay.setPosition(coordinates);

    const id = this.nextId++;
    this.arrayPopups.push({ id, overlay });
    return id;
  }

  /**
   * Actualiza la posición del popup activo a nuevas coordenadas.
   *
   * @param coordinates Nuevas coordenadas donde se ubicará el popup
   */
  public updatePopupCoords(id: number, coordinates: Coordinate): void {
    const popup = this.arrayPopups.find(p => p.id === id);
    if (!popup) return;
    popup.overlay.setPosition(coordinates);
  }

  /**
   * Cierra el popup actual y elimina el overlay del mapa.
   * Si no hay popup abierto, no realiza ninguna acción.
   */

  public closePopup(id: number): void {
    const map = this.mapService.getMap();
    const index = this.arrayPopups.findIndex(p => p.id === id);
    if (index !== -1) {
      map?.removeOverlay(this.arrayPopups[index].overlay);
      this.arrayPopups.splice(index, 1);
    }
  }

  /**
   * cierra todos los popups abiertos en el mapa.
   */
  public closeAllPopups(): void {
    const map = this.mapService.getMap();
    this.arrayPopups.forEach(p => map?.removeOverlay(p.overlay));
    this.arrayPopups = [];
  }
}
