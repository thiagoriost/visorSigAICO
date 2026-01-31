import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import Map from 'ol/Map';
import { easeOut } from 'ol/easing';

import { MapState } from '@app/core/interfaces/store/map.model';
import { MapViewSnapshot } from '../../interfaces/map-history.interface';
import { MapActions } from '@app/core/store/map/map.actions';
import {
  selectHistory,
  selectHistoryPresent,
  selectCanGoBack,
  selectCanGoForward,
} from '@app/core/store/map/map.selectors';
import { MapService } from '@app/core/services/map-service/map.service';

/**
 * @description Servicio encargardo de realizar las acciones de navegación adelante y atras.
 * @author
 * javier.munoz@igac.gov.co
 * @version 1.0.0
 * @since 05/12/2025
 * @class MapHistoryService
 */
@Injectable({ providedIn: 'root' })
export class MapHistoryService implements OnDestroy {
  private map: Map | null = null;

  /** flags */
  private isRestoringHistory = false;
  private initialized = false;
  private active = true; // <<< permite desactivar el servicio

  /** timers y subscripción */
  private mapCheckTimer: ReturnType<typeof setTimeout> | null = null;
  private destroy$ = new Subject<void>();
  private moveEndSubject = new Subject<MapViewSnapshot>();

  /** Observables expuestos */
  canGoBack$!: Observable<boolean>;
  canGoForward$!: Observable<boolean>;
  history$!: Observable<MapState['history']>;
  currentSnapshot$!: Observable<MapViewSnapshot | null>;

  /** referencia del listener OL para removerlo */
  private moveEndHandlerRef: (() => void) | null = null;

  /**
   * Constructor del servicio de historial de mapa.
   *
   * Se encarga de inicializar los selectores de NGRX correspondientes al historial,
   * configurar los listeners reactivos para capturar eventos de navegación del mapa
   * (`moveend`) y sincronizar los cambios del snapshot actual mediante animaciones
   * sobre la vista del mapa.
   *
   * Además, difiere la inicialización del mapa mediante `waitForMap()` para garantizar
   * que el servicio pueda registrar los listeners una vez el mapa esté disponible
   * desde `MapService`.
   *
   * @param mapService Servicio encargado de exponer la instancia del mapa.
   * @param store Store global de NGRX donde se mantiene el historial de vistas del mapa.
   *
   * ### Procesos que maneja el constructor:
   * ---
   * #### 1. **Inicialización de selectores**
   * - `canGoBack$`: Indica si existe un snapshot previo en el historial.
   * - `canGoForward$`: Indica si existe un snapshot siguiente en el historial.
   * - `history$`: Flujo con todo el historial almacenado.
   * - `currentSnapshot$`: Snapshot actualmente seleccionado (estado presente).
   *
   * #### 2. **Suscripción al flujo de moveend (debounce de 120ms)**
   * Captura cambios reales de vista del mapa y evita registrar estados intermedios.
   * - No registra snapshot si:
   *   - el servicio está inactivo (`active === false`)
   *   - se está restaurando historial (`isRestoringHistory === true`)
   *
   * #### 3. **Animación automática al cambiar el snapshot actual**
   * Cuando `currentSnapshot$` emite un nuevo valor:
   * - Se ejecuta `view.animate()` para mover la vista a:
   *   - `center`
   *   - `zoom`
   *   - `rotation`
   * - Marca temporalmente `isRestoringHistory = true` para evitar capturar snapshots
   *   durante la animación.
   *
   * #### 4. **Búsqueda diferida del mapa**
   * Mediante `setTimeout(..., 0)` se invoca `waitForMap()` para registrar listeners
   * cuando el mapa haya sido cargado por MapService.
   */
  constructor(
    private readonly mapService: MapService,
    private readonly store: Store<Readonly<MapState>>
  ) {
    // Inicializar selectores
    this.canGoBack$ = this.store.select(selectCanGoBack);
    this.canGoForward$ = this.store.select(selectCanGoForward);
    this.history$ = this.store.select(selectHistory);
    this.currentSnapshot$ = this.store.select(selectHistoryPresent);

    // Debounce en moveend
    this.moveEndSubject
      .pipe(debounceTime(120), takeUntil(this.destroy$))
      .subscribe(snapshot => {
        if (!this.active) return;
        if (this.isRestoringHistory) return;
        this.addSnapshot(snapshot);
      });

    // Cuando cambie el snapshot actual => animar
    this.currentSnapshot$.pipe(takeUntil(this.destroy$)).subscribe(snapshot => {
      if (!this.active) return;
      if (!snapshot || !this.map) return;

      const view = this.map.getView();
      this.isRestoringHistory = true;

      view.animate(
        {
          center: snapshot.center,
          zoom: snapshot.zoom,
          rotation: snapshot.rotation,
          duration: 600,
          easing: easeOut,
        },
        () => {
          Promise.resolve().then(() => (this.isRestoringHistory = false));
        }
      );
    });

    // Buscar el mapa
    setTimeout(() => this.waitForMap(), 0);
  }

