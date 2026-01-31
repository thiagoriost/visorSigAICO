import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

import { MapNavButtonsService } from '@app/widget/map-nav-buttons/services/map-nav-buttons-service/map-nav-buttons.service';
import { MapNavButtonsInterface } from '@app/widget/map-nav-buttons/interfaces/map-nav-buttons.interface';
import { NavButtonsMapService } from '@app/widget/map-nav-buttons/services/nav-buttons-map-service/nav-buttons-map.service';
import { MapHistoryService } from '../../services/map-history-service/map-history.service';

import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import {
  selectCanGoBack,
  selectCanGoForward,
  selectWidgetData,
} from '@app/core/store/map/map.selectors';
import { Observable, Subscription, take } from 'rxjs';
import { MapActions } from '@app/core/store/map/map.actions';
import {
  setPaning,
  setZoomModes,
} from '@app/core/store/user-interface/user-interface.actions';
import { TooltipModule } from 'primeng/tooltip';
import { BackgroundStyleComponent } from '@app/shared/utils/background-style/backgroundStyle';
import { ActionsMapNavButtons } from '@app/core/interfaces/store/user-interface.model';
import { initialActionsMapNavButtonsState } from '@app/core/store/user-interface/user-interface.reducer';
import {
  selectActionsMapNavButtons,
  selectIsAdvancedZoomInActive,
  selectIsAdvancedZoomOutActive,
  selectIsDrawingZoomBox,
  selectIsPaning,
} from '@app/core/store/user-interface/user-interface.selectors';

/**
 * Componente que contiene el widget de zoom y navegación del mapa.
 * Este componente permite realizar acciones de zoom, paneo y reinicio de vista en el mapa.
 * Lógica para mantener los botones de zoom avanzado activos hasta que se presionen

 */
@Component({
  selector: 'app-map-nav-buttons',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  providers: [NavButtonsMapService],
  templateUrl: './map-nav-buttons.component.html',
  styleUrl: './map-nav-buttons.component.scss',
})
/**
 * Componente encargado de renderizar y controlar los botones de navegación del mapa.
 * Gestiona acciones como zoom, paneo, historial y modos avanzados mediante servicios y NgRx.
 *
 * Extiende `BackgroundStyleComponent` para heredar estilos personalizados
 * e implementa `OnInit` y `OnDestroy` para controlar su ciclo de vida.
 * @date 04-06-2025
 * @author
 * javier.munoz@igac.gov.co
 */
