import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AisoHeaderComponent } from './aiso-header.component';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AisoHeaderComponent', () => {
  let component: AisoHeaderComponent;
  let fixture: ComponentFixture<AisoHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AisoHeaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AisoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- PRUEBAS ---

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería renderizar el contenedor principal con la clase "grid"', () => {
    const mainContainer = fixture.debugElement.query(By.css('.grid'));
    expect(mainContainer).toBeTruthy();
  });

  it('debería contener el elemento con clase "aiso-header-main"', () => {
    const mainHeader = fixture.debugElement.query(By.css('.aiso-header-main'));
    expect(mainHeader).toBeTruthy();
  });

  it('debería contener el elemento con clase "aiso-header-stripe"', () => {
    const stripe = fixture.debugElement.query(By.css('.aiso-header-stripe'));
    expect(stripe).toBeTruthy();
  });

  it('debería mostrar el logo AISO usando el componente <p-image>', () => {
    const imageElement = fixture.debugElement.query(By.css('p-image'));
    expect(imageElement).toBeTruthy();

    // Verifica que la imagen tenga el atributo correcto
    const srcAttr = imageElement.attributes['src'];
    expect(srcAttr).toContain('sig_aiso_sig_aiso_b.png');
  });
});
