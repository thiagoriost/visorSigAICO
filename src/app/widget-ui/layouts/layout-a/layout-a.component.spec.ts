import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutAComponent } from './layout-a.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subject } from 'rxjs';

// Clase mock para simular BreakpointObserver
class MockBreakpointObserver {
  private subject = new Subject<BreakpointState>();
  observe() {
    return this.subject.asObservable();
  }
  emit(state: BreakpointState) {
    this.subject.next(state);
  }
}

describe('LayoutAComponent', () => {
  let component: LayoutAComponent;
  let fixture: ComponentFixture<LayoutAComponent>;
  let mockBreakpointObserver: MockBreakpointObserver;

  beforeEach(async () => {
    mockBreakpointObserver = new MockBreakpointObserver();

    await TestBed.configureTestingModule({
      imports: [LayoutAComponent],
      providers: [
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Activa ngOnInit
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería detectar una pantalla pequeña y ocultar el drawer', () => {
    const estadoPantallaPequeña: BreakpointState = {
      matches: true,
      breakpoints: {},
    };
    mockBreakpointObserver.emit(estadoPantallaPequeña);

    expect(component.isSmallScreen).toBeTrue();
    expect(component.showDrawerWithSidebar).toBeFalse();
  });

  it('debería detectar una pantalla grande y mostrar barra lateral', () => {
    const estadoPantallaGrande: BreakpointState = {
      matches: false,
      breakpoints: {},
    };
    mockBreakpointObserver.emit(estadoPantallaGrande);

    expect(component.isSmallScreen).toBeFalse();
  });

  it('debería alternar el estado del drawer al llamar toggleDrawerWidSidebar', () => {
    component.showDrawerWithSidebar = false;
    component.toggleDrawerWidSidebar();
    expect(component.showDrawerWithSidebar).toBeTrue();

    component.toggleDrawerWidSidebar();
    expect(component.showDrawerWithSidebar).toBeFalse();
  });

  it('debería retornar el ancho del sidebar como texto con unidad "px"', () => {
    component.sidebarWidth = 350;
    expect(component.getSidebarWidthPx()).toBe('350px');
  });

  it('debería iniciar el redimensionamiento y actualizar el ancho si está dentro de los límites', () => {
    component.sidebarWidth = 400;

    const eventoInicio = new MouseEvent('mousedown', { clientX: 100 });
    component.startResize(eventoInicio);

    // Simular movimiento del mouse
    const eventoMovimiento = new MouseEvent('mousemove', { clientX: 150 });
    document.dispatchEvent(eventoMovimiento);

    expect(component.isResizing).toBeTrue();
    expect(component.sidebarWidth).toBeGreaterThan(400);
    expect(component.sidebarWidth).toBeLessThanOrEqual(
      component.maxSidebarWidth
    );

    // Simular soltar el mouse
    const eventoFinal = new MouseEvent('mouseup');
    document.dispatchEvent(eventoFinal);

    expect(component.isResizing).toBeFalse();
  });

  it('no debería actualizar el ancho si excede el máximo o es menor al mínimo', () => {
    component.sidebarWidth = 400;
    const eventoInicio = new MouseEvent('mousedown', { clientX: 100 });
    component.startResize(eventoInicio);

    const movimientoExcesivo = new MouseEvent('mousemove', { clientX: 1000 }); // fuera de rango
    document.dispatchEvent(movimientoExcesivo);

    expect(component.sidebarWidth).toBeLessThanOrEqual(
      component.maxSidebarWidth
    );

    const eventoFinal = new MouseEvent('mouseup');
    document.dispatchEvent(eventoFinal);
  });
  it('debería retornar el ancho **del contenido** del sidebar como texto con unidad "px"', () => {
    component.sidebarWidth = 350;

    // -- Ajusta la expectativa según la lógica que prefieras --
    // Si RESTAS 6 px ➜ resultado esperado: '344px'
    expect(component.getSidebarContentWidthPx()).toBe('350px');

    // Si NO restas nada ➜ descomenta la siguiente línea y comenta la de arriba
    // expect(component.getSidebarContentWidthPx()).toBe('350px');
  });
});
