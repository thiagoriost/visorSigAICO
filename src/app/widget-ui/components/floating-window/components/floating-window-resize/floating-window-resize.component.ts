// Angular Modules
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes y modelos propios
import {
  FloatingWindowConfig,
  FloatingWindowState,
} from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';

@Component({
  selector: 'app-floating-window-resize',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-window-resize.component.html',
  styleUrl: './floating-window-resize.component.scss',
})

/**
 * @description Componente para el redimensionamiento de la ventana con límites mínimos y máximos configurables.
 * Límites fijos:
 * - Ancho mínimo: 100px
 * - Alto mínimo: 60px (tamaño máximos del componente floating-window-header)
 *
 * Límites máximos (opcionales):
 * - Ancho máximo: widgetFloatingWindowConfig.width (si es mayor que 0)
 * - Alto máximo: widgetFloatingWindowConfig.height (si es mayor que 0)
 *
 * Si los valores máximos son nulos, no definidos o iguales a cero,
 * no se aplicará límite máximo para esa dimensión.
 * @author javier.munoz@igac.gov.co
 * @version 1.1.0
 * @since 12/06/2025
 * @class GenericFloatingWindowComponent
 */
export class FloatingWindowResizeComponent {
  // Configuración de entrada para la ventana
  @Input({ required: true }) widgetFloatingWindowConfig!: FloatingWindowConfig;
  @Input({ required: true }) widgetFloatingWindowState!: FloatingWindowState;

  /**
   * Inicia el redimensionamiento
   * @param event: Evento del ratón que inicia el redimensionamiento
   * @returns void
   */
  startResize(event: MouseEvent) {
    // Evita el comportamiento predeterminado del evento
    event.preventDefault();
    // Verifica si el redimensionamiento está habilitado
    if (!this.widgetFloatingWindowConfig.enableResize) return;
    // Establece el estado de redimensionamiento
    this.widgetFloatingWindowState.isResizing = true;
    this.widgetFloatingWindowState.resizeStartX = event.clientX;
    this.widgetFloatingWindowState.resizeStartY = event.clientY;
    // Agrega los eventos de mousemove y mouseup al documento
    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.stopResize);
  }

  /**
   * Redimensiona la ventana según el movimiento del ratón
   * @param event: Evento del ratón que inicia el redimensionamiento
   * @returns void
   */
  onResize = (event: MouseEvent) => {
    // Evita el comportamiento predeterminado del evento
    event.preventDefault();
    // Verifica si el redimensionamiento está activo
    if (this.widgetFloatingWindowState.isResizing) {
      const newWidth = this.calculateNewWidth(event.clientX);
      const newHeight = this.calculateNewHeight(event.clientY);

      this.widgetFloatingWindowState.width = newWidth;
      this.widgetFloatingWindowState.height = newHeight;

      this.updateResizeStartPosition(event.clientX, event.clientY);
    }
  };

  /**
   * Determina si existe un ancho máximo válido en la configuración
   * @returns boolean: true si existe un valor máximo válido
   */
  private hasMaxWidth(): boolean {
    const maxWidth = this.widgetFloatingWindowConfig.maxWidth;
    return maxWidth !== undefined && maxWidth !== null && maxWidth > 0;
  }

  /**
   * Determina si existe un alto máximo válido en la configuración
   * @returns boolean: true si existe un valor máximo válido
   */
  private hasMaxHeight(): boolean {
    const maxHeight = this.widgetFloatingWindowConfig.maxHeight;
    return maxHeight !== undefined && maxHeight !== null && maxHeight > 0;
  }

  /**
   * Calcula el nuevo ancho aplicando límites mínimos y máximos
   * @param currentX: Posición X actual del ratón
   * @returns number: Nuevo ancho validado
   */
  private calculateNewWidth(currentX: number): number {
    const widthChange = currentX - this.widgetFloatingWindowState.resizeStartX;
    const provisionalWidth = this.widgetFloatingWindowState.width + widthChange;
    // Calcular el ancho máximo permitido basado en rightLimit
    const maxWidthBasedOnContainer =
      this.widgetFloatingWindowState.rightLimit -
      this.widgetFloatingWindowState.x;

    // Primero aplicar el mínimo absoluto
    const minWidth = this.widgetFloatingWindowConfig.width;
    let widthWithMin = Math.max(minWidth, provisionalWidth);

    // Aplicar el ancho máximo de la configuración si existe
    if (this.hasMaxWidth() && this.widgetFloatingWindowConfig.maxWidth) {
      widthWithMin = Math.min(
        widthWithMin,
        this.widgetFloatingWindowConfig.maxWidth
      );
    }
    // Luego aplicar máximo sin exceder el límite del contenedor
    return Math.min(widthWithMin, maxWidthBasedOnContainer);
  }

  /**
   * Calcula el nuevo alto aplicando límites mínimos y máximos
   * @param currentY: Posición Y actual del ratón
   * @returns number: Nuevo alto validado
   */
  private calculateNewHeight(currentY: number): number {
    const heightChange = currentY - this.widgetFloatingWindowState.resizeStartY;
    const provisionalHeight =
      this.widgetFloatingWindowState.height + heightChange;
    // Calcular el alto máximo permitido basado en bottomLimit
    const maxHeightBasedOnContainer =
      this.widgetFloatingWindowState.bottomLimit -
      this.widgetFloatingWindowState.y;

    // Primero aplicar el mínimo absoluto
    const minHeight = this.widgetFloatingWindowConfig.height;
    let heightWithMin = Math.max(minHeight, provisionalHeight);

    // Aplicar el alto máximo de la configuración si existe
    if (this.hasMaxHeight() && this.widgetFloatingWindowConfig.maxHeight) {
      heightWithMin = Math.min(
        heightWithMin,
        this.widgetFloatingWindowConfig.maxHeight
      );
    }

    // Aplicar el alto mínimo
    return Math.min(heightWithMin, maxHeightBasedOnContainer);
  }

  /**
   * Actualiza la posición inicial de redimensionamiento
   * @param newX: Nueva coordenada X
   * @param newY: Nueva coordenada Y
   * @returns void
   */
  private updateResizeStartPosition(newX: number, newY: number): void {
    this.widgetFloatingWindowState.resizeStartX = newX;
    this.widgetFloatingWindowState.resizeStartY = newY;
  }
  /**
   * Detiene el redimensionamiento
   * @returns void
   */
  stopResize = () => {
    this.widgetFloatingWindowState.isResizing = false;
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.stopResize);
  };
}
