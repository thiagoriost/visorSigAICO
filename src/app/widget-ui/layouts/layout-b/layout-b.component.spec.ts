import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutBComponent } from './layout-b.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subject } from 'rxjs';

/**
 * Mock del BreakpointObserver.
 * Nos permite emitir manualmente estados de breakpoints para probar el componente.
 */
class MockBreakpointObserver {
  private subject = new Subject<BreakpointState>();

  // Simula el método observe devolviendo el Subject como observable
  observe() {
    return this.subject.asObservable();
  }

  // Método auxiliar para emitir un estado manualmente
  emitState(state: BreakpointState) {
    this.subject.next(state);
  }

  // Método auxiliar para completar el Subject
  complete() {
    this.subject.complete();
  }
}

describe('LayoutBComponent', () => {
  let component: LayoutBComponent;
  let fixture: ComponentFixture<LayoutBComponent>;
  let mockObserver: MockBreakpointObserver;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutBComponent], // Importamos el componente standalone
      providers: [
        { provide: BreakpointObserver, useClass: MockBreakpointObserver },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutBComponent);
    component = fixture.componentInstance;
    mockObserver = TestBed.inject(
      BreakpointObserver
    ) as unknown as MockBreakpointObserver;
    fixture.detectChanges(); // Dispara la detección de cambios inicial
    console.log(mockObserver);
  });

  /**
   * Prueba 1: Verificar creación del componente
   */
  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Prueba 3: ngOnDestroy debe limpiar las suscripciones
   */
  it('debería llamar a next y complete en destroy$', () => {
    // Espiamos los métodos internos del Subject destroy$
    const spyNext = spyOn(component['destroy$'], 'next').and.callThrough();
    const spyComplete = spyOn(
      component['destroy$'],
      'complete'
    ).and.callThrough();

    // Llamamos al ciclo de vida ngOnDestroy
    component.ngOnDestroy();

    // Verificamos que se invocaron ambos
    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });

  /**
   * Prueba 4: Método onMinimized debe alternar el estado de isminimized
   */
  it('debería alternar isminimized al ejecutar onMinimized', () => {
    expect(component.isminimized).toBeFalse();
    component.onMinimized();
    expect(component.isminimized).toBeTrue();
    component.onMinimized();
    expect(component.isminimized).toBeFalse();
  });

  /**
   * Prueba 5: Método toggleDrawerWidSidebar debe alternar el estado de showDrawerWithSidebar
   */
  it('debería alternar showDrawerWithSidebar al ejecutar toggleDrawerWidSidebar', () => {
    expect(component.showDrawerWithSidebar).toBeFalse();
    component.toggleDrawerWidSidebar();
    expect(component.showDrawerWithSidebar).toBeTrue();
    component.toggleDrawerWidSidebar();
    expect(component.showDrawerWithSidebar).toBeFalse();
  });

  /**
   * Prueba 6: Método getSidebarWidthPx debe devolver un string con el ancho en px
   */
  it('debería devolver el ancho del sidebar en píxeles con getSidebarWidthPx', () => {
    component.sidebarWidth = 400;
    expect(component.getSidebarWidthPx()).toBe('400px');
  });

  /**
   * Prueba 7: Método getSidebarContentWidthPx debe devolver un string con el ancho -1 px
   */
  it('debería devolver el ancho del contenido del sidebar en píxeles con getSidebarContentWidthPx', () => {
    component.sidebarWidth = 400;
    expect(component.getSidebarContentWidthPx()).toBe('399px');
  });

  /**
   * Prueba 8: Método startResize debe permitir modificar el ancho del sidebar con el mouse
   */
  it('debería iniciar el redimensionamiento y actualizar el ancho del sidebar', () => {
    // Configuramos valores iniciales
    component.sidebarWidth = 360;
    const event = new MouseEvent('mousedown', { clientX: 100 });

    // Llamamos a startResize simulando click
    component.startResize(event);

    // Simulamos mover el mouse 50px a la derecha
    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 150 });
    document.dispatchEvent(mouseMoveEvent);

    // Debe haberse actualizado el ancho
    expect(component.sidebarWidth).toBe(410);

    // Simulamos soltar el mouse
    const mouseUpEvent = new MouseEvent('mouseup');
    document.dispatchEvent(mouseUpEvent);

    // isResizing debe ser false
    expect(component.isResizing).toBeFalse();
  });
});
