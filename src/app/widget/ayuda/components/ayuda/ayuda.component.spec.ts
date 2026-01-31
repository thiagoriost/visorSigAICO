import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AyudaComponent } from './ayuda.component';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AyudaComponent', () => {
  let component: AyudaComponent;
  let fixture: ComponentFixture<AyudaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AyudaComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AyudaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('inicialmente no debería mostrar el envío de correo ni la descarga manual', () => {
    expect(component.mostrarEnvioCorreo).toBeFalse();
    expect(component.mostrarDescargaManual).toBeFalse();
  });

  it('al activar toggleEnvioCorreo debería mostrar el envío de correo y ocultar descarga manual', () => {
    component.toggleEnvioCorreo();
    expect(component.mostrarEnvioCorreo).toBeTrue();
    expect(component.mostrarDescargaManual).toBeFalse();
  });

  it('al activar toggleDescargaManual debería mostrar la descarga manual y ocultar envío de correo', () => {
    component.toggleDescargaManual();
    expect(component.mostrarDescargaManual).toBeTrue();
    expect(component.mostrarEnvioCorreo).toBeFalse();
  });

  it('al llamar toggleEnvioCorreo dos veces debería alternar la visibilidad correctamente', () => {
    component.toggleEnvioCorreo(); // true, false
    component.toggleEnvioCorreo(); // false, false
    expect(component.mostrarEnvioCorreo).toBeFalse();
    expect(component.mostrarDescargaManual).toBeFalse();
  });

  it('al llamar toggleDescargaManual dos veces debería alternar la visibilidad correctamente', () => {
    component.toggleDescargaManual(); // false, true
    component.toggleDescargaManual(); // false, false
    expect(component.mostrarDescargaManual).toBeFalse();
    expect(component.mostrarEnvioCorreo).toBeFalse();
  });

  it('el template debería mostrar el componente de envío de correo solo cuando mostrarEnvioCorreo es true', () => {
    component.mostrarEnvioCorreo = true;
    component.mostrarDescargaManual = false;
    fixture.detectChanges();

    const envioCorreoElement: HTMLElement | null =
      fixture.debugElement.query(By.css('app-envio-correo'))?.nativeElement ||
      null;
    expect(envioCorreoElement).toBeTruthy();

    component.mostrarEnvioCorreo = false;
    fixture.detectChanges();

    const envioCorreoElementAfter: HTMLElement | null =
      fixture.debugElement.query(By.css('app-envio-correo'))?.nativeElement ||
      null;
    expect(envioCorreoElementAfter).toBeNull();
  });

  it('el template debería mostrar el componente de descarga manual solo cuando mostrarDescargaManual es true', () => {
    component.mostrarDescargaManual = true;
    component.mostrarEnvioCorreo = false;
    fixture.detectChanges();

    const descargaManualElement: HTMLElement | null =
      fixture.debugElement.query(By.css('app-descarga-manual'))
        ?.nativeElement || null;
    expect(descargaManualElement).toBeTruthy();

    component.mostrarDescargaManual = false;
    fixture.detectChanges();

    const descargaManualElementAfter: HTMLElement | null =
      fixture.debugElement.query(By.css('app-descarga-manual'))
        ?.nativeElement || null;
    expect(descargaManualElementAfter).toBeNull();
  });
});
