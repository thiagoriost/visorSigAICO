import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flushMicrotasks,
  tick,
} from '@angular/core/testing';
import { FloatingWindowComponent } from './floating-window.component';
import { FloatingWindowHeaderComponent } from '@app/widget-ui/components/floating-window/components/floating-window-header/floating-window-header.component';
import { FloatingWindowResizeComponent } from '@app/widget-ui/components/floating-window/components/floating-window-resize/floating-window-resize.component';
import { ButtonModule } from 'primeng/button';
import { Store } from '@ngrx/store';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import {
  FloatingWindowConfig,
  FloatingWindowState,
} from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import {
  bringFloatingWindowToFront,
  removeFloatingWindow,
} from '@app/core/store/user-interface/user-interface.actions';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  userInterfaceReducer,
  initialUserInterfaceState,
} from '@app/core/store/user-interface/user-interface.reducer';

/**
 * Helper para acceder a propiedades privadas de forma tipada sin usar `any`.
 * Se utiliza solo en pruebas para inspeccionar `_state`, `idFw`, etc.
 */
function getPrivate<T>(obj: unknown): T {
  return obj as T;
}

describe('FloatingWindowComponent (lint-clean, no any)', () => {
  let fixture: ComponentFixture<FloatingWindowComponent>;
  let component: FloatingWindowComponent;
  let mockStore: { select: jasmine.Spy; dispatch: jasmine.Spy };
  let zIndexSubject: Subject<number>;

  const defaultConfig: FloatingWindowConfig = {
    x: 200,
    y: 200,
    width: 350,
    height: 450,
    enableMinimize: true,
    enableResize: true,
    enableClose: true,
    enableDrag: true,
  };

  // Helper: crea un DOMRect-like para getBoundingClientRect
  const createRectMock = (
    left: number,
    top: number,
    width: number,
    height: number
  ) =>
    ({
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height,
      x: left,
      y: top,
      toJSON: () => ({
        left,
        top,
        right: left + width,
        bottom: top + height,
        width,
        height,
      }),
    }) as DOMRect;

  beforeEach(async () => {
    zIndexSubject = new Subject<number>();

    mockStore = {
      select: jasmine
        .createSpy('select')
        .and.callFake((selectorFn: unknown) => {
          // El componente invoca store.select(selectZIndexForWindow(this.idFw))
          // Respondemos con un observable controlable (Subject) para emitir valores en tests
          console.log(selectorFn);
          return zIndexSubject.asObservable();
        }),
      dispatch: jasmine.createSpy('dispatch'),
    };

    // No usar spy sobre generarIdFloatingWindow aquí, queremos verificar comportamiento real
    await TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        FloatingWindowHeaderComponent,
        FloatingWindowResizeComponent,
        FloatingWindowComponent,
      ],
      providers: [{ provide: Store, useValue: mockStore }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingWindowComponent);
    component = fixture.componentInstance;

    component.widgetFloatingWindowConfig = { ...defaultConfig };
    component.titulo = 'Prueba ventana';

    fixture.detectChanges(); // ngOnInit
  });

  afterEach(() => {
    try {
      zIndexSubject.complete();
    } catch {
      // intentionally empty - cerrar subject si está abierto
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate idFw (private) and dispatch bringFloatingWindowToFront on init', () => {
    const priv = getPrivate<{ idFw: string }>(component);
    expect(priv.idFw).toBeTruthy();
    expect(mockStore.dispatch).toHaveBeenCalled();
    const dispatched = mockStore.dispatch.calls.mostRecent().args[0];
    expect(dispatched.type).toBe(
      bringFloatingWindowToFront({ id: priv.idFw }).type
    );
  });

  it('should subscribe to zIndex selector and update zIndex on emissions', fakeAsync(() => {
    expect(typeof component.zIndex).toBe('number');

    zIndexSubject.next(2000);
    flushMicrotasks();
    expect(component.zIndex).toBe(2000);

    zIndexSubject.next(1500);
    flushMicrotasks();
    expect(component.zIndex).toBe(1500);
  }));

  it('bringToFront() should dispatch action with generated id', () => {
    mockStore.dispatch.calls.reset();
    const priv = getPrivate<{ idFw: string }>(component);
    component.bringToFront();
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      bringFloatingWindowToFront({ id: priv.idFw })
    );
  });

  it('closeWindow() should emit closeWindowEvent', () => {
    const spyEmit = spyOn(component.closeWindowEvent, 'emit');
    component.closeWindow();
    expect(spyEmit).toHaveBeenCalled();
  });

  it('updateStateFromConfig should not override state when dragging/resizing flags true', () => {
    const privState = getPrivate<{ _state: FloatingWindowState }>(
      component
    )._state;
    // set dragging true
    privState.isDragging = true;
    const oldX = privState.x;
    // change config
    component.widgetFloatingWindowConfig = { ...defaultConfig, x: 10, y: 20 };
    // call private method via helper
    getPrivate<{ updateStateFromConfig: () => void }>(
      component
    ).updateStateFromConfig();
    // value should remain since isDragging = true
    expect(
      getPrivate<{ _state: FloatingWindowState }>(component)._state.x
    ).toBe(oldX);

    // unset dragging and update
    getPrivate<{ _state: FloatingWindowState }>(component)._state.isDragging =
      false;
    getPrivate<{ updateStateFromConfig: () => void }>(
      component
    ).updateStateFromConfig();
    expect(
      getPrivate<{ _state: FloatingWindowState }>(component)._state.x
    ).toBe(10);
    expect(
      getPrivate<{ _state: FloatingWindowState }>(component)._state.y
    ).toBe(20);
  });

  it('updateContainerLimits handles missing map element gracefully', () => {
    spyOn(component['document'], 'getElementById').and.returnValue(null);
    expect(() =>
      getPrivate<{ updateContainerLimits: () => void }>(
        component
      ).updateContainerLimits()
    ).not.toThrow();
  });

  it('updateContainerLimits computes limits and clamps state properly', () => {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';

    const rect = createRectMock(5, 10, 800, 600);

    spyOn(component['document'], 'getElementById').and.returnValue(
      mapContainer
    );
    spyOn(mapContainer, 'getBoundingClientRect').and.returnValue(rect);

    // Force state to values exceeding container
    const stateRef = getPrivate<{ _state: FloatingWindowState }>(
      component
    )._state;
    stateRef.x = 10000;
    stateRef.y = 10000;
    stateRef.width = 10000;
    stateRef.height = 10000;

    getPrivate<{ updateContainerLimits: () => void }>(
      component
    ).updateContainerLimits();

    const st = getPrivate<{ _state: FloatingWindowState }>(component)._state;

    expect(st.width).toBeLessThanOrEqual(rect.width);
    expect(st.height).toBeLessThanOrEqual(rect.height);

    const maxX = st.rightLimit - st.width;
    const maxY = st.bottomLimit - st.height;

    expect(st.x).toBeGreaterThanOrEqual(st.leftLimit);
    expect(st.x).toBeLessThanOrEqual(maxX);
    expect(st.y).toBeGreaterThanOrEqual(st.topLimit);
    expect(st.y).toBeLessThanOrEqual(maxY);
  });

  it('setupResizeListener updates limits after debounce on window resize (fakeAsync)', fakeAsync(() => {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'map';

    const rect1 = createRectMock(0, 0, 1000, 800);
    const rect2 = createRectMock(0, 0, 1200, 1000);

    spyOn(component['document'], 'getElementById').and.returnValue(
      mapContainer
    );
    spyOn(mapContainer, 'getBoundingClientRect').and.returnValues(rect1, rect2);

    getPrivate<{ setupResizeListener: () => void }>(
      component
    ).setupResizeListener();

    window.dispatchEvent(new Event('resize'));
    tick(250);

    const st = getPrivate<{ _state: FloatingWindowState }>(component)._state;

    expect(st.rightLimit).toBe(rect2.width);
    expect(st.bottomLimit).toBe(rect2.height);

    getPrivate<{ resizeSubscription: { unsubscribe: () => void } }>(
      component
    ).resizeSubscription.unsubscribe();
  }));

  it('template mousedown triggers bringToFront()', () => {
    spyOn(component, 'bringToFront').and.callThrough();
    const el = fixture.debugElement.query(By.css('.floating-window'));
    expect(el).toBeTruthy();
    el.triggerEventHandler('mousedown', new MouseEvent('mousedown'));
    fixture.detectChanges();
    expect(component.bringToFront).toHaveBeenCalled();
  });

  it('template height equals tamanoCabecera when isMinimized true', () => {
    getPrivate<{ _state: FloatingWindowState }>(component)._state.isMinimized =
      true;
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.floating-window'))
      .nativeElement as HTMLElement;
    expect(el.style.height).toBe(`${component.tamanoCabecera}px`);
  });

  it('generarIdFloatingWindow returns string starting with fw-', () => {
    // call private method directly via helper to assert format
    const id = getPrivate<{ generarIdFloatingWindow: () => string }>(
      component
    ).generarIdFloatingWindow();
    expect(typeof id).toBe('string');
    expect(id.startsWith('fw-')).toBeTrue();
    expect(id.length).toBeGreaterThan(3);
  });

  it('ngOnDestroy should remove window from store', () => {
    getPrivate<{ isRegistered: boolean }>(component).isRegistered = true;
    mockStore.dispatch.calls.reset();

    component.ngOnDestroy();

    const idFw = getPrivate<{ idFw: string }>(component).idFw;
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      removeFloatingWindow({ id: idFw })
    );
  });

  describe('Floating Windows Reducer - Memory Leak Detection', () => {
    it('should remove window id on destroy and prevent memory leak', () => {
      const id = 'fw-123';

      let state = userInterfaceReducer(
        initialUserInterfaceState,
        bringFloatingWindowToFront({ id })
      );
      expect(state.floatingWindowsOrder).toContain(id);

      state = userInterfaceReducer(state, removeFloatingWindow({ id }));

      expect(state.floatingWindowsOrder).not.toContain(id);
      expect(state.floatingWindowsOrder.length).toBe(0);
    });
  });
});
