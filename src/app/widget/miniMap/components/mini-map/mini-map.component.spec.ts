import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiniMapComponent } from './mini-map.component';
import { MiniMapPpalComponent } from '@app/shared/components/mini-map-ppal/mini-map-ppal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { MiniMapService } from '@app/shared/services/mini-map/mini-map.service';
import { SimpleChange, SimpleChanges } from '@angular/core';

/** Servicio simulado para evitar llamadas HTTP reales */
class MiniMapServiceMock {
  updateMiniMapLayer(_layer: MapasBase): void {
    void _layer;
  }
  removeMiniMap(): void {
    // Simulación sin conexión real
  }
  setPanEnabled(_isEnabled: boolean): void {
    void _isEnabled;
  }
}

describe('MiniMapComponent', () => {
  let component: MiniMapComponent;
  let fixture: ComponentFixture<MiniMapComponent>;
  let miniMapService: MiniMapService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MiniMapComponent, // Componente standalone
      ],
      providers: [{ provide: MiniMapService, useClass: MiniMapServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MiniMapComponent);
    component = fixture.componentInstance;
    miniMapService = TestBed.inject(MiniMapService);
    fixture.detectChanges();
  });

  // -----------------------------------------------
  // PRUEBAS BÁSICAS
  // -----------------------------------------------
  it('debería crearse correctamente el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería iniciar con el mini mapa oculto', () => {
    expect(component.isMiniMapVisible).toBeFalse();
    const miniMap = fixture.debugElement.query(
      By.directive(MiniMapPpalComponent)
    );
    expect(miniMap).toBeNull();
  });

  it('debería mostrar el mini mapa al ejecutar toggleMiniMap()', () => {
    component.toggleMiniMap();
    fixture.detectChanges();

    expect(component.isMiniMapVisible).toBeTrue();
    const miniMap = fixture.debugElement.query(
      By.directive(MiniMapPpalComponent)
    );
    expect(miniMap).not.toBeNull();
  });

  it('debería ocultar el mini mapa al volver a ejecutar toggleMiniMap()', () => {
    component.toggleMiniMap(); // mostrar
    fixture.detectChanges();
    component.toggleMiniMap(); // ocultar
    fixture.detectChanges();

    expect(component.isMiniMapVisible).toBeFalse();
    const miniMap = fixture.debugElement.query(
      By.directive(MiniMapPpalComponent)
    );
    expect(miniMap).toBeNull();
  });

  // -----------------------------------------------
  // PRUEBAS DE GETTERS Y PROPIEDADES
  // -----------------------------------------------
  it('debería devolver "pi pi-eye" como icono por defecto', () => {
    expect(component.buttonIconValue).toBe('pi pi-eye');
  });

  it('debería devolver el icono asignado si se define', () => {
    component.buttonIcon = 'pi pi-map';
    expect(component.buttonIconValue).toBe('pi pi-map');
  });

  it('debería devolver true como valor por defecto de buttonRounded', () => {
    expect(component.buttonRoundedValue).toBeTrue();
  });

  it('debería devolver false si se define buttonRounded en false', () => {
    component.buttonRounded = false;
    expect(component.buttonRoundedValue).toBeFalse();
  });

  it('debería tener 12rem como ancho y alto por defecto', () => {
    expect(component.width).toBe('12rem');
    expect(component.height).toBe('12rem');
  });

  // -----------------------------------------------
  // PRUEBAS DE ACTUALIZACIÓN DE CAPA BASE
  // -----------------------------------------------
  it('debería actualizar la capa base en el servicio al asignar baseMap', () => {
    const spy = spyOn(miniMapService, 'updateMiniMapLayer');
    component.baseMap = MapasBase.ESRI_GRAY_DARK;
    expect(spy).toHaveBeenCalledWith(MapasBase.ESRI_GRAY_DARK);
    expect(component.baseMap).toBe(MapasBase.ESRI_GRAY_DARK);
  });

  it('debería asignar GOOGLE_SATELLITE como valor por defecto si baseMap es undefined', () => {
    const spy = spyOn(miniMapService, 'updateMiniMapLayer');
    // @ts-expect-error: probamos caso indefinido
    component.baseMap = undefined;
    expect(component.baseMap).toBe(MapasBase.GOOGLE_SATELLITE);
    expect(spy).toHaveBeenCalledWith(MapasBase.GOOGLE_SATELLITE);
  });

  // -----------------------------------------------
  // PRUEBAS DE ngOnChanges
  // -----------------------------------------------
  it('debería llamar a setPanEnabled cuando cambie isPanEnabled', () => {
    const spy = spyOn(miniMapService, 'setPanEnabled');
    component.isPanEnabled = true;

    const cambios: SimpleChanges = {
      isPanEnabled: new SimpleChange(false, true, false),
    };

    component.ngOnChanges(cambios);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('no debería llamar a setPanEnabled si no hay cambios en isPanEnabled', () => {
    const spy = spyOn(miniMapService, 'setPanEnabled');
    const cambiosVacios: SimpleChanges = {};
    component.ngOnChanges(cambiosVacios);
    expect(spy).not.toHaveBeenCalled();
  });

  // -----------------------------------------------
  // PRUEBAS DE POSICIONAMIENTO DEL MINI MAPA
  // -----------------------------------------------
  interface PositionTest {
    posicion: MiniMapComponent['mapPosition'];
    clasesEsperadas: string[];
  }

  const posiciones: PositionTest[] = [
    {
      posicion: 'top-left',
      clasesEsperadas: ['top-0', 'right-0', '-translate-y-100'],
    },
    {
      posicion: 'top-right',
      clasesEsperadas: ['top-0', 'left-0', '-translate-y-100'],
    },
    {
      posicion: 'bottom-left',
      clasesEsperadas: ['bottom-0', 'right-0', 'translate-y-100'],
    },
    {
      posicion: 'bottom-right',
      clasesEsperadas: ['bottom-0', 'left-0', 'translate-y-100'],
    },
    {
      posicion: 'left-top',
      clasesEsperadas: ['bottom-0', 'left-0', '-translate-x-100'],
    },
    {
      posicion: 'right-top',
      clasesEsperadas: ['bottom-0', 'right-0', 'translate-x-100'],
    },
    {
      posicion: 'left-bottom',
      clasesEsperadas: ['top-0', 'left-0', '-translate-x-100'],
    },
    {
      posicion: 'right-bottom',
      clasesEsperadas: ['top-0', 'right-0', 'translate-x-100'],
    },
  ];

  posiciones.forEach(({ posicion, clasesEsperadas }) => {
    it(`debería devolver las clases correctas para la posición "${posicion}"`, () => {
      component.mapPosition = posicion;
      const resultado: string[] = component.combinedMapClasses;
      expect(resultado).toEqual(clasesEsperadas);
    });
  });

  it('debería incluir la clase personalizada si mapContainerClass está definida', () => {
    component.mapPosition = 'top-left';
    component.mapContainerClass = 'custom-class';
    const resultado: string[] = component.combinedMapClasses;
    expect(resultado).toContain('custom-class');
  });
});
