import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BufferAreaComponent } from './buffer-area.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { BufferAreaService } from '@app/widget/bufferArea/services/buffer-area.service';
import { Store } from '@ngrx/store';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { AttributeTableData } from '@app/widget/attributeTable/interfaces/geojsonInterface';
import Polygon from 'ol/geom/Polygon';
import { of } from 'rxjs';

describe('Componente BufferAreaComponent', () => {
  let component: BufferAreaComponent;
  let fixture: ComponentFixture<BufferAreaComponent>;
  let mockBufferService: jasmine.SpyObj<BufferAreaService>;
  let mockStore: jasmine.SpyObj<Store<object>>;
  let mockUIService: jasmine.SpyObj<UserInterfaceService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockBufferService = jasmine.createSpyObj('BufferAreaService', [
      'iniciarDibujoBuffer',
      'generarBufferDesdeGeometria',
      'limpiarDibujoBuffer',
    ]);

    mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    mockStore.select.and.returnValue(of(null));
    mockUIService = jasmine.createSpyObj('UserInterfaceService', [
      'cambiarVisibleWidget',
    ]);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, BufferAreaComponent],
      declarations: [],
      providers: [
        { provide: BufferAreaService, useValue: mockBufferService },
        { provide: Store, useValue: mockStore },
        { provide: UserInterfaceService, useValue: mockUIService },
        { provide: MessageService, useValue: mockMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BufferAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería convertir correctamente las distancias a metros', () => {
    expect(component.convertirDistancia(2, 'km')).toBe(2000);
    expect(component.convertirDistancia(5, 'mi')).toBeCloseTo(8046.7, 1);
    expect(component.convertirDistancia(1, 'nmi')).toBe(1852);
    expect(component.convertirDistancia(10, 'm')).toBe(10);
  });

  it('debería retornar mensaje adecuado para error de red', () => {
    const error = new Error('Failed to fetch');
    const mensaje = component.getErrorMessage(error);
    expect(mensaje).toContain('No se pudo conectar con el servidor');
  });

  it('debería marcar todos los campos como tocados y dirty si el formulario es inválido', () => {
    spyOn(component.formBufferSelection, 'markAllAsTouched').and.callThrough();

    component.onSubmit();

    expect(component.formBufferSelection.markAllAsTouched).toHaveBeenCalled();
    expect(component.formBufferSelection.controls['layer'].dirty).toBeTrue();
  });

  it('debería limpiar correctamente el formulario y el dibujo', () => {
    const polygon = new Polygon([
      [
        [0, 0],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ]);
    component.formBufferSelection
      .get('geometriaSeleccionada')
      ?.setValue(polygon);

    component.limpiar();

    expect(mockBufferService.limpiarDibujoBuffer).toHaveBeenCalled();
    expect(
      component.formBufferSelection.get('geometriaSeleccionada')?.value
    ).toBeNull();
  });

  it('debería asignar la geometría al formulario tras seleccionar área de buffer', fakeAsync(() => {
    const polygon = new Polygon([
      [
        [0, 0],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ]);
    mockBufferService.iniciarDibujoBuffer.and.returnValue(
      Promise.resolve(polygon)
    );

    component.seleccionarAreaBuffer();
    tick();

    expect(
      component.formBufferSelection.get('geometriaSeleccionada')?.value
    ).toEqual(polygon);
    expect(component.isLoading).toBeFalse();
  }));

  it('debería procesar correctamente la respuesta del buffer', () => {
    const datos: AttributeTableData[] = [
      {
        titulo: 'Resultado 1',
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: { type: 'Point', coordinates: [0, 0] },
            },
          ],
        },
        visible: true,
      },
    ];

    component['processBufferResponse'](datos);

    expect(mockStore.dispatch).toHaveBeenCalled();
    expect(mockUIService.cambiarVisibleWidget).toHaveBeenCalledWith(
      'attributeTable',
      false
    );
  });

  it('debería generar buffer y procesar datos correctamente', fakeAsync(() => {
    const polygon = new Polygon([
      [
        [0, 0],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ]);
    const layerMock = {
      nombre: 'testLayer',
      urlServicioWFS: 'http://fake.url',
    };
    const datosMock: AttributeTableData[] = [
      {
        titulo: 'Buffer',
        geojson: {
          type: 'FeatureCollection',
          features: [],
        },
        visible: true,
      },
    ];

    component.formBufferSelection.setValue({
      layer: layerMock,
      distance: 1,
      unit: 'km',
      geometriaSeleccionada: polygon,
    });

    mockBufferService.generarBufferDesdeGeometria.and.returnValue(
      Promise.resolve(datosMock)
    );

    component.generarBuffer();
    tick(1600); // Simula el tiempo de setTimeout

    expect(mockBufferService.generarBufferDesdeGeometria).toHaveBeenCalledWith(
      polygon,
      'testLayer',
      'http://fake.url',
      1000
    );
    expect(mockStore.dispatch).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  }));
});
