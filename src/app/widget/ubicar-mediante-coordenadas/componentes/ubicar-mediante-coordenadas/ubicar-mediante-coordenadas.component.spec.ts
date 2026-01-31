import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocateCoordinateService } from '@app/widget/ubicar-mediante-coordenadas/services/locate-coordinate.service';
import { UbicarMedianteCoordenadasComponent } from '@app/widget/ubicar-mediante-coordenadas/componentes/ubicar-mediante-coordenadas/ubicar-mediante-coordenadas.component';
import { Store, StoreModule } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { of } from 'rxjs';
import { CoordenadaGeografica } from '@app/widget/ubicar-mediante-coordenadas/interfaces/CoordenadaGeografica';
import { CoordenadaPlana } from '@app/widget/ubicar-mediante-coordenadas/interfaces/CoordenadaPlana';

// Configuración del TestBed con los mocks
describe('UbicarMedianteCoordenadaComponent', () => {
  let component: UbicarMedianteCoordenadasComponent;
  let fixture: ComponentFixture<UbicarMedianteCoordenadasComponent>;
  let mockLocateCoordinateService: jasmine.SpyObj<LocateCoordinateService>;
  let mockStore: jasmine.SpyObj<Store<MapState>>;

  beforeEach(async () => {
    mockLocateCoordinateService = jasmine.createSpyObj(
      'LocateCoordinateService',
      ['addPointToMap', 'removeLayerByName', 'transformarCoordenada']
    );

    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockStore.select.and.returnValue(of({ projection: 'EPSG:4326' }));
    await TestBed.configureTestingModule({
      imports: [UbicarMedianteCoordenadasComponent, StoreModule.forRoot({})],
      providers: [
        LocateCoordinateService,
        {
          provide: LocateCoordinateService,
          useValue: mockLocateCoordinateService,
        },
        { provide: Store, useValue: mockStore },
      ], // Asegúrate de agregar el servicio aquí
    }).compileComponents();

    fixture = TestBed.createComponent(UbicarMedianteCoordenadasComponent);
    component = fixture.componentInstance;
    // Opcionalmente simula el store
    mockStore.select.and.returnValue(of({ projection: 'EPSG:4326' }));
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('deberia inyectar el servicio LocateCoordinateService', () => {
    const service = TestBed.inject(LocateCoordinateService);
    expect(service).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería inicializar el componente y obtener la proyección del mapa', () => {
      mockStore.select.and.returnValue(of({ projection: 'EPSG:4326' }));

      component.ngOnInit();

      expect(component.proyeccionMapa).toBe('EPSG:4326');
    });
  });

  describe('Localizar una coordenada en el mapa', () => {
    it('agregar coordenada plana en el mapa', () => {
      const coordenadaPlana: CoordenadaPlana = {
        este: 73.34,
        norte: 34.56,
        id: 'test_01',
      };
      component.onLocateFlatCoordinate(coordenadaPlana);
      const coordenadaTransformada: [number, number] = [101, 201];
      mockLocateCoordinateService.transformarCoordenada.and.returnValue(
        coordenadaTransformada
      );
      expect(component.coordenada).not.toBeNull();
    });
    it('localizar coordenada geografica en el mapa', () => {
      const coordenadaPlana: CoordenadaGeografica = {
        longitud: 73.34,
        latitud: 34.56,
        tipoGrado: 'decimal',
        id: 'test_01',
      };
      component.onLocateGeographicCoordinate(coordenadaPlana);
      const coordenadaTransformada: [number, number] = [101, 201];
      mockLocateCoordinateService.transformarCoordenada.and.returnValue(
        coordenadaTransformada
      );
      expect(component.coordenada).not.toBeNull();
    });
  });

  describe('eliminarPuntosMarcados', () => {
    it('debería eliminar todas las coordenadas registradas', () => {
      component.ngOnInit();
      component.coordenada = {
        longitud: 1,
        latitud: 2,
        tipoGrado: 'decimal',
        id: 'flatPoint_0',
      };
      component.eliminarPuntoMarcado();

      expect(component.coordenada).toBeNull();
    });

    it('no debería lanzar errores si la coordenada es nula', () => {
      component.coordenada = null;
      expect(() => component.eliminarPuntoMarcado()).not.toThrow();
      expect(
        mockLocateCoordinateService.removeLayerByName
      ).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('debería llamar a eliminarPuntosMarcados', () => {
      spyOn(component, 'eliminarPuntoMarcado');
      component.ngOnDestroy();
      expect(component.eliminarPuntoMarcado).toHaveBeenCalled();
    });
  });

  it('deberia ajustar el valor de la coordenad cuando se emite un valor desde el componente hijo de transformar coordenadas', () => {
    const coordinate: CoordenadaGeografica = {
      latitud: 100,
      longitud: 100,
      tipoGrado: 'decimal',
      id: 'transformedCoordinate_',
    };
    component.onChangeTransformedCoordinate(coordinate);
    expect(component.coordenada).toEqual(coordinate);
  });
});
