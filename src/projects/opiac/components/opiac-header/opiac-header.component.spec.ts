import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpiacHeaderComponent } from './opiac-header.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { of } from 'rxjs';

describe('OpiacHeaderComponent', () => {
  let component: OpiacHeaderComponent;
  let fixture: ComponentFixture<OpiacHeaderComponent>;
  // Espía de BreakpointObserver para simular cambios de resolución
  let mockBreakpointObserver: jasmine.SpyObj<BreakpointObserver>;

  beforeEach(async () => {
    // Se crea un espía del servicio BreakpointObserver
    mockBreakpointObserver = jasmine.createSpyObj('BreakpointObserver', [
      'observe',
    ]);
    // Proporcionamos un valor por defecto ANTES de detectChanges()
    mockBreakpointObserver.observe.and.returnValue(
      of({ matches: false } as BreakpointState)
    );

    await TestBed.configureTestingModule({
      imports: [OpiacHeaderComponent],
      providers: [
        { provide: BreakpointObserver, useValue: mockBreakpointObserver },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OpiacHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Dispara el ciclo de vida del componente (ngOnInit)
    fixture.detectChanges();
    // Verifica que el componente haya sido creado
    expect(component).toBeTruthy();
  });

  it('should detect mobile breakpoint and hide elements', () => {
    // Simula que la pantalla está en modo móvil (matches: true)
    mockBreakpointObserver.observe.and.returnValue(
      of({ matches: true } as BreakpointState)
    );

    // Dispara el ciclo de vida (ngOnInit)
    fixture.detectChanges();

    // Verifica que la propiedad isMobile se haya actualizado
    expect(component.isMobile).toBeTrue();
    // Verificar que en el template no este la imange con id "logo-opiac" y componente divider
    expect(fixture.nativeElement.querySelector('#logo-opiac')).toBeNull();
    expect(fixture.nativeElement.querySelector('p-divider')).toBeNull();
  });
});
