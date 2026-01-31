import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { TransformCoodinatesComponent } from '@app/widget/ubicar-mediante-coordenadas/componentes/transform-coodinates/transform-coodinates.component';
import { LocateCoordinateService } from '@app/widget/ubicar-mediante-coordenadas/services/locate-coordinate.service';
import { CoordenadaGeografica } from '@app/widget/ubicar-mediante-coordenadas/interfaces/CoordenadaGeografica';
import { CoordenadaPlana } from '@app/widget/ubicar-mediante-coordenadas/interfaces/CoordenadaPlana';

describe('TransformCoodinatesComponent', () => {
  let component: TransformCoodinatesComponent;
  let fixture: ComponentFixture<TransformCoodinatesComponent>;

  let mockLocateCoordinateService: jasmine.SpyObj<LocateCoordinateService>;

  beforeEach(async () => {
    mockLocateCoordinateService = jasmine.createSpyObj(
      'locateCoordinateService',
      ['transformarCoordenada']
    );
    await TestBed.configureTestingModule({
      imports: [TransformCoodinatesComponent, StoreModule.forRoot({})],
      providers: [
        {
          provide: LocateCoordinateService,
          useValue: mockLocateCoordinateService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransformCoodinatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deberia intercambiar el orden de transformacion y ajustar el valor de las coordenadas', () => {
    component.ordenNormal = true;
    //ejecutar el metodo de intercambiar
    component.intercambiar();
    expect(component.flatCoordinateTransformed).toBeNull();
    expect(component.geographicCoordinateTransformed).toBeNull();
    expect(component.ordenNormal).toBe(false);
  });

  it('deberia transformar una coordenada Geografica a Plana', () => {
    component.ordenNormal = true;
    const coordenadaGeografica: CoordenadaGeografica = {
      latitud: 5.2345,
      longitud: -73.3456,
      tipoGrado: 'decimal',
      id: 'geographicCoordinate1',
    };
    const flatCoordinateTransformed =
      component.transformFromGeographicToFlatCoordinate(
        coordenadaGeografica,
        'EPSG:4686',
        'EPSG:9377'
      );
    const coordenadaPlana: CoordenadaPlana = {
      este: 4961717.778862101,
      norte: 2136414.201831201,
    };
    expect(flatCoordinateTransformed).toEqual(coordenadaPlana);
  });

  it('deberia transformar una coordenada Plana a Geografica ', () => {
    component.ordenNormal = true;
    const coordenadaPlana: CoordenadaPlana = {
      este: 4961717.778,
      norte: 2136414.201,
    };
    const geographicCoordinateTransformed =
      component.transformFromFlatToGeographic(
        coordenadaPlana,
        'EPSG:9377',
        'EPSG:4686'
      );

    const coordenadaGeografica: CoordenadaGeografica = {
      latitud: 5.2344999924733235,
      longitud: -73.34560000777857,
      tipoGrado: 'decimal',
    };
    expect(geographicCoordinateTransformed).toEqual(coordenadaGeografica);
  });

  it('deberia llamar al metodo de transformar coordenada geografica a plana cuando se emite el valor desde el componente de ubicar coordenada plana', () => {
    const coordenadaGeografica: CoordenadaGeografica = {
      latitud: 5.2345,
      longitud: -73.3456,
      tipoGrado: 'decimal',
      id: 'geographicCoordinate1',
    };

    spyOn(component, 'onLocateGeographicCoordinate');
    component.onLocateGeographicCoordinate(coordenadaGeografica);
    expect(component.onLocateGeographicCoordinate).toHaveBeenCalledWith(
      coordenadaGeografica
    );
  });

  it('deberia llamar al metodo de transformar coordenada plana a geografica cuando se emite el valor desde el componente de ubicar coordenada plana', () => {
    const coordenadaPlana: CoordenadaPlana = {
      este: 4961717.778,
      norte: 2136414.201,
    };
    spyOn(component, 'onLocateFlatCoordinate');
    component.onLocateFlatCoordinate(coordenadaPlana);
    expect(component.onLocateFlatCoordinate).toHaveBeenCalledWith(
      coordenadaPlana
    );
  });

  it('deberia no emitir el valor al componente padre cuando hay una coordenada', () => {
    component.coordinatedTransform = null;
    spyOn(component.coordinateEmitter, 'emit');
    component.locateTransformedCoordinate();
    expect(component.coordinateEmitter.emit).not.toHaveBeenCalled();
  });
});
