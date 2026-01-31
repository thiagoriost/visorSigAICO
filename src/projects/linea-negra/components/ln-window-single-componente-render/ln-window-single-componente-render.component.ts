import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  ItemWidgetState,
  UserInterfaceState,
} from '@app/core/interfaces/store/user-interface.model';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import {
  selectConfigWidgetOpenedSingleRender,
  selectIsWidgetOpenedSingleRender,
} from '@app/core/store/user-interface/user-interface.selectors';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { SingleComponentRenderComponent } from '@app/widget-ui/components/single-component-render/single-component-render.component';
import { ResponsiveFloatingWindowComponent } from 'projects/linea-negra/components/responsive-floating-window/responsive-floating-window.component';
import { MobileFloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/mobile-floating-window/mobile-floating-window.component';

/**
 * Componente que renderiza la ventana flotante para el proyecto de linea negra
 * @date 03-10-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-ln-window-single-componente-render',
  imports: [
    SingleComponentRenderComponent,
    CommonModule,
    ResponsiveFloatingWindowComponent,
    MobileFloatingWindowComponent,
  ],
  templateUrl: './ln-window-single-componente-render.component.html',
  styleUrl: './ln-window-single-componente-render.component.scss',
})
export class LnWindowSingleComponenteRenderComponent implements OnDestroy {
  @Input() isMobile = false; //indica si está en resolucion de pantalla para moviles

  // Subject para manejar la destrucción del componente
  private destroy$ = new Subject<void>();
  // Observable que indica si hay un widget abierto
  existeWidgetAbierto$: Observable<boolean>; //indica si existe un widget abierto

  // Configuración del widget actual que se está renderizando
  configuracionWidgetAbierto: ItemWidgetState | undefined;

  // Configuración de la ventana flotante
  @Input({ required: true }) configFloatingWindow!: FloatingWindowConfig; //configuracion para la ventana flotante

  constructor(
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>,
    private userInterfaceService: UserInterfaceService
  ) {
    // Inicializar el observable que indica si hay un widget abierto
    this.existeWidgetAbierto$ = this.userInterfaceStore
      .select(selectIsWidgetOpenedSingleRender)
      .pipe(takeUntil(this.destroy$));

    // Actualiza la configuración de la ventana flotante con base en la configuración del widget
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
          this.configuracionWidgetAbierto = {
            ...configWidget,
            titulo:
              configWidget.titulo == 'Exportar Mapa 3'
                ? 'Salida Gráfica'
                : configWidget.titulo.replaceAll(' V2', ''),
          };

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
              headerClass:
                'bg-primary border-round-top-2xl justify-content-end flex flex-row align-items-center h-3rem',
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
