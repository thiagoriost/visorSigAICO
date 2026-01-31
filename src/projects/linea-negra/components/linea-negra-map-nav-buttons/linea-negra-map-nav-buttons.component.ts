import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { MapActions } from '@app/core/store/map/map.actions';
import { selectWidgetData } from '@app/core/store/map/map.selectors';
import { MapNavButtonsComponent } from '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component';
import { MapNavButtonsInterface } from '@app/widget/map-nav-buttons/interfaces/map-nav-buttons.interface';
import { Store } from '@ngrx/store';
import { filter, Subject, take, takeUntil } from 'rxjs';

/**
 * Componente que envuelve los botnes disponibles para el mapa con la configuracion
 * personalizada de los botones para el proyecto de linea negra
 * @date 06-10-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-linea-negra-map-nav-buttons',
  imports: [MapNavButtonsComponent],
  templateUrl: './linea-negra-map-nav-buttons.component.html',
  styleUrl: './linea-negra-map-nav-buttons.component.scss',
})
export class LineaNegraMapNavButtonsComponent implements OnInit, OnDestroy {
  /**
   * Subject usado como "notificador de destrucción".
   * Se emite en `ngOnDestroy` para completar todas las suscripciones que estén
   * encadenadas con `takeUntil(this.destroy$)`.
   */
  private destroy$ = new Subject<void>();

  /**
   * Configuración inicial que recibe el componente hijo `MapNavButtonsComponent`.
   * Se llena cuando el selector del store devuelve datos para el widget 'MapNavButtons'.
   * Puede ser `undefined` mientras no llegue información.
   */
  configMapNavButtonsInitial: MapNavButtonsInterface | undefined;

  constructor(
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>
  ) {}

  /**
   * Hook de inicialización del componente.
   * Se suscribe al store para obtener la configuración del widget `MapNavButtons`.
   * La suscripción se maneja con `takeUntil(this.destroy$)` para auto-liberarse al destruir el componente.
   */
  ngOnInit(): void {
    // 1) Selecciona del store los datos del widget con nombre 'MapNavButtons'
    // Parchear config del widget: dejar solo 4 botones
    this.userInterfaceStore
      .select(selectWidgetData('MapNavButtons'))
      .pipe(
        takeUntil(this.destroy$),
        filter((cfg): cfg is MapNavButtonsInterface => !!cfg),
        take(1)
      )
      .subscribe(cfg => {
        const patched: MapNavButtonsInterface = {
          ...cfg,
          // visibles
          showPan: true,
          showZoomIn: false,
          showZoomOut: false,
          showResetView: true,
          showHistory: true,
          // ocultos
          showToggleMouseWheelZoom: false,
          showAdvancedZoomIn: true,
          showAdvancedZoomOut: true,
          isMouseWheelZoomEnabled: false,
          gapButtons: 2,
          buttomSeverity: 'secondary',
          customIconStyles: {
            iconPanEnabled: 'ln-close',
            iconPanDisabled: 'pi pi-arrows-alt',
            iconAdvancedZoomIn: 'ln-zoom_in',
            iconAdvancedZoomOut: 'ln-zoom_out',
            iconResetView: 'ln-world',
          },
          size: 'large',
        };

        this.userInterfaceStore.dispatch(
          MapActions.setWidgetNavButtonsData({
            widgetId: 'MapNavButtons',
            data: patched,
          })
        );
      });
  }

  /**
   * Se ejecuta al destruirse el componente
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete(); // Completa el Subject para liberar recursos
  }
}
