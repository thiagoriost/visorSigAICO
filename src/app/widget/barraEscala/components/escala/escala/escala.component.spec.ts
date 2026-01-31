import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { EscalaComponent } from './escala.component';
import { EscalaService } from '@app/widget/barraEscala/services/escala.service';

describe('EscalaComponent', () => {
  let component: EscalaComponent;
  let fixture: ComponentFixture<EscalaComponent>;
  let escalaServiceSpy: jasmine.SpyObj<EscalaService>;

  beforeEach(async () => {
    // Creamos el espía del servicio EscalaService
    const escalaSpy = jasmine.createSpyObj('EscalaService', [
      'initScaleLineControl',
    ]);

    await TestBed.configureTestingModule({
      imports: [EscalaComponent], // componente standalone
      providers: [{ provide: EscalaService, useValue: escalaSpy }],
    }).compileComponents();

    escalaServiceSpy = TestBed.inject(
      EscalaService
    ) as jasmine.SpyObj<EscalaService>;
    fixture = TestBed.createComponent(EscalaComponent);
    component = fixture.componentInstance;

    // Simulamos el contenedor del ViewChild
    const container = document.createElement('div');
    document.body.appendChild(container);
    component.scaleLineContainer = {
      nativeElement: container,
    } as ElementRef<HTMLDivElement>;

    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar initScaleLineControl con el contenedor y tipo de escala al inicializar', () => {
    expect(escalaServiceSpy.initScaleLineControl).toHaveBeenCalledWith(
      component.scaleLineContainer,
      component.scaleType
    );
  });

  it('debería usar "scaleline" como valor por defecto de scaleType', () => {
    expect(component.scaleType).toBe('scaleline');
  });

  it('debería permitir cambiar el tipo de escala por Input', () => {
    component.scaleType = 'scalebar';
    fixture.detectChanges();

    component.ngOnInit();
    expect(escalaServiceSpy.initScaleLineControl).toHaveBeenCalledWith(
      component.scaleLineContainer,
      'scalebar'
    );
  });
});
