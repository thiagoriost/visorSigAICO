import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DibujarTextoComponent } from './dibujar-texto.component';
import { DibujarTextoService } from '@app/widget/dibujar/services/dibujarTexto/dibujar-texto.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { ColorPickerModule } from 'primeng/colorpicker';

describe('DibujarTextoComponent', () => {
  let component: DibujarTextoComponent;
  let fixture: ComponentFixture<DibujarTextoComponent>;
  let dibujarTextoServiceMock: jasmine.SpyObj<DibujarTextoService>;

  beforeEach(async () => {
    dibujarTextoServiceMock = jasmine.createSpyObj<DibujarTextoService>(
      'DibujarTextoService',
      [
        'addTextFeature',
        'deshacerTexto',
        'recuperarTexto',
        'borrarTexto',
        'puedeDeshacer',
        'puedeRecuperar',
      ]
    );

    dibujarTextoServiceMock.puedeDeshacer.and.returnValue(false);
    dibujarTextoServiceMock.puedeRecuperar.and.returnValue(false);
    await TestBed.configureTestingModule({
      imports: [
        DibujarTextoComponent,
        FormsModule,
        ButtonModule,
        CommonModule,
        InputNumberModule,
        ColorPickerModule,
      ],
      providers: [
        { provide: DibujarTextoService, useValue: dibujarTextoServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DibujarTextoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe llamar al servicio para dibujar el texto con los valores actuales', () => {
    component.texto = 'Hola';
    component.colorTexto = '#FF0000';
    component.tamanoTexto = 30;

    component.dibujarTexto();

    expect(dibujarTextoServiceMock.addTextFeature).toHaveBeenCalledOnceWith(
      'Hola',
      '#FF0000',
      30
    );
  });

  it('debe llamar al servicio para deshacer el texto', () => {
    component.deshacerDibujo();
    expect(dibujarTextoServiceMock.deshacerTexto).toHaveBeenCalled();
  });

  it('debe llamar al servicio para recuperar el texto', () => {
    component.recuperarDibujo();
    expect(dibujarTextoServiceMock.recuperarTexto).toHaveBeenCalled();
  });

  it('debe llamar al servicio para borrar el texto', () => {
    component.eliminarDibujo();
    expect(dibujarTextoServiceMock.borrarTexto).toHaveBeenCalled();
  });
});
