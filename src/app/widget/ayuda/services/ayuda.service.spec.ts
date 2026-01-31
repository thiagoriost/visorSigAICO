import { TestBed, waitForAsync } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AyudaService } from './ayuda.service';
import { environment } from 'environments/environment';

describe('AyudaService', () => {
  let service: AyudaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AyudaService],
    });

    service = TestBed.inject(AyudaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería enviar un formulario con los datos correctos', () => {
    const nombre = 'Juan';
    const email = 'juan@ejemplo.com';
    const asunto = 'Sugerencia';
    const comentarios = 'Me gusta el sistema';
    const url = environment.ayuda.urlSolicitudPost;

    service
      .enviarFormulario(nombre, email, asunto, comentarios)
      .subscribe(respuesta => {
        expect(respuesta).toBeTruthy();
      });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');

    const bodyEsperado = {
      copiaCorreo: email,
      Asunto: asunto,
      MensajeUsuario: jasmine.stringMatching(/Buen día Juan/),
      MensajeAdmin: jasmine.stringMatching(/Nombre del Usuario: Juan/),
    };

    expect(req.request.body).toEqual(jasmine.objectContaining(bodyEsperado));

    req.flush({ ok: true });
  });

  it('debería llamar a downloadPDF del servicio cuando se descarga el manual', () => {
    const spyDownloadPDF = spyOn(service, 'downloadPDF').and.returnValue(
      Promise.resolve()
    );

    service.downloadManual();

    const urlEsperada =
      '/opiac-branding/SIG_OPIAC_MUW_VISOR_V_1.0_04082025_slim.pdf';
    const nombreArchivoEsperado = 'manual.pdf';

    expect(spyDownloadPDF).toHaveBeenCalledTimes(1);
    expect(spyDownloadPDF).toHaveBeenCalledWith(
      urlEsperada,
      nombreArchivoEsperado
    );
  });

  it('debería manejar el error si la descarga del PDF falla', waitForAsync(async () => {
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)
    );

    try {
      await service.downloadManual();
      fail('La descarga debería haber fallado y lanzado un error');
    } catch (error: unknown) {
      expect(error).toBeTruthy();
    }
  }));
});
