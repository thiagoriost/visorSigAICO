// floating-map-controls.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';

import { MapNavButtonsComponent } from '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component';
import { MapNavButtonsInterface } from '@app/widget/map-nav-buttons/interfaces/map-nav-buttons.interface';

import { ButtonSeverity } from 'primeng/button';
import { Store } from '@ngrx/store';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectWidgetData } from '@app/core/store/map/map.selectors';
import { MapActions } from '@app/core/store/map/map.actions';

/**
 * Componente: FloatingMapControlsComponent
 * ---------------------------------------
 * Barra flotante de controles del mapa (acercar, alejar, paneo, vista total),
 * pensada para Gobierno Mayor.
 *
 * Responsabilidades:
 * - Renderizar un **grupo de botones flotantes** reutilizando el widget
 *   `MapNavButtonsComponent`, pero entregando la configuración para cada acción
 *   como cuatro instancias independientes (zoom in, zoom out, pan, reset view).
 *
 * - Ajustar el layout según el **tamaño de pantalla** (mobile / desktop)
 *   escuchando `BreakpointObserver` para marcar `isSmallScreen`.
 *   Esa bandera la puede usar el template para cambiar clases, posición, etc.
 *
 * - Registrar en el **Store (NgRx)** la configuración inicial del widget de
 *   navegación (`MapNavButtons`) mediante la acción
 *   `MapActions.setWidgetNavButtonsData`, garantizando que existe estado base.
 *   Esto es importante porque otros componentes pueden leer esa config global
 *   (por ejemplo, para saber si el paneo está activo).
 *
 * Flujo general:
 * 1) En `ngOnInit()`:
 *    - Se evalúan breakpoints `XSmall` y `Small` para saber si estamos en vista móvil.
 *    - Se lee del Store (`userInterfaceStore`) la config del widget `MapNavButtons`.
 *      Cuando existe, se hace un "priming": se despacha al Store de mapa
 *      (`MapActions.setWidgetNavButtonsData`) con la config por defecto.
 *
 * 2) El template muestra los cuatro bloques de botones (`configZoomIn`,
 *    `configZoomOut`, `configPan`, `configResetView`) renderizando el mismo
 *    componente hijo pero con distintas props.
 *
 * 3) Al destruir el componente (`ngOnDestroy()`), se limpian las suscripciones
 *    usando `destroy$`.
 *
 * Notas clave:
 * - `DEFAULTS` define una base consistente para `MapNavButtonsInterface`.
 *   Luego usamos `cfg(...)` para clonar esa base y solo sobreescribir
 *   lo que cambia en cada botón.
 *
 * - Las clases como `icon-gm_acercar`, `icon-gm_alejar`, etc. vienen del
 *   set de íconos personalizado de Gobierno Mayor.
 *
 * - Este componente **no invoca lógica de mapa directamente**. Toda la
 *   interacción real (zoom, pan, reset) vive en `MapNavButtonsComponent`
 *   y en la capa de Store/acciones asociada.
 *
 * @author  Sergio Alonso Mariño Duque
 * @date    2025-10-31
 * @version 1.0.0
 */
@Component({
  selector: 'app-floating-map-controls',
  standalone: true,
  imports: [CommonModule, MapNavButtonsComponent],
  templateUrl: './floating-map-controls.component.html',
  styleUrl: './floating-map-controls.component.scss',
})
export class FloatingMapControlsComponent implements OnInit, OnDestroy {
  /**
   * Flag responsive:
   * - true  => Pantallas pequeñas (breakpoints XSmall / Small)
   * - false => Desktop / pantallas más amplias
   *
   * El template lo usa para decidir posiciones/clases del contenedor flotante.
   */
  isSmallScreen = false;

  /**
   * Subject que se emite en ngOnDestroy para cerrar TODAS las suscripciones
   * (patrón takeUntil).
   *
   * Evita fugas de memoria cuando el componente se desmonta.
   */
  private destroy$ = new Subject<void>();

  /**
   * DEFAULTS
   * --------
   * Config base completa que satisface la interfaz `MapNavButtonsInterface`.
   *
   * Esta config representa un estado "neutro": sin botones visibles, pero con
   * todos los campos obligatorios definidos para no romper el hijo.
   *
   * Notas:
   * - `buttomSeverity: 'primary'` → el rail/tema aplica el verde Gobierno Mayor.
   * - `rounded: false`, `variant: 'text'` → estilo plano/compacto.
   * - `initialCenter`, `initialZoom`, etc. definen el estado inicial del mapa,
   *    útil para `Reset View`.
   */
  private readonly DEFAULTS: MapNavButtonsInterface = {
    showZoomIn: false,
    showZoomOut: false,
    showAdvancedZoomIn: false,
    showAdvancedZoomOut: false,
    showResetView: false,
    showToggleMouseWheelZoom: false,
    showPan: false,
    isPanEnabled: false,
    initialCenter: [-74.08175, 4.60971], // Bogotá aprox (placeholder inicial)
    initialZoom: 5,
    isMouseWheelZoomEnabled: true,
    minZoom: 3,
    maxZoom: 19,
    orderZoomIn: 0,
    orderZoomOut: 0,
    orderAdvancedZoomIn: 0,
    orderAdvancedZoomOut: 0,
    orderResetView: 0,
    orderToggleMouseWheelZoom: 0,
    orderPan: 0,
    gapButtons: 0,
    buttomSeverity: 'primary' as ButtonSeverity,
    rounded: false,
    variant: 'text',
    customIconStyles: {},
    showHistory: false,
    orderHistoryBack: 0,
    orderHistoryNext: 0,
  };

