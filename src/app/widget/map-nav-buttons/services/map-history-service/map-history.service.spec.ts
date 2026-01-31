import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MapHistoryService } from './map-history.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { MapActions } from '@app/core/store/map/map.actions';
import { MapViewSnapshot } from '../../interfaces/map-history.interface';

/***********************************************************************
 * MOCK TIPADO DE View
 **********************************************************************/
interface MockView {
  getCenter(): [number, number];
  getZoom(): number;
  getRotation(): number;
  animate?: (...args: unknown[]) => void;
}

/***********************************************************************
 * MOCK TIPADO DE MAP
 **********************************************************************/
interface MockMap {
  getView(): MockView;
  on(event: string, handler: () => void): void;
  un(event: string, handler: () => void): void;
  trigger?(event: string): void; // Solo para pruebas
}

/***********************************************************************
 * IMPLEMENTACIÓN DEL MOCK DE MAP
 **********************************************************************/
class MapMock implements MockMap {
  private handlers: Record<string, (() => void)[]> = {};

  constructor(private view: MockView) {}

  getView(): MockView {
    return this.view;
  }

  on(event: string, handler: () => void): void {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  un(event: string, handler: () => void): void {
    if (!this.handlers[event]) return;
    this.handlers[event] = this.handlers[event].filter(h => h !== handler);
  }

  trigger(event: string): void {
    if (this.handlers[event]) {
      this.handlers[event].forEach(h => h());
    }
  }
}

/***********************************************************************
 * MOCK STORE TIPADO
 **********************************************************************/
class StoreMock {
  dispatchSpy = jasmine.createSpy('dispatch');

  select<T>(): unknown {
    return of(null as T);
  }

  dispatch(action: unknown): void {
    this.dispatchSpy(action);
  }
}

/***********************************************************************
 * MOCK MapService TIPADO
 **********************************************************************/
class MapServiceMock {
  private map: MockMap | null = null;

  setMap(map: MockMap): void {
    this.map = map;
  }

