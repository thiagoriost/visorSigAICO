import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import {
  ItemWidgetState,
  UserInterfaceState,
} from '@app/core/interfaces/store/user-interface.model';
import {
  selectInitialFloatingWindowConfig,
  selectConfigWidgetOpenedSingleRender,
  selectIsWidgetOpenedSingleRender,
} from '@app/core/store/user-interface/user-interface.selectors';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FloatingWindowComponent } from '../floating-window/components/floating-window/floating-window.component';
import { FloatingWindowConfig } from '../floating-window/interfaces/floating-window-config';
import { SingleComponentRenderComponent } from '../single-component-render/single-component-render.component';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { MobileFloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/mobile-floating-window/mobile-floating-window.component';

/**
 * @description Componente que renderiza widgets disparados desde menu flotante - Uno a la vez
 * @author Carlos Javier Muñoz Fernández y Juan Carlos Valderrama Gonzalez
 */
@Component({
  selector: 'app-window-single-component-render',
  standalone: true,
  imports: [
    CommonModule,
    FloatingWindowComponent,
    SingleComponentRenderComponent,
    MobileFloatingWindowComponent,
  ],
  templateUrl: './window-single-component-render.component.html',
  styleUrl: './window-single-component-render.component.scss',
})
export class WindowSingleComponentRenderComponent implements OnDestroy {
  // Subject para manejar la destrucción del componente
  private destroy$ = new Subject<void>();
  // Observable que indica si hay un widget abierto
  existeWidgetAbierto$: Observable<boolean>;
  // Configuración de la ventana flotante
  configFloatingWindow!: FloatingWindowConfig;
  // Configuración del widget actual que se está renderizando
  configuracionWidgetAbierto: ItemWidgetState | undefined;

  //
  @Input() isMobile = false;
  constructor(
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>,
    private userInterfaceService: UserInterfaceService
  ) {
    // Inicializar el observable que indica si hay un widget abierto
    this.existeWidgetAbierto$ = this.userInterfaceStore
      .select(selectIsWidgetOpenedSingleRender)
      .pipe(takeUntil(this.destroy$));

    this.userInterfaceStore
      .select(selectInitialFloatingWindowConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe(configDefault => {
        this.configFloatingWindow = configDefault;
      });
    // Configuración inicial de la ventana flotante
    this.subscribeToWidgetConfig();
  }

  ngOnDestroy(): void {
    // Emitir valor para completar las suscripciones
    this.destroy$.next();
    // Completar el subject
    this.destroy$.complete();
  }

  /**
   * Suscribe a los cambios en la configuración del widget
   */
  private subscribeToWidgetConfig(): void {
    this.userInterfaceStore
      .select(selectConfigWidgetOpenedSingleRender)
      .pipe(takeUntil(this.destroy$))
      .subscribe(configWidget => {
        // Verificar si actualmente hay un widget cargado
        if (configWidget) {
          // obtener la configuración del widget abierto
          this.configuracionWidgetAbierto = configWidget;

          //mutar las propiedades de acuerdo con los valores por defecto
          this.configFloatingWindow = {
            ...this.configFloatingWindow, // Copia todos los valores por defecto de la ventana flotante
            ...({
              //Parametriza la configuración de la ventana flotante de acuerdo con el widget abierto
              x: configWidget.posicionX ?? this.configFloatingWindow.x,
              y: configWidget.posicionY ?? this.configFloatingWindow.y,
              width: configWidget.ancho ?? this.configFloatingWindow.width,
              height: configWidget.alto ?? this.configFloatingWindow.height,
              maxHeight:
                configWidget.altoMaximo ??
                this.configuracionWidgetAbierto.altoMaximo,
              maxWidth:
                configWidget.anchoMaximo ??
                this.configuracionWidgetAbierto.anchoMaximo,
            } as FloatingWindowConfig),
          };
        }
      });
  }

  /**
   * @description Cierra el widget actual y destruye el componente cargado.
   * @returns void
   */
  cerrarWidget() {
    if (this.configuracionWidgetAbierto) {
      // Emitir un evento para cerrar la ventana
      this.userInterfaceService.cambiarVisibleWidget(
        this.configuracionWidgetAbierto.nombreWidget,
        false
      );
      this.userInterfaceStore.dispatch(
        SetSingleComponentWidget({ nombre: undefined })
      );
    }
  }
}
