import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import {
  ItemWidgetState,
  UserInterfaceState,
} from '@app/core/interfaces/store/user-interface.model';

import {
  selectConfigWidgetOpenedSingleRender,
  selectIsWidgetOpenedSingleRender,
} from '@app/core/store/user-interface/user-interface.selectors';

import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';

import { FloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/floating-window/floating-window.component';
import { MobileFloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/mobile-floating-window/mobile-floating-window.component';
import { SingleComponentRenderComponent } from '@app/widget-ui/components/single-component-render/single-component-render.component';

import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';

@Component({
  selector: 'app-window-single-gmrender-component',
  standalone: true,
  imports: [
    CommonModule,
    FloatingWindowComponent,
    MobileFloatingWindowComponent,
    SingleComponentRenderComponent,
  ],
  templateUrl: './window-single-gmrender-component.component.html',
  styleUrl: './window-single-gmrender-component.component.scss',
})
export class WindowSingleGMRenderComponentComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  /** Modo móvil/desktop (mismo comportamiento que tu snippet). */
  @Input() isMobile = false;

  /** Altura de cabecera para la ventana clásica (opcional). */
  @Input() tamanoCabecera = 56;

  /** Config base: aquí defines headerClass, íconos, severities, etc. (requerida). */
  @Input({ required: true }) baseConfig!: FloatingWindowConfig;

  /** Overrides opcionales SOLO si isMobile=true (por ejemplo headerClass distinto, posiciones, etc.). */
  @Input() mobileOverrides?: Partial<FloatingWindowConfig>;

  existeWidgetAbierto$: Observable<boolean>;
  configuracionWidgetAbierto?: ItemWidgetState;
  effectiveConfig!: FloatingWindowConfig;

  constructor(
    private store: Store<{ userInterface: UserInterfaceState }>,
    private ui: UserInterfaceService
  ) {
    this.existeWidgetAbierto$ = this.store
      .select(selectIsWidgetOpenedSingleRender)
      .pipe(takeUntil(this.destroy$));

    this.store
      .select(selectConfigWidgetOpenedSingleRender)
      .pipe(takeUntil(this.destroy$))
      .subscribe(configWidget => {
        if (!configWidget) return;

        this.configuracionWidgetAbierto = {
          ...configWidget,
          // (Opcional) normalización de título:
          titulo:
            configWidget.titulo === 'Exportar Mapa 5'
              ? 'Salida Gráfica'
              : (configWidget.titulo || '').replaceAll(' V2', ''),
        };

        // 1) Empezamos desde tu base (donde está el headerClass y estilos)
        let merged: FloatingWindowConfig = { ...this.baseConfig };

        // 2) Si es móvil, aplica overrides puntuales (si los das)
        if (this.isMobile && this.mobileOverrides) {
          merged = { ...merged, ...this.mobileOverrides };
        }

        // 3) El widget manda SOLO en posición/tamaño si los trae
        this.effectiveConfig = {
          ...merged,
          x: configWidget.posicionX ?? merged.x,
          y: configWidget.posicionY ?? merged.y,
          width: configWidget.ancho ?? merged.width,
          height: configWidget.alto ?? merged.height,
          maxHeight: configWidget.altoMaximo ?? merged.maxHeight,
          maxWidth: configWidget.anchoMaximo ?? merged.maxWidth,
        };

        // Si en el futuro quieres permitir que el widget cambie íconos/estilos:
        // this.effectiveConfig = {
        //   ...this.effectiveConfig,
        //   headerClass: (configWidget as any).headerClass ?? this.effectiveConfig.headerClass,
        //   buttomSeverity: (configWidget as any).buttomSeverity ?? this.effectiveConfig.buttomSeverity,
        //   iconClose: (configWidget as any).iconClose ?? this.effectiveConfig.iconClose,
        //   ...
        // };
      });
  }

  get tituloVentana(): string {
    return this.configuracionWidgetAbierto?.titulo ?? 'Sin título';
  }

  cerrarWidget(): void {
    const cfg = this.configuracionWidgetAbierto;
    if (!cfg) return;
    this.ui.cambiarVisibleWidget(cfg.nombreWidget, false);
    this.store.dispatch(SetSingleComponentWidget({ nombre: undefined }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