  /**
   * Desactiva el servicio de historial de mapa y limpia todos los recursos asociados.
   *
   * Este método marca el servicio como inactivo, finaliza el flujo utilizado para
   * manejar los eventos `moveend` (evitando que se sigan registrando snapshots) y
   * además elimina el listener asociado al evento `moveend` en la instancia del mapa.
   *
   * Se utiliza principalmente cuando se requiere pausar o detener el seguimiento
   * del historial, por ejemplo, durante procesos internos del visor que no deben
   * generar entradas en el historial.
   *
   * ### Acciones realizadas:
   * ---
   * 1. **Desactiva el servicio**
   *    - `active = false` → garantiza que no se procesen nuevos snapshots.
   *
   * 2. **Completa el flujo debounce de moveend**
   *    - `moveEndSubject.complete()` detiene la emisión futura de eventos
   *      relacionados con cambios en la vista del mapa.
   *
   * 3. **Cancela el listener registrado en el mapa**
   *    - Verifica que tanto `map` como `moveEndHandlerRef` existan.
   *    - Intenta remover el listener con `.un('moveend', handler)`.
   *    - En caso de error, muestra una advertencia sin romper la ejecución.
   *
   * Esta limpieza evita fugas de memoria y asegura que la funcionalidad del
   * historial quede completamente suspendida hasta que el servicio sea
   * reactivado o reinstanciado.
   */
  setInactivateService(): void {
    this.active = false;

    // limpiar debounce
    this.moveEndSubject.complete();

    // cancelar listeners
    if (this.map && this.moveEndHandlerRef) {
      try {
        this.map.un('moveend', this.moveEndHandlerRef);
      } catch {
        console.warn('Error al cancelar listeners');
      }
    }
  }

  /**
   * Agrega una nueva entrada al historial del mapa.
   *
   * Este método recibe un `MapViewSnapshot` que contiene el estado actual
   * de la vista del mapa (centro, zoom, rotación y timestamp) y lo envía
   * al store para que sea registrado dentro del historial de navegación.
   *
   * ### Comportamiento:
   * ---
   * - Si el servicio está inactivo (`active = false`), no realiza ninguna acción.
   * - Si está activo, despacha la acción `addHistoryEntry` con el snapshot recibido.
   *
   * ### Parámetros:
   * @param snapshot Estado actual de la vista del mapa, incluyendo:
   *   - `center: [number, number]`
   *   - `zoom: number`
   *   - `rotation: number`
   *   - `timestamp: number`
   *
   * ### Notas:
   * - Este método no valida los valores del snapshot; se asume que ya fueron
   *   verificados antes de su invocación.
   * - Es utilizado principalmente por el evento `moveend` después del debounce
   *   y por otras funciones internas que deseen registrar un estado del mapa.
   */
  addSnapshot(snapshot: MapViewSnapshot): void {
    if (!this.active) return;
    this.store.dispatch(MapActions.addHistoryEntry({ snapshot }));
  }

  /**
   * Retrocede al snapshot anterior en el historial de vista del mapa.
   *
   * Este método envía la acción `goBackView` al store, lo que provoca
   * que el estado del historial navegue hacia atrás (si existe un snapshot previo).
   *
   * ### Comportamiento:
   * - Si el servicio está inactivo (`active = false`), no ejecuta ninguna acción.
   * - Si está activo, despacha la acción que solicita al reducer mover
   *   el cursor del historial una posición hacia atrás.
   *
   * ### Notas:
   * - No verifica si realmente se puede retroceder; esa validación la realiza
   *   el selector `selectCanGoBack` desde el store.
   * - Es utilizado típicamente por botones de navegación en la UI.
   */
  goBack(): void {
    if (!this.active) return;
    this.store.dispatch(MapActions.goBackView());
  }