  /**
   * cfg()
   * -----
   * Helper interno para construir configs específicas de botón
   * partiendo de DEFAULTS.
   *
   * @param partial Fragmento parcial que sobreescribe DEFAULTS.
   * @returns Config final lista para pasar al hijo `MapNavButtonsComponent`.
   *
   * Ejemplo de uso:
   *    this.cfg({ showAdvancedZoomIn: true })
   */
  private cfg(
    partial: Partial<MapNavButtonsInterface>
  ): MapNavButtonsInterface {
    return { ...this.DEFAULTS, ...partial };
  }

  // ===========================================================================
  // Configuraciones individuales por acción
  // Cada una de estas se le pasa como [config] (o equivalente) al hijo
  // ===========================================================================

  /**
   * configZoomIn
   * ------------
   * Botón para "acercar" (zoom in avanzado).
   *
   * - `showAdvancedZoomIn: true` → muestra el botón de zoom in custom.
   * - `orderAdvancedZoomIn: 1` → define el orden visual dentro de la columna.
   * - `customIconStyles.iconAdvancedZoomIn` → clase de icono personalizado.
   */
  configZoomIn: MapNavButtonsInterface = this.cfg({
    showAdvancedZoomIn: true,
    orderAdvancedZoomIn: 1,
    customIconStyles: { iconAdvancedZoomIn: 'icon-gm_acercar' },
  });

  /**
   * configZoomOut
   * -------------
   * Botón para "alejar" (zoom out avanzado).
   *
   * Similar al anterior pero con `showAdvancedZoomOut`.
   */
  configZoomOut: MapNavButtonsInterface = this.cfg({
    showAdvancedZoomOut: true,
    orderAdvancedZoomOut: 2,
    customIconStyles: { iconAdvancedZoomOut: 'icon-gm_alejar' },
  });

  /**
   * configPan
   * ---------
   * Botón para activar/desactivar el modo "paneo libre" del mapa.
   *
   * - `showPan: true` → pinta el botón de paneo.
   * - `isPanEnabled: false` → valor inicial (paneo desactivado).
   * - `iconPanEnabled` / `iconPanDisabled` → alternan según estado.
   *
   * Nota: La lógica de alternar el paneo (activar/desactivar, cambiar icono,
   * etc.) vive en el hijo / store, no aquí.
   */
  configPan: MapNavButtonsInterface = this.cfg({
    showPan: true,
    orderPan: 3,
    isPanEnabled: false,
    customIconStyles: {
      iconPanEnabled: 'pi pi-stop-circle',
      iconPanDisabled: 'icon-gm_panear',
    },
  });

  /**
   * configResetView
   * ---------------
   * Botón para volver a la vista inicial del visor:
   * - Centra en `initialCenter`
   * - Ajusta `initialZoom`
   *
   * - `showResetView: true` → muestra el botón.
   * - `customIconStyles.iconResetView` → ícono "vista total".
   */
  configResetView: MapNavButtonsInterface = this.cfg({
    showResetView: true,
    orderResetView: 4,
    customIconStyles: { iconResetView: 'icon-gm_vista_total' },
  });

  /**
   * @param bp BreakpointObserver
   *        Se usa para escuchar cuando la vista baja a tamaños Small/XSmall,
   *        y así poder aplicar estilos móviles.
   *
   * @param userInterfaceStore Store<{ userInterface: UserInterfaceState }>
   *        Store donde vive la info de UI (por ejemplo, config del widget).
   *
   * @param store Store<MapState>
   *        Store principal del mapa. Aquí se despachan las acciones
   *        relacionadas con el widget `MapNavButtons`.
   */
  constructor(
    private bp: BreakpointObserver,
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>,
    private store: Store<MapState>
  ) {}

  /**
   * ngOnInit()
   * ----------
   * 1. Suscribe a cambios de breakpoint (`XSmall`, `Small`) para mantener
   *    `isSmallScreen` sincronizado.
   *
   * 2. Hace un "priming" del estado global del widget de navegación:
   *    - Lee la configuración existente del widget 'MapNavButtons'
   *      en `userInterfaceStore`.
   *    - Cuando hay datos válidos, despacha `setWidgetNavButtonsData`
   *      hacia el store de mapa con `configZoomIn` como base inicial.
   *
   *    ¿Por qué `configZoomIn`?
   *    Porque es una config válida y completa que respeta la interfaz y
   *    activa al menos una acción (zoom in). Sirve como estado inicial común.
   */
  ngOnInit(): void {
    // 1) Responsive: actualiza flag isSmallScreen en tiempo real
    this.bp
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => (this.isSmallScreen = res.matches));

    // 2) Priming del widget en el Store
    this.userInterfaceStore
      .select(selectWidgetData('MapNavButtons'))
      .pipe(
        takeUntil(this.destroy$),
        // Solo seguimos si hay algo (cfg truthy) y además coincide con la interfaz
        filter((cfg): cfg is MapNavButtonsInterface => !!cfg),
        // Nos interesa una sola vez para inicializar
        take(1)
      )
      .subscribe(() => {
        this.store.dispatch(
          MapActions.setWidgetNavButtonsData({
            widgetId: 'MapNavButtons',
            data: this.configZoomIn,
          })
        );
      });
  }

  /**
   * ngOnDestroy()
   * -------------
   * Marca el observable `destroy$` como completo para cortar TODAS las
   * suscripciones que usan `takeUntil(this.destroy$)`.
   *
   * Esto previene memory leaks cuando el componente desaparece de la vista.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
