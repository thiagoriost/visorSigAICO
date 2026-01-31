import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Coordinate } from 'ol/coordinate';
import { InfoPanelService } from '@app/widget/InfoPanel/services/info-panel.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

/**
 * Componente PopUp.
 * Encapsula el nodo HTML necesario para mostrar un popup en el mapa
 * gestionado por InfoPanelService. Recibe coordenadas desde el padre
 * y actualiza la posición del popup cuando estas cambian.
 * @author Carlos …
 * @date 25-08-2025
 * @version 1.0.0
 */
@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './pop-up.component.html',
  styleUrls: ['./pop-up.component.scss'],
})
export class PopUpComponent implements AfterViewInit, OnChanges {
  /**
   * Contenedor HTML del popup en el DOM.
   * Se utiliza para posicionar el popup en el mapa.
   */
  @ViewChild('popupNode') popupNode!: ElementRef<HTMLDivElement>;
  /** Identificador único del popup (asignado al abrirlo)*/
  id?: number;

  /**
   * Coordenadas actuales del popup (obligatorio).
   * Se reciben desde el componente padre para ubicar el popup.
   */
  @Input({ required: true }) coordenadas!: Coordinate;

  /**
   * Color permitido para el encabezado del popup.
   * Puede ser 'primary', 'surface' o 'white'.
   * @default 'surface'
   */
  @Input() color: 'primary' | 'surface' | 'white' = 'surface';

  /**
   * Constructor del componente.
   * @param infoPanelService Servicio encargado de gestionar el popup en el mapa.
   */
  constructor(private infoPanelService: InfoPanelService) {}

  /**
   * Inicializa el popup en el mapa después de renderizar la vista.
   * Este método se ejecuta automáticamente tras la carga del componente.
   */
  ngAfterViewInit(): void {
    if (this.coordenadas) {
      this.id = this.infoPanelService.createPopup(
        this.coordenadas,
        this.popupNode
      );
    }
  }

  /**
   * Detecta cambios en las propiedades del componente.
   * Si las coordenadas cambian, actualiza la posición del popup en el mapa.
   *
   * @param changes Objeto que contiene los cambios detectados en los inputs.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['coordenadas'] && !changes['coordenadas'].firstChange) {
      if (this.id !== undefined) {
        this.infoPanelService.updatePopupCoords(this.id, this.coordenadas);
      }
    }
  }

  /**
   * Cierra el popup eliminándolo del mapa.
   * Se puede invocar desde un botón en la plantilla.
   */
  closePopup(): void {
    if (this.id !== undefined) {
      this.infoPanelService.closePopup(this.id);
      this.id = undefined;
    }
  }

  /**
   * Devuelve la clase CSS correspondiente al color seleccionado para el encabezado del popup.
   *
   * @returns Clase CSS de fondo según el valor de `color`.
   */
  get bgColorClass(): string {
    switch (this.color) {
      case 'primary':
        return 'bg-primary-500';
      case 'white':
        return 'bg-white';
      case 'surface':
      default:
        return 'bg-surface-500';
    }
  }
}
