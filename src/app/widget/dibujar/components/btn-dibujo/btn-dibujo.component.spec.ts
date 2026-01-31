import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BtnDibujoComponent } from './btn-dibujo.component';
import { DibujarService } from '@app/widget/dibujar/services/dibujar/dibujar.service';
import { DibujarTextoService } from '@app/widget/dibujar/services/dibujarTexto/dibujar-texto.service';
import {
  BotonDibujo,
  TipoDibujo,
} from '@app/widget/dibujar/interfaces/boton-dibujo';
import { Subject } from 'rxjs';

describe('BtnDibujoComponent', () => {
  let component: BtnDibujoComponent;
  let fixture: ComponentFixture<BtnDibujoComponent>;
  let dibujarServiceSpy: jasmine.SpyObj<DibujarService>;

  beforeEach(async () => {
    const longitudSubjectMock = new Subject<number>();
    const areaSubjectMock = new Subject<number>();

    const dibujarServiceMock = jasmine.createSpyObj(
      'DibujarService',
      [
        'addInteraction',
        'removeDrawingInteraction',
        'clearAllGeometries',
        'updateFillColor',
        'updateStrokeColor',
        'updateStrokeWidth',
        'deshacerDibujo',
        'recuperarDibujo',
        'borrarDibujo',
        'puedeDeshacer',
        'puedeRecuperar',
        'CloseDibujo',
        'resetDibujo',
      ],
      {
        longitudSubject: longitudSubjectMock,
        areaSubject: areaSubjectMock,
      }
    );

    const dibujarTextoServiceMock = jasmine.createSpyObj(
      'DibujarTextoService',
      ['addTextFeature']
    );

    await TestBed.configureTestingModule({
      imports: [BtnDibujoComponent], // Componente standalone
      providers: [
        {
          provide: DibujarService,
          useValue: dibujarServiceMock,
        },
        {
          provide: DibujarTextoService,
          useValue: dibujarTextoServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BtnDibujoComponent);
    component = fixture.componentInstance;
    dibujarServiceSpy = TestBed.inject(
      DibujarService
    ) as jasmine.SpyObj<DibujarService>;

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería activar una herramienta de dibujo que no sea texto y llamar a addInteraction', () => {
    const tipo: TipoDibujo = 'Point';
    component.activarOpciones(tipo);

    expect(component.modoActivo).toBe(tipo);
    expect(component.mostrarDibujarTexto).toBeFalse();
    expect(component.mostrarOpcionesColor).toBeTrue();
    expect(dibujarServiceSpy.addInteraction).toHaveBeenCalledOnceWith(tipo);
  });

  it('debería activar la herramienta de texto y mostrar el componente de texto', () => {
    const tipo: TipoDibujo = 'Text';
    component.activarOpciones(tipo);

    expect(component.modoActivo).toBe(tipo);
    expect(component.mostrarDibujarTexto).toBeTrue();
    expect(component.mostrarOpcionesColor).toBeFalse();
    expect(dibujarServiceSpy.addInteraction).not.toHaveBeenCalled();
  });

  it('debería desactivar la herramienta si se selecciona la misma activa', () => {
    const tipo: TipoDibujo = 'Point';
    component.activarOpciones(tipo); // Activa primero
    component.activarOpciones(tipo); // Desactiva

    expect(component.modoActivo).toBe('');
    expect(component.mostrarDibujarTexto).toBeFalse();
    expect(component.texto).toBe('');
  });

  it('debería filtrar botones correctamente según las opciones de dibujo', () => {
    const opciones: ('Point' | 'LineString' | 'Polygon' | 'Circle')[] = [
      'Point',
      'Polygon',
    ];

    const botonesFiltrados: BotonDibujo[] =
      component.botonesFiltrados(opciones);

    const tiposFiltrados = botonesFiltrados.map(btn => btn.tipo);
    expect(tiposFiltrados).toContain('Point');
    expect(tiposFiltrados).toContain('Polygon');
    expect(tiposFiltrados).not.toContain('Circle');
    expect(tiposFiltrados).not.toContain('LineString');
  });

  it('mostrarBoton debería retornar true solo para tipos incluidos en opciones', () => {
    const opciones: ('Point' | 'LineString' | 'Polygon' | 'Circle')[] = [
      'Circle',
      'LineString',
    ];

    expect(component.mostrarBoton('Circle', opciones)).toBeTrue();
    expect(component.mostrarBoton('LineString', opciones)).toBeTrue();
    expect(component.mostrarBoton('Point', opciones)).toBeFalse();
    expect(component.mostrarBoton('Text', opciones)).toBeFalse();
    expect(component.mostrarBoton('Triangle', opciones)).toBeFalse();
  });
});
