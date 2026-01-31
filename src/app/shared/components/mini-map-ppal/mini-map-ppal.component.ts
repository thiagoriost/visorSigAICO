import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  Input,
} from '@angular/core';
import { MiniMapService } from '@app/shared/services/mini-map/mini-map.service';
import { MapService } from '@app/core/services/map-service/map.service';
import Map from 'ol/Map';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';

/**
 * Componente principal encargado de renderizar el mini mapa en la aplicación.
 * Funcionalidades:
 * - Obtiene el mapa principal desde `MapService`.
 * - Inicializa el mini mapa mediante `MiniMapService`.
 * - Limpia el mini mapa al destruirse el componente.
 * Uso:
 *  <app-mini-map-ppal></app-mini-map-ppal>
 * Este componente solo contiene la vista (HTML) del mini mapa
 * y delega toda la lógica de creación, sincronización y eliminación
 * al servicio `MiniMapService`.
 */
@Component({
  selector: 'app-mini-map-ppal',
  templateUrl: './mini-map-ppal.component.html',
})
export class MiniMapPpalComponent implements AfterViewInit, OnDestroy {
  /**
   * Referencia al mapa principal de la aplicación.
   * Se obtiene desde `MapService`.
   */
  private mainMap: Map | null = null;

  @Input() baseLayer: MapasBase = MapasBase.GOOGLE_SATELLITE;

  /**
   * Referencia al contenedor HTML donde se renderiza el mini mapa.
   * Esta referencia se pasa al servicio `MiniMapService` para inicializar el mapa.
   */
  @ViewChild('miniMapContainer', { static: true })
  miniMapContainer!: ElementRef;

  constructor(
    private miniMapService: MiniMapService,
    private mapService: MapService
  ) {}

  /**
   * Lifecycle hook que se ejecuta después de renderizar la vista.
   * Inicializa el mini mapa dentro del contenedor HTML definido.
   */
  ngAfterViewInit(): void {
    this.mainMap = this.mapService.getMap();

    if (this.mainMap) {
      this.miniMapService.createMiniMap(
        this.mainMap,
        this.miniMapContainer.nativeElement
      );
    } else {
      console.error('No se encontró el mapa principal al inicializar MiniMap');
    }
  }

  /**
   * Lifecycle hook que se ejecuta al destruir el componente.
   * Limpia la referencia del mini mapa y lo elimina del DOM.
   */
  ngOnDestroy(): void {
    this.miniMapService.removeMiniMap();
  }
}
