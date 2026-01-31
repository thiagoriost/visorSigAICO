import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { WidgetItemFuncionState } from '@app/core/interfaces/store/user-interface.model';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';

/**
 * Componente TopbarComponent
 *
 * Representa la barra superior del visor, desde donde se pueden:
 * - Abrir widgets activos.
 * - Alternar la visibilidad del sidebar.
 * - Alternar una segunda sección adicional del visor.
 * - Guardar la configuración actual de widgets en localStorage.
 *
 * Este componente es standalone y utiliza PrimeNG para botones y tooltips.
 * Se comunica con el componente padre (Playground o visor) mediante Inputs y Outputs.
 *
 * @author Sergio Alonso Mariño Duque
 * @date 05-08-2025
 * @version 1.0.0
 *
 */

@Component({
  standalone: true,
  selector: 'app-topbar',
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  /**
   * Lista de widgets activos proporcionada por el componente padre.
   * Esta lista se utiliza para renderizar accesos rápidos en la topbar.
   */
  @Input() widgetsActivos: WidgetItemFuncionState[] = [];
  /**
   * Evento emitido cuando se desea limpiar la configuración de widgets.
   */
  @Output() clearConfig = new EventEmitter<void>();
  /**
   * Evento emitido cuando se enfoca un widget específico desde la topbar.
   */
  @Output() focusWidget = new EventEmitter<string>();
  /**
   * Evento emitido cuando se desea abrir un widget específico desde la topbar.
   */
  @Output() openWidget = new EventEmitter<string>();

  /**
   * Indica si la segunda sección del visor (bajo la topbar) está visible.
   * Controlado desde el componente padre.
   */
  @Input() isSecondSectionVisible = false;
  /**
   * Evento de actualización para el estado de visibilidad de la segunda sección.
   * Permite al componente padre sincronizar el estado interno.
   */
  @Output() isSecondSectionVisibleChange = new EventEmitter<boolean>();
  /**
   * Evento emitido al hacer clic en el botón de mostrar/ocultar sidebar.
   * Es manejado por el componente padre para alternar la visibilidad del menú lateral.
   */
  @Output() sidebarToggle = new EventEmitter<void>();

  /**
   * Estado local que controla si se muestra el detalle de widgets en la topbar.
   */
  mostrarDetalle = true;

  constructor(
    private userInterfaceService: UserInterfaceService,
    private store: Store<{ userInterface: UserInterfaceState }>,
    private messageService: MessageService
  ) {}

  /**
   * Alterna la visibilidad del sidebar izquierdo.
   * Dispara un evento para que el componente padre lo maneje.
   */
  toggleSidebar() {
    console.log('[Topbar] toggleSidebar click');
    this.sidebarToggle.emit();
  }

  /**
   * Alterna la visibilidad de la segunda sección inferior del visor.
   * Emite el nuevo valor al componente padre.
   */
  toggleSecondSection() {
    this.isSecondSectionVisible = !this.isSecondSectionVisible;
    this.isSecondSectionVisibleChange.emit(this.isSecondSectionVisible);
  }

  /**
   * Alterna la visibilidad del bloque de detalle de widgets activos.
   */
  toggleDetalle() {
    this.mostrarDetalle = !this.mostrarDetalle;
  }

  /**
   * Acción para abrir un widget desde la topbar.
   * Emite el nombre del widget al componente padre.
   */
  abrirWidget(widget: WidgetItemFuncionState) {
    this.openWidget.emit(widget.nombreWidget);
  }

  /**
   * Guarda la configuración actual de widgets activos en el localStorage.
   * Incluye un timestamp para trazabilidad.
   * Muestra un mensaje de éxito mediante PrimeNG.
   */
  saveWidgetsConfig() {
    const nombresActivos = this.widgetsActivos.map(w => w.nombreWidget);

    const config = {
      widgetsActivos: nombresActivos,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('widgetConfig', JSON.stringify(config));

    this.messageService.add({
      severity: 'success',
      summary: 'Configuración guardada',
      detail: `Se guardaron ${nombresActivos.length} widgets.`,
      life: 2500,
    });
  }
}
