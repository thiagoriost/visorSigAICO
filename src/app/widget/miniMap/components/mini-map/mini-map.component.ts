import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { MiniMapPpalComponent } from '@app/shared/components/mini-map-ppal/mini-map-ppal.component';
import { BackgroundStyleComponent } from '@app/shared/utils/background-style/backgroundStyle';
import { TooltipModule } from 'primeng/tooltip';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { MiniMapService } from '@app/shared/services/mini-map/mini-map.service';

/**
 * Componente contenedor del botón que controla el mini mapa.
 * - Permite alternar la visibilidad del `MiniMapPpalComponent`.
 * - No contiene lógica de OpenLayers, delega toda la gestión al servicio en `MiniMapPpalComponent`.
 *
 * Creador: Carlos Alberto Aristizabal Vargas
 * Fecha: 28-03-2025
 */
@Component({
  selector: 'app-mini-map',
  standalone: true,
  imports: [ButtonModule, TooltipModule, CommonModule, MiniMapPpalComponent],
  templateUrl: './mini-map.component.html',
  styleUrls: ['./mini-map.component.scss'],
})
export class MiniMapComponent
  extends BackgroundStyleComponent
  implements OnChanges
{
  /**
   * Controla si el mini mapa es visible o no.
   */
  isMiniMapVisible = false;

  /** Icono del botón (por defecto 'pi pi-eye') */
  @Input() buttonIcon?: string;

  /** Indica si el botón es redondeado (por defecto true) */
  @Input() buttonRounded?: boolean;

  /** Tamaño del botón (por defecto undefined) */
  @Input() buttonSize?: 'small' | 'large';

  /** Clase de estilo para el contenedor del mapa */
  @Input() mapContainerClass?: string;

  /** Posición del mini mapa respecto al botón (8 opciones) */
  @Input() mapPosition:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'left-top'
    | 'right-top'
    | 'left-bottom'
    | 'right-bottom' = 'top-left';

  /**
   * Alterna la visibilidad del mini mapa.
   * Cuando es `true`, el componente `<app-mini-map-ppal>` se renderiza automáticamente.
   */
  toggleMiniMap(): void {
    this.isMiniMapVisible = !this.isMiniMapVisible;
  }

  /** Devuelve el icono con valor por defecto */
  get buttonIconValue(): string {
    return this.buttonIcon || 'pi pi-eye';
  }

  /** Devuelve si el botón es redondeado (por defecto true) */
  get buttonRoundedValue(): boolean {
    return this.buttonRounded === undefined ? true : this.buttonRounded;
  }

  /** Personalización de ancho y alto */
  @Input() width = '12rem';
  @Input() height = '12rem';

  private _baseMap: MapasBase = MapasBase.GOOGLE_SATELLITE;
  @Input() set baseMap(value: MapasBase) {
    this._baseMap = value || MapasBase.GOOGLE_SATELLITE;
    this.miniMapService.updateMiniMapLayer(this._baseMap);
  }

  get baseMap(): MapasBase {
    return this._baseMap;
  }

  /** Indica si se permite el paneo en el mini mapa (por defecto false) */
  @Input() isPanEnabled = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isPanEnabled']) {
      this.miniMapService.setPanEnabled(this.isPanEnabled);
    }
  }

  constructor(private miniMapService: MiniMapService) {
    super();
  }

  /** Clases CSS para la posición del mini mapa respecto al botón */
  private get mapPositionClasses(): string[] {
    switch (this.mapPosition) {
      //Casos para posiciones normales
      case 'top-left':
        return ['top-0', 'right-0', '-translate-y-100'];
      case 'top-right':
        return ['top-0', 'left-0', '-translate-y-100'];
      case 'bottom-left':
        return ['bottom-0', 'right-0', 'translate-y-100'];
      case 'bottom-right':
        return ['bottom-0', 'left-0', 'translate-y-100'];
      //casos para posiciones SIDE
      case 'left-top':
        return ['bottom-0', 'left-0', '-translate-x-100'];
      case 'right-top':
        return ['bottom-0', 'right-0', 'translate-x-100'];
      case 'left-bottom':
        return ['top-0', 'left-0', '-translate-x-100'];
      case 'right-bottom':
        return ['top-0', 'right-0', 'translate-x-100'];
      default:
        return [];
    }
  }

  get combinedMapClasses(): string[] {
    const classes = this.mapPositionClasses;
    if (this.mapContainerClass) {
      classes.push(this.mapContainerClass);
    }
    return classes;
  }
}
