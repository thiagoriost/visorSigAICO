import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CalculadoraComponent } from './calculadora.component';
import { By } from '@angular/platform-browser';

describe('CalculadoraComponent', () => {
  let component: CalculadoraComponent;
  let fixture: ComponentFixture<CalculadoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, CalculadoraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculadoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe actualizar expresión al cambiar el atributo', () => {
    component.atributo = { name: 'estado', value: 'estado' };

    component.ngOnChanges({
      atributo: {
        currentValue: component.atributo,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    const expresion = component.formCalculadora.get('expresion')?.value;
    expect(expresion).toContain('estado');
  });

  it('debe actualizar expresión al cambiar el valor', () => {
    component.valor = { name: 'Aprobado', value: 'Aprobado' };

    component.ngOnChanges({
      valor: {
        currentValue: component.valor,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    const expresion = component.formCalculadora.get('expresion')?.value;
    expect(expresion).toContain("'Aprobado'");
  });

  it('debe limpiar campos al invocar onLimpiarCampos()', () => {
    component.formCalculadora.get('expresion')?.setValue("estado = 'Aprobado'");
    component.onLimpiarCampos();

    const expresion = component.formCalculadora.get('expresion')?.value;
    expect(expresion).toBeNull(); // porque reset() pone el valor en null
  });

  it('debe renderizar botones de operadores', () => {
    fixture.detectChanges();
    const botones = fixture.debugElement.queryAll(By.css('button'));

    expect(botones.length).toBe(component.operators.length);
    expect(botones[0].nativeElement.textContent.trim()).toBe('=');
  });
});
