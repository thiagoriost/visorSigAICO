import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MiniMapPpalComponent } from '@app/shared/components/mini-map-ppal/mini-map-ppal.component';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

import { MiniMapService } from '@app/shared/services/mini-map/mini-map.service';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';

@Component({
  selector: 'app-mini-map-v2',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MiniMapPpalComponent,
    CardModule,
    TooltipModule,
  ],
  templateUrl: './mini-map-v2.component.html',
  styleUrls: ['./mini-map-v2.component.scss'],
})
export class MiniMapV2Component implements OnChanges {
  isMiniMapVisible = false;

  /** Mapa base actual (recibido desde el Launcher o default si no se pasa) */
  private _baseMap: MapasBase = MapasBase.GOOGLE_SATELLITE;

  /** Identificador unico para el mini-mapa */
  private static nextId = 0;
  public miniMapId = `mini-map-${MiniMapV2Component.nextId++}`;

  /** Posición del mini mapa en la pantalla */
  @Input() mapPosition:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right' = 'top-left';

  /** Variante de visualización: 'header' para encabezado o 'button' para botón flotante */
  @Input() variant: 'header' | 'button' = 'header';

  /** Posición del botón flotante cuando variant='button' */
  @Input() buttonPosition:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right' = 'top-right';

  /** Personalización de ancho y alto */
  @Input() width = '12rem';
  @Input() height = '12rem';

  /** Tamaño del componente: small | normal | large */
  @Input() buttonSize: 'small' | 'normal' | 'large' = 'normal';

  /** Icono del botón */
  @Input() buttonIcon?: string;

  /** Estilo de severidad del botón */
  @Input() severity:
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast'
    | undefined = undefined;

  /** Estilo de severidad del botón del header */
  @Input() headerButtonSeverity:
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast'
    | undefined = 'secondary';

  /** Icono para el botón de cierre exterior. */
  @Input() closeButtonIcon = 'pi pi-minus';

  /** Severidad para el botón de cierre exterior. */
  @Input() closeButtonSeverity:
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast'
    | undefined = 'secondary';

  /** Indica si el botón es redondeado (por defecto true) */
  @Input() buttonRounded?: boolean;

  /** Clases adicionales para header y body */
  @Input() headerClass = '';
  @Input() bodyClass = '';

  /**
   * Indica si se permite el paneo en el mini mapa.
   * Cuando es true, el usuario puede arrastrar el mini mapa, y ese movimiento
   * actualizará el centro del mapa principal.
   * Por defecto es false.
   */
  @Input() isPanEnabled = false;

  /** Titulo del header */
  @Input() headerTitle?: string;

  /**
   * Mapa base actual (recibido desde el Launcher o default si no se pasa)
   * Se utiliza para actualizar la capa base del mini mapa dinámicamente.
   * Si no se proporciona un valor, se utiliza GOOGLE_SATELLITE como valor predeterminado.
   */
  @Input() set baseMap(value: MapasBase) {
    this._baseMap = value || MapasBase.GOOGLE_SATELLITE;
    this.miniMapService.updateMiniMapLayer(this._baseMap);
  }

  /**
   * Devuelve el valor actual de la capa base del mini mapa.
   * Este valor se utiliza para actualizar la capa base del mini mapa dinámicamente.
   * Si no se proporciona un valor, se utiliza GOOGLE_SATELLITE como valor predeterminado.
   */
  get baseMap(): MapasBase {
    return this._baseMap;
  }

  constructor(private miniMapService: MiniMapService) {}

  /**
   * Se ejecuta cuando cambian las @Input() desde el launcher.
   * Aquí sincronizamos el estado de paneo con el servicio.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isPanEnabled']) {
      this.miniMapService.setPanEnabled(this.isPanEnabled);
    }
  }

  toggleMinimize(): void {
    this.isMiniMapVisible = !this.isMiniMapVisible;
  }

  /** Clases dinámicas para ubicar el botón FUERA del mini-mapa */
  get buttonClasses() {
    switch (this.buttonPosition) {
      case 'top-left':
        return ['top-0', 'left-0', '-translate-x-100'];
      case 'top-right':
        return ['top-0', 'right-0', 'translate-x-100'];
      case 'bottom-left':
        return ['bottom-0', 'left-0', '-translate-x-100'];
      case 'bottom-right':
        return ['bottom-0', 'right-0', 'translate-x-100'];
      default:
        return [];
    }
  }

  /**
   * Devuelve las clases CSS para ubicar el mini-mapa en la interfaz.
   * Se utiliza para posicionar el mini-mapa en una de las cuatro esquinas de la interfaz
   * (top-left, top-right, bottom-left, bottom-right).
   * @returns {string[]} Las clases CSS para ubicar el mini-mapa.
   */
  get windowPositionClasses() {
    switch (this.mapPosition) {
      case 'top-left':
        return ['top-0', 'left-0']; //, 'm-2';
      case 'top-right':
        return ['top-0', 'right-0']; //, 'm-2'
      case 'bottom-left':
        return ['bottom-0', 'left-0']; //, 'm-2'
      case 'bottom-right':
        return ['bottom-0', 'right-0']; //, 'm-2'
      default:
        return [];
    }
  }

  /** Tamaño que entiende PrimeNG para el botón */
  get buttonSizeValue(): 'small' | 'large' | undefined {
    switch (this.buttonSize) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return undefined;
    }
  }

  //** Icono que entiende PrimeNG para el botón */
  get buttonIconValue(): string {
    return this.buttonIcon || 'pi pi-eye'; // valor por defecto
  }

  /** Devuelve el valor de redondeo con valor por defecto */
  get buttonRoundedValue(): boolean {
    return this.buttonRounded ?? true; // si no se define, será true
  }
}
