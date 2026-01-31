import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { DropdownEscalaComponent } from './dropdown-escala.component';
import { EscalaService } from '@app/widget/barraEscala/services/escala.service';
import { Escala } from '@app/widget/barraEscala/interface/escala';
import { SelectChangeEvent } from 'primeng/select';

describe('DropdownEscalaComponent', () => {
  let component: DropdownEscalaComponent;
  let fixture: ComponentFixture<DropdownEscalaComponent>;
  let escalaServiceSpy: jasmine.SpyObj<EscalaService>;
  let escalaSelectedSubject: BehaviorSubject<Escala>;

  // Datos simulados
  const mockEscalas: Escala[] = [
    { id: 1, nombre: '1:1.000', valor: 1000 },
    { id: 2, nombre: '1:2.500', valor: 2500 },
  ];

  beforeEach(async () => {
    // Mock del servicio
    const spy = jasmine.createSpyObj<EscalaService>('EscalaService', [
      'inicializarEscala',
      'getEscalas',
      'onChangeEscala',
    ]);

    // Observable simulado
    escalaSelectedSubject = new BehaviorSubject<Escala>(mockEscalas[0]);
    spy.escalaSelected$ = escalaSelectedSubject.asObservable();
    spy.getEscalas.and.returnValue(mockEscalas);

    await TestBed.configureTestingModule({
      imports: [DropdownEscalaComponent], // Componente standalone
      providers: [{ provide: EscalaService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownEscalaComponent);
    component = fixture.componentInstance;
    escalaServiceSpy = TestBed.inject(
      EscalaService
    ) as jasmine.SpyObj<EscalaService>;
    fixture.detectChanges(); // Ejecuta ngOnInit()
  });

  it('debería crearse el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el servicio y establecer los observables en ngOnInit', (done: DoneFn) => {
    // Verifica la llamada al servicio
    expect(escalaServiceSpy.inicializarEscala).toHaveBeenCalledWith(10, 300);
    expect(escalaServiceSpy.getEscalas).toHaveBeenCalled();

    // Verifica que los observables se inicializan correctamente
    component.escalas$.subscribe((escalas: Escala[]) => {
      expect(escalas).toEqual(mockEscalas);
      done();
    });
  });

  it('debería suscribirse a escalaSelected$ del servicio', (done: DoneFn) => {
    component.escalaSelected$.subscribe((escala: Escala) => {
      expect(escala).toEqual(mockEscalas[0]);
      done();
    });
  });

  it('debería emitir la nueva escala seleccionada cuando se cambia el valor', () => {
    const nuevaEscala: Escala = mockEscalas[1];

    const mockEvent: SelectChangeEvent = {
      originalEvent: new Event('change'),
      value: nuevaEscala,
    };

    component.onChangeEscala(mockEvent);

    expect(escalaServiceSpy.onChangeEscala).toHaveBeenCalledWith(nuevaEscala);
  });
});