  getMap(): MockMap | null {
    return this.map;
  }
}

/***********************************************************************
 * SPEC
 **********************************************************************/
describe('MapHistoryService', () => {
  let service: MapHistoryService;
  let store: StoreMock;
  let mapService: MapServiceMock;

  let viewMock: MockView;
  let mapMock: MapMock;

  beforeEach(() => {
    viewMock = {
      getCenter: () => [0, 0],
      getZoom: () => 10,
      getRotation: () => 0,
      animate: () => {
        console.log('animate');
      },
    };

    mapMock = new MapMock(viewMock);

    store = new StoreMock();
    mapService = new MapServiceMock();

    TestBed.configureTestingModule({
      providers: [
        MapHistoryService,
        { provide: Store, useValue: store },
        { provide: MapService, useValue: mapService },
      ],
    });

    service = TestBed.inject(MapHistoryService);
  });

  /*********************************************************************
   * 1. Inicializa y registra moveend
   *********************************************************************/
  it('Debe registrar listener moveend al inicializar', fakeAsync(() => {
    const spyOnMethod = spyOn(mapMock, 'on').and.callThrough();

    mapService.setMap(mapMock);

    // Forzamos la búsqueda/registro del mapa (evita depender de timeouts)
    (service as unknown as { waitForMap(): void }).waitForMap();

    // Ahora debe haber sido llamado
    expect(spyOnMethod).toHaveBeenCalled();
  }));

  /*********************************************************************
   * 2. Debe agregar snapshot al disparar moveend
   *********************************************************************/
  it('Debe agregar snapshot al evento moveend', fakeAsync(() => {
    const addSnapshotSpy = spyOn(
      service as unknown as {
        addSnapshot(snapshot: MapViewSnapshot): void;
      },
      'addSnapshot'
    );

    mapService.setMap(mapMock);

    // Forzamos la búsqueda/registro del mapa
    (service as unknown as { waitForMap(): void }).waitForMap();

    // Simulamos el evento OL
    mapMock.trigger('moveend');

    // Avanzamos tiempo para cubrir debounceTime(120)
    tick(150);

    expect(addSnapshotSpy).toHaveBeenCalled();
  }));

  /*********************************************************************
   * 3. No debe agregar snapshot cuando isRestoringHistory = true
   *********************************************************************/
  it('No debe agregar snapshot si se está restaurando historial', fakeAsync(() => {
    mapService.setMap(mapMock);
    (service as unknown as { waitForMap(): void }).waitForMap();

    (service as unknown as { isRestoringHistory: boolean }).isRestoringHistory =
      true;

    const spyAdd = spyOn(
      service as unknown as {
        addSnapshot(snapshot: MapViewSnapshot): void;
      },
      'addSnapshot'
    );

    mapMock.trigger('moveend');
    tick(150);

    expect(spyAdd).not.toHaveBeenCalled();
  }));

  /*********************************************************************
   * 4. No debe agregar snapshot si el servicio está inactivo
   *********************************************************************/
  it('No debe agregar snapshot si el servicio está inactivo', fakeAsync(() => {
    mapService.setMap(mapMock);
    (service as unknown as { waitForMap(): void }).waitForMap();

    service.setInactivateService();

    const spyAdd = spyOn(
      service as unknown as {
        addSnapshot(snapshot: MapViewSnapshot): void;
      },
      'addSnapshot'
    );

    mapMock.trigger('moveend');
    tick(150);

    expect(spyAdd).not.toHaveBeenCalled();
  }));

  /*********************************************************************
   * 5. Acciones goBack / goForward / clear
   *********************************************************************/
  it('Debe despachar goBack', () => {
    service.goBack();
    expect(store.dispatchSpy).toHaveBeenCalledWith(MapActions.goBackView());
  });

  it('Debe despachar goForward', () => {
    service.goForward();
    expect(store.dispatchSpy).toHaveBeenCalledWith(MapActions.goForwardView());
  });

  it('Debe despachar clear', () => {
    service.clear();
    expect(store.dispatchSpy).toHaveBeenCalledWith(
      MapActions.clearHistoryView()
    );
  });

  /*********************************************************************
   * 6. Debe remover listeners con setInactivateService
   *********************************************************************/
  it('Debe remover listener moveend al desactivar servicio', fakeAsync(() => {
    const spyUn = spyOn(mapMock, 'un').and.callThrough();

    mapService.setMap(mapMock);
    (service as unknown as { waitForMap(): void }).waitForMap();

    service.setInactivateService();

    expect(spyUn).toHaveBeenCalled();
  }));

  /*********************************************************************
   * 7. ngOnDestroy debe liberar memoria
   *********************************************************************/
  it('ngOnDestroy debe limpiar destroy$ y listeners', fakeAsync(() => {
    const spyUn = spyOn(mapMock, 'un').and.callThrough();

    mapService.setMap(mapMock);
    (service as unknown as { waitForMap(): void }).waitForMap();

    const spyNext = spyOn(service['destroy$'], 'next').and.callThrough();
    const spyComplete = spyOn(
      service['destroy$'],
      'complete'
    ).and.callThrough();

    service.ngOnDestroy();

    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
    expect(spyUn).toHaveBeenCalled();
  }));

  it('No debe volver a inicializar si initialized = true', () => {
    const spyRegister = spyOn(mapMock, 'on').and.callThrough();

    mapService.setMap(mapMock);

    // Primera inicialización
    (service as unknown as { waitForMap(): void }).waitForMap();

    expect(spyRegister).toHaveBeenCalledTimes(1);

    // Segunda llamada NO debe registrar nada
    (service as unknown as { waitForMap(): void }).waitForMap();

    expect(spyRegister).toHaveBeenCalledTimes(1);
  });

  it('No debe enviar snapshot cuando center es null', fakeAsync(() => {
    const viewBad = {
      getCenter: () => null as unknown as [number, number], // ← centro inválido
      getZoom: () => 5,
      getRotation: () => 0,
    };

    const badMap = new MapMock(viewBad);

    mapService.setMap(badMap);
    (service as unknown as { waitForMap(): void }).waitForMap();

    const spyAdd = spyOn(
      service as unknown as {
        addSnapshot(snapshot: MapViewSnapshot): void;
      },
      'addSnapshot'
    );

    badMap.trigger('moveend');
    tick(150);

    expect(spyAdd).not.toHaveBeenCalled();
  }));

  it('No debe enviar snapshot cuando zoom es null', fakeAsync(() => {
    const viewBad = {
      getCenter: () => [10, 20] as [number, number],
      getZoom: () => null as unknown as number, // ← zoom inválido
      getRotation: () => 0,
    };

    const badMap = new MapMock(viewBad);

    mapService.setMap(badMap);
    (service as unknown as { waitForMap(): void }).waitForMap();

    const spyAdd = spyOn(
      service as unknown as {
        addSnapshot(snapshot: MapViewSnapshot): void;
      },
      'addSnapshot'
    );

    badMap.trigger('moveend');
    tick(150);

    expect(spyAdd).not.toHaveBeenCalled();
  }));

  it('setInactivateService debe completar moveEndSubject y evitar addSnapshot', fakeAsync(() => {
    const completeSpy = spyOn(
      service['moveEndSubject'],
      'complete'
    ).and.callThrough();

    mapService.setMap(mapMock);
    (service as unknown as { waitForMap(): void }).waitForMap();

    const addSpy = spyOn(
      service as unknown as {
        addSnapshot(snapshot: MapViewSnapshot): void;
      },
      'addSnapshot'
    );

    service.setInactivateService();

    expect(completeSpy).toHaveBeenCalled();

    // Incluso si ocurre moveend NO debe agregar snapshot
    mapMock.trigger('moveend');
    tick(150);

    expect(addSpy).not.toHaveBeenCalled();
  }));
});