  /**
   * Avanza al siguiente estado de la vista del mapa dentro del historial.
   *
   * Este método verifica si el servicio está activo antes de despachar
   * la acción correspondiente al store. Si el historial cuenta con una vista
   * posterior disponible, NGRX actualizará el estado del mapa a dicha vista.
   *
   * @returns void
   */
  goForward(): void {
    if (!this.active) return;
    this.store.dispatch(MapActions.goForwardView());
  }

  /**
   * Limpia por completo el historial de vistas del mapa.
   *
   * Este método verifica si el servicio está activo antes de despachar
   * la acción que elimina todas las entradas del historial en el store.
   * Una vez ejecutado, no quedarán vistas anteriores o posteriores disponibles.
   *
   * @returns void
   */
  clear(): void {
    if (!this.active) return;
    this.store.dispatch(MapActions.clearHistoryView());
  }

  /**
   * Espera de forma recursiva hasta que el mapa esté disponible.
   *
   * Este método verifica si el servicio ya fue inicializado; si no, intenta obtener
   * la instancia del mapa desde `mapService`.
   *
   * - Si el mapa ya está disponible, lo asigna internamente, marca el servicio como
   *   inicializado y registra el listener para el evento `moveend`.
   * - Si aún no está disponible, programa un nuevo intento utilizando `setTimeout`,
   *   repitiendo el proceso cada 50 ms hasta que el mapa sea accesible.
   *
   * Este enfoque evita errores de inicialización en escenarios donde la creación
   * del mapa no es inmediata.
   *
   * @private
   * @returns void
   */
  private waitForMap(): void {
    if (this.initialized) return;

    const map = this.mapService.getMap();
    if (map) {
      this.map = map;
      this.initialized = true;
      this.registerMoveEnd(map);
      return;
    }

    this.mapCheckTimer = setTimeout(() => this.waitForMap(), 50);
  }

  /**
   * Registra el listener del evento `moveend` del mapa para generar snapshots
   * automáticos del estado de la vista.
   *
   * Este método crea un manejador que:
   * - Ignora eventos si el servicio está inactivo.
   * - Evita registrar estados mientras se está restaurando el historial,
   *   para no generar entradas no deseadas.
   * - Obtiene los valores actuales de la vista del mapa (`center`, `zoom`, `rotation`).
   * - Valida que los datos sean correctos antes de crear el `MapViewSnapshot`.
   * - Emite el snapshot mediante `moveEndSubject` para su posterior
   *   procesamiento con debounce.
   *
   * El manejador se almacena en `moveEndHandlerRef` para permitir su posterior
   * eliminación durante la destrucción del servicio.
   *
   * @private
   * @param {Map} map - Instancia del mapa en la cual se registrará el listener.
   * @returns void
   */
  private registerMoveEnd(map: Map): void {
    const handler = () => {
      if (!this.active) return;
      if (this.isRestoringHistory) return;

      const view = map.getView();
      const center = view.getCenter();
      const zoom = view.getZoom();
      const rotation = view.getRotation();
      if (!center || zoom == null) return;

      const snapshot: MapViewSnapshot = {
        center: [...center] as [number, number],
        zoom,
        rotation,
        timestamp: Date.now(),
      };

      this.moveEndSubject.next(snapshot);
    };

    this.moveEndHandlerRef = handler;
    map.on('moveend', handler);
  }

  /**
   * Ciclo de vida de Angular que se ejecuta cuando el servicio es destruido.
   *
   * Libera todos los recursos asociados para prevenir fugas de memoria:
   *
   * - Desactiva el servicio estableciendo `active = false`.
   * - Limpia el temporizador usado para esperar la inicialización del mapa (`mapCheckTimer`).
   * - Emite y completa el observable `destroy$` para cancelar todas las suscripciones internas.
   * - Elimina el listener del evento `moveend` del mapa, si existe.
   *
   * Este método garantiza que no queden listeners, timers, ni suscripciones activas
   * cuando el servicio deja de existir.
   *
   * @returns {void}
   */
  ngOnDestroy(): void {
    this.active = false;

    if (this.mapCheckTimer) {
      clearTimeout(this.mapCheckTimer);
    }

    this.destroy$.next();
    this.destroy$.complete();

    if (this.map && this.moveEndHandlerRef) {
      try {
        this.map.un('moveend', this.moveEndHandlerRef);
      } catch {
        console.warn('Error al destryur moveend');
      }
    }
  }
}
