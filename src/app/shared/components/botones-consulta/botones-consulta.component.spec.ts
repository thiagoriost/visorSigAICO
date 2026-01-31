import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BotonesConsultaComponent } from './botones-consulta.component';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button'; // importa PrimeNG si usas pButton

describe('BotonesConsultaComponent', () => {
  let component: BotonesConsultaComponent;
  let fixture: ComponentFixture<BotonesConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonModule, NoopAnimationsModule, BotonesConsultaComponent], // incluye módulos necesarios
    }).compileComponents();

    fixture = TestBed.createComponent(BotonesConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe emitir limpiarCampos cuando se hace clic en el botón "Limpiar"', () => {
    // Arrange
    spyOn(component.limpiarCampos, 'emit');

    // Act
    const limpiarBtn = fixture.debugElement.query(
      By.css('button[label="Limpiar"]')
    );
    limpiarBtn.nativeElement.click();

    // Assert
    expect(component.limpiarCampos.emit).toHaveBeenCalled();
  });

  it('debe emitir ejecutarConsulta con true cuando se hace clic en el botón "Consultar"', () => {
    // Arrange
    spyOn(component.ejecutarConsulta, 'emit');

    // Act
    const consultarBtn = fixture.debugElement.query(
      By.css('button[label="Consultar"]')
    );
    consultarBtn.nativeElement.click();

    // Assert
    expect(component.ejecutarConsulta.emit).toHaveBeenCalledWith(true);
  });
});
