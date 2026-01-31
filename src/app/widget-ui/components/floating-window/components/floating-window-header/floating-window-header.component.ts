// Angular Modules
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';

// Componentes y modelos propios
import {
  FloatingWindowConfig,
  FloatingWindowState,
} from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';

@Component({
  selector: 'app-floating-window-header',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './floating-window-header.component.html',
  styleUrl: './floating-window-header.component.scss',
})

/**
 * @description Se utiliza para la creación del encabezado de las ventanas flotantes
 *  incluyendo funcionalidades de minimizar, maximizar y cerrar la ventana.
 *
 * @author javier.munoz@igac.gov.co
 * @version 1.0.0
 * @since 11/06/2025
 * @class FloatingWindowHeaderComponent
 */
export class FloatingWindowHeaderComponent implements OnInit {
  // Configuración de entrada para la ventana
  @Input({ required: true }) widgetFloatingWindowConfig!: FloatingWindowConfig;
  @Input({ required: true }) widgetFloatingWindowState!: FloatingWindowState;
  @Input({ required: true }) titulo!: string;
  @Input() tamanoCabecera = 56; //Tamaño estático del componente FloatingWindowHeaderComponent
  // Output para emitir el evento de cierre
  @Output() closeWindowEvent = new EventEmitter<void>();

  // Almacena la altura original de la ventana para restaurarla al maximizar
  originalHeight = 0;

  // Identifica la posición del ícono minimizar
  iconMinPosition = 'flex-order-2';
  // Identifica la posición del ícono cerrar
  iconClosePosition = 'flex-order-2';

  ngOnInit(): void {
    this.iconMinPosition = this.orderHeader(
      this.widgetFloatingWindowConfig.iconMinimizePosition
    );
    this.iconClosePosition = this.orderHeader(
      this.widgetFloatingWindowConfig.iconClosePosition
    );
  }

  /**
   * Mueve la ventana según la posición del ratón
   * @param event: Evento del ratón que inicia el drag
   * @returns void
   */
  onDrag = (event: MouseEvent) => {
    // Evita el comportamiento predeterminado del evento
    event.preventDefault();
    if (!this.widgetFloatingWindowState.isDragging) {
      return;
    }

    // Calcular nueva posición relativa al punto inicial de arrastre
    let newX = event.clientX - this.widgetFloatingWindowState.dragStartX;
    let newY = event.clientY - this.widgetFloatingWindowState.dragStartY;

    // Restringir x dentro de los límites
    const minX = this.widgetFloatingWindowState.leftLimit;
    const maxX =
      this.widgetFloatingWindowState.rightLimit -
      this.widgetFloatingWindowState.width;
    newX = Math.max(minX, Math.min(newX, maxX));

    // Restringir y dentro de los límites
    const minY = this.widgetFloatingWindowState.topLimit;
    const maxY =
      this.widgetFloatingWindowState.bottomLimit -
      this.widgetFloatingWindowState.height;
    newY = Math.max(minY, Math.min(newY, maxY));

    // Actualizar las posiciones en el estado
    this.widgetFloatingWindowState.x = newX;
    this.widgetFloatingWindowState.y = newY;
  };

  // Detiene el arrastre
  stopDrag = () => {
    this.widgetFloatingWindowState.isDragging = false;
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  };

  // Inicia el arrastre de la ventana
  startDrag(event: MouseEvent) {
    // Evita el comportamiento predeterminado del evento
    event.preventDefault();
    // Verifica si el arrastre está habilitado en la configuración
    if (!this.widgetFloatingWindowConfig.enableDrag) {
      return;
    }
    // Establece el estado de arrastre y las posiciones iniciales
    this.widgetFloatingWindowState.isDragging = true;
    this.widgetFloatingWindowState.dragStartX =
      event.clientX - this.widgetFloatingWindowState.x;
    this.widgetFloatingWindowState.dragStartY =
      event.clientY - this.widgetFloatingWindowState.y;
    // Agrega los listeners para el movimiento del ratón y el final del arrastre
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
  }

  // Alterna entre minimizar y restaurar la ventana
  toggleMinimize() {
    this.widgetFloatingWindowState.isMinimized = true;
    this.originalHeight = this.widgetFloatingWindowState.height;
    this.widgetFloatingWindowState.height = this.tamanoCabecera;
  }

  // Alterna entre minimizar y restaurar la ventana
  toggleMaximize() {
    this.widgetFloatingWindowState.isMinimized = false;
    this.widgetFloatingWindowState.height = this.originalHeight;
    if (
      this.widgetFloatingWindowState.y >
      this.widgetFloatingWindowState.bottomLimit - this.originalHeight
    ) {
      this.widgetFloatingWindowState.y =
        this.widgetFloatingWindowState.bottomLimit - this.originalHeight;
    }
  }

  // Cierra la ventana emitiendo un evento
  closeContentWindow() {
    this.closeWindowEvent.emit(); // Emitir evento en lugar de lógica directa
  }

  // Alterna entre minimizar y restaurar la ventana
  orderHeader(iconPosition: string | undefined): string {
    if (iconPosition === undefined) {
      return 'flex-order-2 pl-2';
    }
    if (iconPosition === 'left') {
      return 'flex-order-0 pr-2';
    } else {
      return 'flex-order-2';
    }
  }
}
