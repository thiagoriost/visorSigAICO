import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Subject } from 'rxjs';
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from '@angular/cdk/layout';

import { LayoutCComponent } from './layout-c.component';

// ------- Mock de BreakpointObserver -------
class MockBreakpointObserver {
  private subject = new Subject<BreakpointState>();

  observe(queries: string[] | string) {
    void queries; // evitar lint por arg no usado
    return this.subject.asObservable();
  }

  emit(matches: boolean) {
    const state: BreakpointState = {
      matches,
      breakpoints: {
        [Breakpoints.XSmall]: matches,
        [Breakpoints.Small]: matches,
      },
    };
    this.subject.next(state);
  }
}

describe('LayoutCComponent', () => {
  let fixture: ComponentFixture<LayoutCComponent>;
  let component: LayoutCComponent;
  let mockBp: MockBreakpointObserver;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutCComponent], // standalone
      providers: [
        MockBreakpointObserver,
        { provide: BreakpointObserver, useExisting: MockBreakpointObserver },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutCComponent);
    component = fixture.componentInstance;
    mockBp = TestBed.inject(MockBreakpointObserver);

    fixture.detectChanges(); // dispara ngOnInit (suscripción a breakpoints)
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe actualizar isSmallScreen y cerrar drawer cuando pantalla es pequeña', () => {
    component.showDrawerWithSidebar = true;
    mockBp.emit(true); // XSmall/Small => móvil
    expect(component.isSmallScreen).toBeTrue();
    expect(component.showDrawerWithSidebar).toBeFalse();
  });

  it('toggleDrawerWithSidebar debe alternar el drawer (modo compat)', () => {
    component.showDrawerWithSidebar = false;
    component.toggleDrawerWithSidebar();
    expect(component.showDrawerWithSidebar).toBeTrue();
    component.toggleDrawerWithSidebar();
    expect(component.showDrawerWithSidebar).toBeFalse();
  });

  it('toggleSidebar debe alternar el colapso del sidebar', () => {
    component.sidebarCollapsed = false;
    component.toggleSidebar();
    expect(component.sidebarCollapsed).toBeTrue();
    component.toggleSidebar();
    expect(component.sidebarCollapsed).toBeFalse();
  });

  it('helpers responsivos: desktop', () => {
    // Forzamos desktop
    mockBp.emit(false); // isSmallScreen=false
    component.isSmallScreen = false;

    // seteamos props de desktop
    component.sidebarWidth = 420;
    component.sidebarRightOffset = 24;
    component.sidebarTopGap = 16;
    component.sidebarBottomGap = 88;
    component.bottomSafeArea = 70;

    // getResponsiveSidebarWidth en desktop SIEMPRE usa sidebarWidth (no depende de collapsed)
    component.sidebarCollapsed = false;
    expect(component.getResponsiveSidebarWidth()).toBe('420px');

    component.sidebarCollapsed = true;
    // sigue devolviendo el ancho "lógico" del sidebar en desktop, no el rail
    expect(component.getResponsiveSidebarWidth()).toBe('420px');

    expect(component.getResponsiveRightOffset()).toBe('24px');
    expect(component.getResponsiveTopGap()).toBe('16px');
    expect(component.getResponsiveBottomGap()).toBe(String(88 + 70) + 'px');
  });

  it('helpers responsivos: móvil (compacto y expandido)', () => {
    mockBp.emit(true); // móvil
    component.isSmallScreen = true;

    // Config móvil base
    component.mobileSidebarWidthVW = 82;
    component.mobileSidebarMaxPx = 380;
    component.mobileRightOffset = 10;
    component.mobileTopGap = 12;
    component.mobileBottomGap = 72;
    component.bottomSafeArea = 70;

    // --- Compacto: TOC oculto ---
    component.tocHidden = true; // 🔑 compacta el ancho
    expect(component.getResponsiveSidebarWidth()).toBe('min(82vw, 380px)');
    expect(component.getResponsiveRightOffset()).toBe('10px');
    expect(component.getResponsiveTopGap()).toBe('12px');
    expect(component.getResponsiveBottomGap()).toBe(String(72 + 70) + 'px');

    // --- Expandido: TOC visible ---
    component.mobileSidebarExpandedWidthVW = 92;
    component.mobileSidebarExpandedMaxPx = 420;
    component.tocHidden = false; // 🔑 ancho expandido
    expect(component.getResponsiveSidebarWidth()).toBe('min(92vw, 420px)');
  });

  it('getSidebarWidthPx/getSidebarContentWidthPx (compat) deben respetar estado colapsado', () => {
    component.sidebarWidth = 420;
    component.sidebarRailWidth = 56;

    component.sidebarCollapsed = false;
    expect(component.getSidebarWidthPx()).toBe('420px');
    expect(component.getSidebarContentWidthPx()).toBe('420px');

    component.sidebarCollapsed = true;
    expect(component.getSidebarWidthPx()).toBe('56px');
    expect(component.getSidebarContentWidthPx()).toBe('56px');
  });

  describe('resize del sidebar (desktop)', () => {
    let addSpy: jasmine.Spy;
    let removeSpy: jasmine.Spy;

    let moveHandler!: (e: MouseEvent) => void;
    let upHandler!: (e: MouseEvent) => void;

    beforeEach(() => {
      mockBp.emit(false); // asegurar desktop
      component.isSmallScreen = false;
      component.enableResize = true; // 🔑 viene false por defecto, hay que activarlo para probar

      addSpy = spyOn(document, 'addEventListener').and.callFake(
        (type: string, handler: EventListenerOrEventListenerObject) => {
          if (type === 'mousemove') {
            moveHandler = handler as unknown as (e: MouseEvent) => void;
          }
          if (type === 'mouseup') {
            upHandler = handler as unknown as (e: MouseEvent) => void;
          }
        }
      );
      removeSpy = spyOn(document, 'removeEventListener').and.callThrough();
    });

    it('debe emitir sidebarWidthChange mientras se arrastra dentro de límites y finalizar en mouseup', () => {
      component.minSidebarWidth = 200;
      component.maxSidebarWidth = 800;
      component.sidebarWidth = 300;

      const emitSpy = spyOn(component.sidebarWidthChange, 'emit');

      const startEvent = new MouseEvent('mousedown', { clientX: 500 });
      spyOn(startEvent, 'preventDefault');
      component.startResize(startEvent);

      expect(component.isResizing).toBeTrue();
      expect(addSpy).toHaveBeenCalledWith('mousemove', jasmine.any(Function));
      expect(addSpy).toHaveBeenCalledWith('mouseup', jasmine.any(Function));

      // arrastre hacia la izquierda 20px -> deltaX = startX(500) - 480 = 20
      // newWidth = 300 + 20 = 320
      moveHandler(new MouseEvent('mousemove', { clientX: 480 }));
      expect(component.sidebarWidth).toBe(320);
      expect(emitSpy).toHaveBeenCalledWith(320);

      // finalizar
      upHandler(new MouseEvent('mouseup'));
      expect(component.isResizing).toBeFalse();
      expect(removeSpy).toHaveBeenCalledWith(
        'mousemove',
        jasmine.any(Function)
      );
      expect(removeSpy).toHaveBeenCalledWith('mouseup', jasmine.any(Function));
    });

    it('no debe salir de los límites min/max', () => {
      component.minSidebarWidth = 250;
      component.maxSidebarWidth = 260;
      component.sidebarWidth = 255;

      const emitSpy = spyOn(component.sidebarWidthChange, 'emit');

      const startEvent = new MouseEvent('mousedown', { clientX: 500 });
      spyOn(startEvent, 'preventDefault');
      component.startResize(startEvent);

      // intento reducir por debajo del mínimo:
      // clientX = 600 => deltaX = 500 - 600 = -100 => newWidth = 255 + (-100) = 155 (<250) => ignorado
      moveHandler(new MouseEvent('mousemove', { clientX: 600 }));
      expect(component.sidebarWidth).toBe(255);
      expect(emitSpy).not.toHaveBeenCalled();

      // dentro de rango:
      // clientX = 497 => deltaX = 500 - 497 = 3 => newWidth = 258 (entre 250 y 260)
      moveHandler(new MouseEvent('mousemove', { clientX: 497 }));
      expect(component.sidebarWidth).toBe(258);
      expect(emitSpy).toHaveBeenCalledWith(258);

      upHandler(new MouseEvent('mouseup'));
    });
  });
});
