import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BufferAreaLocationComponent } from './buffer-area-location.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BufferAreaCoordenadaService } from '@app/widget/bufferArea/services/buffer-area-coordenada.service';
import { CoordenadaGeografica } from '@app/widget/ubicar-mediante-coordenadas/interfaces/CoordenadaGeografica';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

class MockBufferAreaCoordenadaService {
  dibujarBufferDesdeCoordenada(): Promise<void> {
    return Promise.resolve(); // Simulación exitosa
  }
}

class MockStore {
  dispatch = jasmine.createSpy('dispatch');
  select = jasmine.createSpy('select').and.returnValue(of({}));
}

describe('BufferAreaLocationComponent', () => {
  let component: BufferAreaLocationComponent;
  let fixture: ComponentFixture<BufferAreaLocationComponent>;
  let mockService: BufferAreaCoordenadaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BufferAreaLocationComponent, ReactiveFormsModule],
      providers: [
        {
          provide: BufferAreaCoordenadaService,
          useClass: MockBufferAreaCoordenadaService,
        },
        {
          provide: Store,
          useClass: MockStore,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BufferAreaLocationComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(BufferAreaCoordenadaService);
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con campos vacíos y no válidos', () => {
    expect(component.formBufferLocation.valid).toBeFalse();
    expect(component.formBufferLocation.get('unit')?.value).toBeNull();
    expect(component.formBufferLocation.get('distance')?.value).toBeNull();
    expect(component.formBufferLocation.get('location')?.value).toBeNull();
  });

  it('debería marcar los campos como "touched" y "dirty" si el formulario es inválido al enviar', () => {
    component.onSubmit();

    Object.values(component.formBufferLocation.controls).forEach(control => {
      expect(control.touched).toBeTrue();
      expect(control.dirty).toBeTrue();
    });
  });

  it('debería establecer correctamente la ubicación mediante setLocation()', () => {
    const coordenada: CoordenadaGeografica = {
      id: '1',
      latitud: 4.5,
      longitud: -74.1,
      tipoGrado: 'decimal',
    };

    spyOn(component, 'onSubmit');

    component.setLocation(coordenada);

    const location = component.formBufferLocation.get('location')?.value;
    expect(location).toEqual(coordenada);
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('debería llamar al servicio si el formulario es válido', fakeAsync(() => {
    const coordenada: CoordenadaGeografica = {
      id: '2',
      latitud: 10,
      longitud: -70,
      tipoGrado: 'sexagecimal',
    };

    const emitirCarga = spyOn(component.loading, 'emit');
    const servicioSpy = spyOn(
      mockService,
      'dibujarBufferDesdeCoordenada'
    ).and.callThrough();

    component.formBufferLocation.setValue({
      unit: 'km',
      distance: 100,
      location: coordenada,
    });

    component.onSubmit();

    expect(emitirCarga).toHaveBeenCalledWith(true);
    expect(servicioSpy).toHaveBeenCalledWith(
      {
        id: '2',
        latitud: 10,
        longitud: -70,
        tipoGrado: 'sexagecimal',
      },
      100,
      'km'
    );

    tick(800);
    expect(emitirCarga).toHaveBeenCalledWith(false);
  }));

  it('debería manejar errores si el servicio falla', fakeAsync(() => {
    const coordenada: CoordenadaGeografica = {
      id: '3',
      latitud: 5.2,
      longitud: -73.9,
      tipoGrado: 'plana',
    };

    const emitirCarga = spyOn(component.loading, 'emit');
    spyOn(mockService, 'dibujarBufferDesdeCoordenada').and.returnValue(
      Promise.reject('Error de prueba')
    );

    component.formBufferLocation.setValue({
      unit: 'm',
      distance: 500,
      location: coordenada,
    });

    component.onSubmit();
    expect(emitirCarga).toHaveBeenCalledWith(true);

    tick(800);
    expect(emitirCarga).toHaveBeenCalledWith(false);
  }));
});
