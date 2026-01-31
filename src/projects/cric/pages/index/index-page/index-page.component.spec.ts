import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IndexPageComponent } from './index-page.component';
import { provideMockStore } from '@ngrx/store/testing';
import { MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { ItemWidgetState } from '@app/core/interfaces/store/user-interface.model';
import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';
import { Type } from '@angular/core';

describe('IndexPageComponent', () => {
  let component: IndexPageComponent;
  let fixture: ComponentFixture<IndexPageComponent>;
  const mockConfig: IWidgetConfig = {
    widgetsConfig: [
      {
        nombreWidget: 'BaseMap',
        titulo: 'Mapa Base',
        ruta: 'mock/ruta',
        importarComponente: (): Promise<Type<unknown>> =>
          Promise.resolve(
            class MockBaseMapComponent {} as unknown as Type<unknown>
          ),
      },
    ],
    overlayWidgetsConfig: [
      {
        nombreWidget: 'Overlay1',
        titulo: 'Overlay 1',
        ruta: 'mock/ruta',
        importarComponente: (): Promise<Type<unknown>> =>
          Promise.resolve(
            class MockOverlayComponent {} as unknown as Type<unknown>
          ),
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexPageComponent],
      providers: [
        provideMockStore({}),
        MessageService,
        provideNoopAnimations(),
        { provide: WIDGET_CONFIG, useValue: mockConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar configFloatingWindow con la configuración esperada', () => {
    const cfg: FloatingWindowConfig = component.configFloatingWindow;
    expect(cfg).toEqual(component.getConfigFloatingWindow());
  });

  it('debería inicializar configuracionWidgetAbierto con los valores esperados', () => {
    const w: ItemWidgetState = component.configuracionWidgetAbierto;
    expect(w).toEqual(component.getConfiguracionWidgetAbierto());
  });

  it('debería retornar la configuración correcta de la ventana flotante con getConfigFloatingWindow', () => {
    const config: FloatingWindowConfig = component.getConfigFloatingWindow();
    expect(config).toEqual({
      x: 449, // Posición horizontal inicial
      y: 83, // Posición vertical inicial
      width: 300, // Ancho inicial
      height: 300, // Alto inicial
      maxHeight: 900, // Altura máxima permitida
      maxWidth: 900, // Ancho máximo permitido
      enableClose: false, // No permite cierre
      enableResize: true, // Permite redimensionar
      enableDrag: true, // Permite arrastrar
      enableMinimize: true, // Permite minimizar
      buttomSeverity: 'danger', // Estilo para los botones
      buttomSize: 'small', // Tamaño para los botones
      buttomRounded: true, // Estilo redondeo para los botones
      iconMinimize: 'pi cric-zoom_out', // Icono minimizar
      iconMaximize: 'pi pi-chevron-up', // Icono Maximizar
      iconClose: 'pi pi-times', // Icono Cerrar
      headerClass:
        'fwh bg-white text-white flex flex flex-wrap align-items-center cursor-move p-2 border-round-top-2xl',
      buttomText: true,
    });
  });

  it('debería retornar la configuración correcta del widget abierto con getConfiguracionWidgetAbierto', () => {
    const widgetConfig: ItemWidgetState =
      component.getConfiguracionWidgetAbierto();

    expect(widgetConfig).toEqual({
      nombreWidget: 'Leyenda V2',
      ruta: '@app/widget/legend-v2/components/legend-second-version/legend-second-version.component',
      titulo: 'Leyenda V2',
      ancho: 300,
      alto: 300,
      altoMaximo: 900,
      anchoMaximo: 900,
    });
  });

  it('debería renderizar los componentes hijos principales en el template', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    const html = compiled.innerHTML;
    expect(html).toContain('app-layout-b');
    expect(html).toContain('app-leftbar-header');
    expect(html).toContain('app-content-table-v3');
    expect(html).toContain('app-cric-rightbar');
    expect(html).toContain('p-toast');
    expect(html).toContain('app-map');
    expect(html).toContain('app-floating-window');
    expect(html).toContain('app-legend-second-version');
    expect(html).toContain('app-cric-bottombar');
  });

  describe('cuando isMobileFromLayout = false (modo escritorio)', () => {
    beforeEach(() => {
      component.onIsMobileChange(false);
      fixture.detectChanges();
    });

    it('debería pasar configFloatingWindow al componente app-floating-window', () => {
      const floatingDE = fixture.debugElement.query(
        By.css('app-floating-window')
      );
      expect(floatingDE).toBeTruthy();

      const floatingCmp = floatingDE.componentInstance as {
        widgetFloatingWindowConfig: FloatingWindowConfig;
      };
      expect(floatingCmp.widgetFloatingWindowConfig).toEqual(
        component.configFloatingWindow
      );
    });
  });

  describe('cuando isMobileFromLayout = true (modo móvil)', () => {
    beforeEach(() => {
      component.onIsMobileChange(true);
      fixture.detectChanges();
    });

    it('debería pasar configMobileFloatingWindow al componente app-window-single-cric-component-render', () => {
      const singleWindowDE = fixture.debugElement.query(
        By.css('app-window-single-cric-component-render')
      );
      expect(singleWindowDE).toBeTruthy();

      const singleCmp = singleWindowDE.componentInstance as {
        configFloatingWindow: FloatingWindowConfig;
      };
      expect(singleCmp.configFloatingWindow).toEqual(
        component.configMobileFloatingWindow
      );
    });
  });

  it('debería actualizar isMobileFromLayout cuando se llame onIsMobileChange', () => {
    expect(component.isMobileFromLayout).toBeFalse();
    component.onIsMobileChange(true);
    expect(component.isMobileFromLayout).toBeTrue();
  });
});
