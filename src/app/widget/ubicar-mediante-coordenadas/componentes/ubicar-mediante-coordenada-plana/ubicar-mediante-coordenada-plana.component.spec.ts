import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbicarMedianteCoordenadaPlanaComponent } from './ubicar-mediante-coordenada-plana.component';
import { Store } from '@ngrx/store';
import { LocateCoordinateService } from '../../services/locate-coordinate.service';
import { MessageService } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { MapState } from '@app/core/interfaces/store/map.model';

describe('UbicarMedianteCoordenadaPlanaComponent', () => {
  let component: UbicarMedianteCoordenadaPlanaComponent;
  let fixture: ComponentFixture<UbicarMedianteCoordenadaPlanaComponent>;
  let mockLocateCoordinateService: jasmine.SpyObj<LocateCoordinateService>;
  let mockStore: jasmine.SpyObj<Store<MapState>>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockLocateCoordinateService = jasmine.createSpyObj(
      'LocateCoordinateService',
      ['addPointToMap', 'removeLayerByName', 'transformarCoordenada']
    );

    // Aquí devolvemos un observable válido para todas las pruebas
    mockStore = jasmine.createSpyObj('Store', ['select']);
    mockStore.select.and.returnValue(of({ projection: 'EPSG:4326' }));

    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [
        UbicarMedianteCoordenadaPlanaComponent,
        //StoreModule.forRoot({}),
        ReactiveFormsModule,
      ],
      providers: [
        FormBuilder,
        {
          provide: LocateCoordinateService,
          useValue: mockLocateCoordinateService,
        },
        { provide: Store, useValue: mockStore },
        { provide: MessageService, useValue: mockMessageService },
      ], // Asegúrate de agregar el servicio aquí
    }).compileComponents();

    fixture = TestBed.createComponent(UbicarMedianteCoordenadaPlanaComponent);
    component = fixture.componentInstance;
    // Opcionalmente simula el store
    mockStore.select.and.returnValue(of({ projection: 'EPSG:4326' }));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('debería inicializar el formulario y obtener la proyección del mapa', () => {
      mockStore.select.and.returnValue(of({ projection: 'EPSG:4326' }));

      component.ngOnInit();

      expect(component.coordenadaPlanaForm.contains('este')).toBeTrue();
      expect(component.coordenadaPlanaForm.contains('norte')).toBeTrue();
    });
  });
  describe('onLocatePoint', () => {
    it('debería agregar una coordenada válida al mapa', () => {
      mockStore.select.and.returnValue(of({ projection: 'EPSG:4326' }));

      component.ngOnInit(); // NECESARIO

      component.coordenadaPlanaForm.setValue({
        este: 100,
        norte: 200,
      });
      const coordenadaTransformada: [number, number] = [101, 201];
      mockLocateCoordinateService.transformarCoordenada.and.returnValue(
        coordenadaTransformada
      );

      component.onLocatePoint();
    });

    it('debería mostrar un mensaje de error si el formulario no es válido', () => {
      mockStore.select.and.returnValue(of({ projection: 'EPSG:4326' }));

      component.ngOnInit(); // Necesario para inicializar `this.proyeccionMapa`

      component.coordenadaPlanaForm.setValue({
        este: null,
        norte: 200,
      });

      component.onLocatePoint();
    });
  });
});
