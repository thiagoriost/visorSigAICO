import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
// PrimeNG Modules

import { ButtonModule } from 'primeng/button';
// Componentes y modelos propios
import {
  FloatingWindowConfig,
  FloatingWindowState,
} from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { AttributeTableComponent } from '@app/widget/attributeTable/components/attribute-table/attribute-table.component';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MapState } from '@app/core/interfaces/store/map.model';
import { Store } from '@ngrx/store';
import { selectWidgetStatus } from '@app/core/store/user-interface/user-interface.selectors';
import { TabsModule } from 'primeng/tabs';

/**
 * @description Se utiliza para la visualización de widgets en una ventana fija, con las siguientes características
 * 1) Ocupan el 50% de la altura de la pantalla y 100% del ancho del viewport.
 * 2) Contiene un componente de tabs: Tab 1: El contenido del widget abierto desde el menú flotante. Tab 2: La tabla de resultados (si aplica).
 * 3) En casos donde no se requiere tabla de resultados, se muestra solo el primer tab.
 * 4) La ventana tiene únicamente una opción para cerrar (no es flotante ni draggable).
 *
 * @author javier.munoz@igac.gov.co
 * @version 1.0.0
 * @since 11/07/2025
 * @class MobileFloatingWindowComponent
 */
@Component({
  selector: 'app-mobile-floating-window',
  standalone: true,
  imports: [CommonModule, ButtonModule, AttributeTableComponent, TabsModule],
  templateUrl: './mobile-floating-window.component.html',
  styleUrl: './mobile-floating-window.component.scss',
})
export class MobileFloatingWindowComponent implements OnInit, OnDestroy {
  // Estado inicial de la ventana
  private _state: FloatingWindowState = {
    x: 0, //Posición actual de la ventana extremo izquierdo
    y: 0, //Posición actual de la ventana extremo superior
    width: 0, //Ancho mínimo de la pantalla al iniciar el componente
    height: 0, // Alto mínimo de la pantalla al iniciar el componente
    isMinimized: false, //Estado inicial no minimizado
    isDragging: false, // No está siendo arrastrada inicialmente
    isResizing: false, // No está siendo redimensionada inicialmente
    dragStartX: 0, //Valores iniciales para el inicio de arrastre
    dragStartY: 0, //Valores iniciales para el inicio de redimensionamiento
    resizeStartX: 0, //Valore final para la posición de arrastre de redimensionamiento
    resizeStartY: 0, //Valores final para la posición de redimensionamiento
    topLimit: 0, // Limite superior hasta donde se puede mover la ventana flotante con relación al objeto contenedor del mapa
    leftLimit: 0, // Limite izquierdo hasta donde se puede mover la ventana flotante con relación al objeto contenedor del mapa
    rightLimit: Infinity, // Límite derecho máximo hasta donde se puede mover la ventana flotanta con relación al objeto contenedor del mapa
    bottomLimit: Infinity, // Límite inferior máximo hasta donde se puede mover la ventana flotanta con relación al objeto contenedor del mapa
  };

  activeTab = 0; // Tab activa en modo móvil
  showAttributeTable = false; //Identifica sí existen datos en el storage correspondientes con la tabla de atributos.

  // Configuración de entrada para la ventana
  @Input() widgetFloatingWindowConfig!: FloatingWindowConfig;
  @Input() titulo = '';

  //Eventos de salida
  @Output() closeWindowEvent = new EventEmitter<void>();
  @Output() destroyRequested = new EventEmitter<void>();

  // Suscripción al store para gestión y cancelación controlada.
  private subscription!: Subscription;
  // Subject para manejar la destrucción del componente
  private destroy$ = new Subject<void>();
  // Constructor del componente que inyecta servicios para mapa y estado global.
  constructor(private store: Store<MapState>) {}

  /**
   * Realiza la suscripción al `Store` de NgRx, escuchando cambios de la propiedad visible en `tabla-atributos`.
   * La suscripción se guarda en una variable para garantizar su correcta cancelación en `ngOnDestroy`
   * y así prevenir fugas de memoria.
   */
  ngOnInit(): void {
    this.subscription = this.store
      .select(selectWidgetStatus('attributeTable'))
      .pipe(takeUntil(this.destroy$))
      .subscribe(visible => {
        this.showAttributeTable = visible !== undefined ? visible : false;
        this.activeTab = this.showAttributeTable ? 1 : 0;
      });
  }

  /**
   * Libera recursos antes de destruir el componente:
   * - Cancela la suscripción al Store para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // Emitir valor para completar las suscripciones
    this.destroy$.next();
    // Completar el subject
    this.destroy$.complete();
  }

  /**
   * Getter para acceder al estado de forma segura
   */
  get state(): FloatingWindowState {
    return this._state;
  }

  /**
   *  Cierra la ventana emitiendo un evento
   */
  closeWindow() {
    this.closeWindowEvent.emit(); // Emitir evento en lugar de lógica directa
  }
}