export class MapNavButtonsComponent
  extends BackgroundStyleComponent
  implements OnInit, OnDestroy
{
  /** Contiene todas las suscripciones activas del componente. */
  private subscription: Subscription = new Subscription();

  /**
   * Parámetro opcional que recibe la configuración inicial desde el componente padre.
   */
  @Input() configMapNavButtonsInitial: MapNavButtonsInterface | undefined;

  /** Configuración final del componente tras combinar configuración del store y de props. */
  configMapNavButtons = {} as MapNavButtonsInterface;

  /** Observable que indica si el usuario está dibujando un zoom box. */
  isDrawingZoomBox$!: Observable<boolean>;

  /** Observable que indica si el paneo está activo. */
  isPaning$!: Observable<boolean>;

  /** Observable que indica si el modo Advanced Zoom In está activo. */
  isAdvancedZoomInActive$!: Observable<boolean>;

  /** Observable que indica si el modo Advanced Zoom Out está activo. */
  isAdvancedZoomOutActive$!: Observable<boolean>;

  /** Estado actual de los modos de navegación del mapa. */
  stateMapNavButtons: ActionsMapNavButtons = initialActionsMapNavButtonsState;

  /** Indica si se alcanzó el nivel máximo de zoom. */
  isMaxZoom = false;

  /** Indica si se alcanzó el nivel mínimo de zoom. */
  isMinZoom = false;

  /** Indica si existe historial previo de navegación para retroceder. */
  isBackHistory = false;

  /** Indica si existe historial posterior de navegación para avanzar. */
  isForwadHistory = false;

  /**
   * Constructor donde se inyectan servicios del mapa, historial y NgRx Store.
   * También inicializa los observables que escuchan cambios del estado global.
   */
  constructor(
    private mapNavService: MapNavButtonsService,
    private navButtonsMapService: NavButtonsMapService,
    private mapHistoryServce: MapHistoryService,
    private store: Store<MapState>
  ) {
    super();

    this.isDrawingZoomBox$ = this.store.select(selectIsDrawingZoomBox);
    this.isPaning$ = this.store.select(selectIsPaning);
    this.isAdvancedZoomInActive$ = this.store.select(
      selectIsAdvancedZoomInActive
    );
    this.isAdvancedZoomOutActive$ = this.store.select(
      selectIsAdvancedZoomOutActive
    );
  }

  /**
   * Hook de inicialización.
   *
   * Acciones realizadas:
   * - Obtiene configuración inicial del widget desde NgRx Store.
   * - Mezcla datos del Store con los enviados vía `@Input`.
   * - Configura límites de zoom en el servicio correspondiente.
   * - Escucha cambios de zoom máximo/mínimo.
   * - Escucha cambios en los estados de los botones (activo/inactivo).
   * - Inicializa escucha del historial en caso de estar habilitado.
   */
  ngOnInit(): void {
    // Suscripción para obtener configuración inicial del store
    this.subscription.add(
      this.store
        .select(selectWidgetData('MapNavButtons'))
        .pipe(take(1))
        .subscribe(widgetData => {
          if (widgetData) {
            this.configMapNavButtons = this.configMapNavButtonsInitial
              ? {
                  ...(widgetData as MapNavButtonsInterface),
                  ...this.configMapNavButtonsInitial,
                }
              : {
                  ...(widgetData as MapNavButtonsInterface),
                };
          } else {
            console.warn(
              'No se encontraron datos para el widget MapNavButtons'
            );
          }

          // Configuración inicial en el servicio
          this.mapNavService.setZoomLimit(
            this.configMapNavButtons.minZoom,
            this.configMapNavButtons.maxZoom,
            this.configMapNavButtons.isPanEnabled
          );
        })
    );

    // Estado de zoom máximo/mínimo
    this.subscription.add(
      this.mapNavService.isMaxZoom$.subscribe(isMax => {
        this.isMaxZoom = isMax;
      })
    );

    this.subscription.add(
      this.mapNavService.isMinZoom$.subscribe(isMin => {
        this.isMinZoom = isMin;
      })
    );

    // Estado general de los botones
    this.subscription.add(
      this.store
        .select(selectActionsMapNavButtons)
        .subscribe((actionsButtons: ActionsMapNavButtons) => {
          this.stateMapNavButtons = { ...actionsButtons };
        })
    );

    // Historial
    if (this.config.showHistory) {
      this.subscription.add(
        this.store
          .select(selectCanGoBack)
          .subscribe(v => (this.isBackHistory = v))
      );

      this.subscription.add(
        this.store
          .select(selectCanGoForward)
          .subscribe(v => (this.isForwadHistory = v))
      );
    } else {
      this.mapHistoryServce.setInactivateService();
    }
  }

  /**
   * Hook ejecutado antes de destruir el componente.
   * Libera todos los recursos realizando:
   * - Cancelación de suscripciones activas.
   * - Prevención de fugas de memoria.
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Ejecuta la acción de hacer zoom in sobre el mapa.
   * Delegado al servicio `NavButtonsMapService`.
   */
  onZoomIn(): void {
    this.navButtonsMapService.zoomIn();
  }

  /**
   * Ejecuta la acción de hacer zoom out sobre el mapa.
   * Delegado al servicio `NavButtonsMapService`.
   */
  onZoomOut(): void {
    this.navButtonsMapService.zoomOut();
  }

  /**
   * Alterna el modo de zoom avanzado hacia adentro (Advanced Zoom In).
   *
   * Comportamiento:
   * - Activa el dibujo del zoom box si está desactivado.
   * - Detiene el dibujo si ya se encontraba activo.
   * - Actualiza el estado en NgRx para reflejar cambios visuales e interacciones.
   */
  onAdvancedZoomIn(): void {
    if (!this.stateMapNavButtons.isAdvancedZoomInActive) {
      this.mapNavService.startZoomBox(true, this.configMapNavButtons.boxColor);
    } else {
      this.mapNavService.stopZoomBox();
    }

    this.store.dispatch(
      setZoomModes({
        isAdvancedZoomInActive: !this.stateMapNavButtons.isAdvancedZoomInActive,
        isAdvancedZoomOutActive: false,
        isDrawingZoomBox: !this.stateMapNavButtons.isAdvancedZoomInActive,
      })
    );
  }

  /**
   * Alterna el modo de zoom avanzado hacia afuera (Advanced Zoom Out).
   *
   * Comportamiento similar a `onAdvancedZoomIn` pero invierte el sentido del zoom.
   */
  onAdvancedZoomOut(): void {
    if (!this.stateMapNavButtons.isAdvancedZoomOutActive) {
      this.mapNavService.startZoomBox(false, this.configMapNavButtons.boxColor);
    } else {
      this.mapNavService.stopZoomBox();
    }

    this.store.dispatch(
      setZoomModes({
        isAdvancedZoomInActive: false,
        isAdvancedZoomOutActive:
          !this.stateMapNavButtons.isAdvancedZoomOutActive,
        isDrawingZoomBox: !this.stateMapNavButtons.isAdvancedZoomOutActive,
      })
    );
  }

  /**
   * Reinicia la vista del mapa a sus valores iniciales.
   *
   * Acciones:
   * - Desactiva el paneo si se encuentra activo.
   * - Restaura el centro y zoom inicial del mapa.
   * - Desactiva cualquier modo de zoom avanzado activo.
   */
  onResetView(): void {
    if (this.stateMapNavButtons.isPaning) {
      this.onTogglePan();
    }

    this.navButtonsMapService.resetView(
      this.configMapNavButtons.initialCenter,
      this.configMapNavButtons.initialZoom
    );

    if (
      this.stateMapNavButtons.isAdvancedZoomOutActive ||
      this.stateMapNavButtons.isAdvancedZoomInActive
    ) {
      this.store.dispatch(
        setZoomModes({
          isAdvancedZoomInActive: false,
          isAdvancedZoomOutActive: false,
          isDrawingZoomBox: false,
        })
      );
    }
  }

  /**
   * Alterna el estado del zoom mediante la rueda del mouse.
   * Actualiza tanto el Store como el servicio correspondiente.
   */
  onToggleMouseWheelZoom(): void {
    const newState = !this.configMapNavButtons.isMouseWheelZoomEnabled;

    this.store.dispatch(
      MapActions.setWidgetNavButtonsData({
        widgetId: 'MapNavButtons',
        data: {
          ...this.configMapNavButtons,
          isMouseWheelZoomEnabled: newState,
        },
      })
    );

    this.navButtonsMapService.toggleMouseWheelZoom(
      this.configMapNavButtons.isMouseWheelZoomEnabled
    );
  }

  /**
   * Alterna el modo de paneo (pan) en el mapa.
   * También detiene cualquier modo de zoom avanzado activo.
   */
  onTogglePan(): void {
    this.mapNavService.stopZoomBox();

    const newState = !this.stateMapNavButtons.isPaning;
    this.stateMapNavButtons.isPaning = newState;

    this.store.dispatch(
      MapActions.setWidgetNavButtonsData({
        widgetId: 'MapNavButtons',
        data: {
          ...this.configMapNavButtons,
          isPanEnabled: newState,
        },
      })
    );

    this.navButtonsMapService.togglePan(newState);
    this.store.dispatch(setPaning({ isPaning: newState }));
  }

  /**
   * Devuelve la configuración final del widget,
   * utilizada directamente desde el template.
   */
  get config(): MapNavButtonsInterface {
    return this.configMapNavButtons;
  }

  /**
   * Acción ejecutada al hacer clic en el botón de ir hacia atrás en el historial.
   */
  onClickBack(): void {
    this.mapHistoryServce.goBack();
  }

  /**
   * Acción ejecutada al hacer clic en el botón de ir hacia adelante en el historial.
   */
  onClickNext(): void {
    this.mapHistoryServce.goForward();
  }
}
