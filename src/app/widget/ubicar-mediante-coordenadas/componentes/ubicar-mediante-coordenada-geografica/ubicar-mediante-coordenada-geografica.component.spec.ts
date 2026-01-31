import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UbicarMedianteCoordenadaGeograficaComponent } from '@app/widget/ubicar-mediante-coordenadas/componentes/ubicar-mediante-coordenada-geografica/ubicar-mediante-coordenada-geografica.component';
import { MessageService } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonClickEvent } from 'primeng/radiobutton';
import { CoordenadaGeografica } from '../../interfaces/CoordenadaGeografica';

describe('UbicarMedianteCoordenadaGeograficaComponent', () => {
  let component: UbicarMedianteCoordenadaGeograficaComponent;
  let fixture: ComponentFixture<UbicarMedianteCoordenadaGeograficaComponent>;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    await TestBed.configureTestingModule({
      imports: [
        UbicarMedianteCoordenadaGeograficaComponent,
        ReactiveFormsModule,
      ],
      providers: [
        FormBuilder,

        { provide: MessageService, useValue: mockMessageService },
      ], // Asegúrate de agregar el servicio aquí
    }).compileComponents();

    fixture = TestBed.createComponent(
      UbicarMedianteCoordenadaGeograficaComponent
    );
    component = fixture.componentInstance;
    // Opcionalmente simula el store
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('debería inicializar el formulario y obtener la proyección del mapa', () => {
      component.ngOnInit();

      expect(
        component.coordenadaGeograficaForm.contains('longitud')
      ).toBeTrue();
      expect(component.coordenadaGeograficaForm.contains('latitud')).toBeTrue();
    });
  });
  describe('onLocatePoint', () => {
    it('debería agregar una coordenada válida al mapa', () => {
      component.ngOnInit(); // NECESARIO
      spyOn(component.coordinateEmitter, 'emit'); // Espiamos el método emit()

      component.coordenadaGeograficaForm.setValue({
        longitud: 74.0721,
        latitud: 4.711,
        tipoGrado: 'decimal',
        hemisferioLongitud: { name: 'E', value: 'E' },
        hemisferioLatitud: { name: 'S', value: 'S' },
      });

      component.onLocate();
      expect(component.coordinateEmitter.emit).toHaveBeenCalled(); // Verificamos
    });

    it('debería mostrar un mensaje de error si el formulario no es válido', () => {
      component.ngOnInit(); // Necesario para inicializar `this.proyeccionMapa`
      spyOn(component.coordinateEmitter, 'emit'); // Espiamos el método emit()
      component.coordenadaGeograficaForm.setValue({
        longitud: null,
        latitud: 4.711,
        tipoGrado: 'decimal',
        hemisferioLongitud: { name: 'E', value: 'E' },
        hemisferioLatitud: { name: 'S', value: 'S' },
      });

      component.onLocate();
      expect(component.coordinateEmitter.emit).not.toHaveBeenCalled(); // Verificamos
    });
  });

  describe('Emitir coordenadas sexagesimales', () => {
    it('Deberia emitir la coordenada', () => {
      spyOn(component.coordinateEmitter, 'emit'); // Espiamos el método emit()
      const coordenada: CoordenadaGeografica = {
        latitud: 73.345,
        longitud: 54.3444,
        tipoGrado: 'sexagecimal',
        id: 'sexagesimal_coordinate_1',
      };
      component.onEmitSexagecimalCoordinate(coordenada);
      expect(component.coordinateEmitter.emit).toHaveBeenCalled(); // Verificamos
    });
  });
  describe('Seleccion en el radio button', () => {
    it('deberia cambiar el valor de tippoGrado al hacer clic en el radio button', () => {
      const event = { value: 'sexagecimal' } as RadioButtonClickEvent;
      component.onChangeRadioButton(event);
      expect(component.tipoGrado).toBe('sexagecimal');
    });
  });
});
