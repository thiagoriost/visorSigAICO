import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DescargaManualComponent } from './descarga-manual.component';
import { AyudaService } from '@app/widget/ayuda/services/ayuda.service';
import { environment } from 'environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DescargaManualComponent', () => {
  let component: DescargaManualComponent;
  let fixture: ComponentFixture<DescargaManualComponent>;
  let ayudaService: AyudaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescargaManualComponent, HttpClientTestingModule],
      providers: [AyudaService],
    }).compileComponents();

    fixture = TestBed.createComponent(DescargaManualComponent);
    component = fixture.componentInstance;
    ayudaService = TestBed.inject(AyudaService);
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a downloadPDF del servicio cuando se descarga el manual', () => {
    // Espía que simula que downloadPDF devuelve una promesa resuelta
    const downloadPDFSpy = spyOn(ayudaService, 'downloadPDF').and.returnValue(
      Promise.resolve()
    );

    component.descargarManual();

    expect(downloadPDFSpy).toHaveBeenCalledOnceWith(
      environment.ayuda.urlManual,
      environment.ayuda.nombreManual
    );
  });

  it('debería manejar y asignar mensaje de error en caso de fallo en la descarga (Failed to fetch)', fakeAsync(() => {
    const error = new Error('Failed to fetch');

    spyOn(ayudaService, 'downloadPDF').and.returnValue(Promise.reject(error));

    component.descargarManual();
    tick(); // Simula el paso del tiempo para resolver la promesa rechazada

    expect(component.mensajeError).toBe(
      'No se pudo conectar con el servidor para descargar el manual. Verifica tu conexión a Internet o intenta más tarde.'
    );
  }));

  it('debería manejar y asignar mensaje de error en caso de fallo 404 (Not Found)', fakeAsync(() => {
    const error = new Error('404 Not Found');

    spyOn(ayudaService, 'downloadPDF').and.returnValue(Promise.reject(error));

    component.descargarManual();
    tick();

    expect(component.mensajeError).toBe(
      'El manual no se encuentra disponible en este momento. Por favor, intenta más tarde o contacta al soporte.'
    );
  }));

  it('debería manejar y asignar mensaje de error en caso de fallo 403 (Forbidden)', fakeAsync(() => {
    const error = new Error('403 Forbidden');

    spyOn(ayudaService, 'downloadPDF').and.returnValue(Promise.reject(error));

    component.descargarManual();
    tick();

    expect(component.mensajeError).toBe(
      'No tienes permisos para acceder al manual. Contacta con el administrador del sistema.'
    );
  }));

  it('debería manejar y asignar mensaje de error en caso de fallo 400 (Bad Request)', fakeAsync(() => {
    const error = new Error('400 Bad Request');

    spyOn(ayudaService, 'downloadPDF').and.returnValue(Promise.reject(error));

    component.descargarManual();
    tick();

    expect(component.mensajeError).toBe(
      'La solicitud de descarga del manual es inválida. Verifica la configuración del sistema.'
    );
  }));

  it('debería manejar y asignar mensaje de error en caso de fallo 500 (Internal Server Error)', fakeAsync(() => {
    const error = new Error('500 Internal Server Error');

    spyOn(ayudaService, 'downloadPDF').and.returnValue(Promise.reject(error));

    component.descargarManual();
    tick();

    expect(component.mensajeError).toBe(
      'El servidor encontró un error inesperado al intentar descargar el manual. Intenta nuevamente más tarde.'
    );
  }));

  it('debería manejar y asignar un mensaje de error genérico para otros errores', fakeAsync(() => {
    const error = new Error('Error desconocido');

    spyOn(ayudaService, 'downloadPDF').and.returnValue(Promise.reject(error));

    component.descargarManual();
    tick();

    expect(component.mensajeError).toBe(
      'Ocurrió un error al intentar descargar el manual. Por favor, intenta más tarde.'
    );
  }));

  it('el método getErrorMessage debería devolver mensajes adecuados según el error', () => {
    // Mensajes específicos para cada tipo de error
    expect(component.getErrorMessage(new Error('Failed to fetch'))).toContain(
      'No se pudo conectar'
    );
    expect(component.getErrorMessage(new Error('404 Not Found'))).toContain(
      'El manual no se encuentra'
    );
    expect(component.getErrorMessage(new Error('403 Forbidden'))).toContain(
      'No tienes permisos'
    );
    expect(component.getErrorMessage(new Error('400 Bad Request'))).toContain(
      'La solicitud de descarga'
    );
    expect(
      component.getErrorMessage(new Error('500 Internal Server Error'))
    ).toContain('El servidor encontró');
    expect(component.getErrorMessage(new Error('Error desconocido'))).toContain(
      'Ocurrió un error'
    );
  });
});
