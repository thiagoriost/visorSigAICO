import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BarraEscalaComponent } from './barra-escala.component';

/**
 * Mock del componente hijo EscalaComponent
 */
@Component({
  selector: 'app-escala',
  standalone: true,
  template: '<div>Mock Escala</div>',
})
class MockEscalaComponent {}

/**
 * Mock del componente hijo DropdownEscalaComponent
 */
@Component({
  selector: 'app-dropdown-escala',
  standalone: true,
  template: '<div>Mock Dropdown Escala</div>',
})
class MockDropdownEscalaComponent {}

/**
 * Pruebas unitarias para BarraEscalaComponent
 */
describe('BarraEscalaComponent', () => {
  let fixture: ComponentFixture<BarraEscalaComponent>;
  let component: BarraEscalaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BarraEscalaComponent,
        MockEscalaComponent,
        MockDropdownEscalaComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BarraEscalaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener valores por defecto correctos', () => {
    expect(component.scaleType).toBe('scaleline');
    expect(component.showDropdown).toBeTrue();
    expect(component.showEscalas).toBeTrue();
  });

  it('debería mostrar <app-dropdown-escala> cuando showDropdown es true', () => {
    component.showDropdown = true;
    fixture.detectChanges();
    const dropdown = fixture.debugElement.query(By.css('app-dropdown-escala'));
    expect(dropdown).toBeTruthy();
  });

  it('no debería mostrar <app-dropdown-escala> cuando showDropdown es false', () => {
    component.showDropdown = false;
    fixture.detectChanges();
    const dropdown = fixture.debugElement.query(By.css('app-dropdown-escala'));
    expect(dropdown).toBeNull();
  });

  it('debería mostrar siempre el componente <app-escala>', () => {
    const escala = fixture.debugElement.query(By.css('app-escala'));
    expect(escala).toBeTruthy();
  });

  it('debería ocultar <app-escala> cuando showEscalas es false', () => {
    component.showEscalas = false;
    fixture.detectChanges();
    const escala = fixture.debugElement.query(By.css('app-escala'));
    expect(escala).toBeNull();
  });

  it('debería mostrar ambos componentes cuando showDropdown y showEscalas son true', () => {
    component.showDropdown = true;
    component.showEscalas = true;
    fixture.detectChanges();

    const dropdown = fixture.debugElement.query(By.css('app-dropdown-escala'));
    const escala = fixture.debugElement.query(By.css('app-escala'));

    expect(dropdown).toBeTruthy();
    expect(escala).toBeTruthy();
  });

  it('no debería mostrar ningún componente cuando showDropdown y showEscalas son false', () => {
    component.showDropdown = false;
    component.showEscalas = false;
    fixture.detectChanges();

    const dropdown = fixture.debugElement.query(By.css('app-dropdown-escala'));
    const escala = fixture.debugElement.query(By.css('app-escala'));

    expect(dropdown).toBeNull();
    expect(escala).toBeNull();
  });
});
