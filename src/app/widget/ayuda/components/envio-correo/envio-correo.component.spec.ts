import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { EnvioCorreoComponent } from './envio-correo.component';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AyudaService } from '@app/widget/ayuda/services/ayuda.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

interface RespuestaServidor {
  status: string;
  message: string;
}

describe('EnvioCorreoComponent', () => {
  let component: EnvioCorreoComponent;
  let fixture: ComponentFixture<EnvioCorreoComponent>;
  let ayudaServiceSpy: jasmine.SpyObj<AyudaService>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj<AyudaService>('AyudaService', [
      'enviarFormulario',
    ]);

    await TestBed.configureTestingModule({
      imports: [EnvioCorreoComponent, HttpClientTestingModule],
      providers: [{ provide: AyudaService, useValue: spy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EnvioCorreoComponent);
    component = fixture.componentInstance;
    ayudaServiceSpy = TestBed.inject(
      AyudaService
    ) as jasmine.SpyObj<AyudaService>;
    httpTestingController = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería limpiar el formulario correctamente', () => {
    component.formData = {
      nombre: 'Juan',
      email: 'juan@mail.com',
      asunto: 'Asunto',
      comentarios: 'Comentarios',
    };
    component.limpiarFormulario();
    expect(component.formData).toEqual({
      nombre: '',
      email: '',
      asunto: '',
      comentarios: '',
    });
    expect(component.mensajeError).toBeNull();
  });

  it('debería enviar el formulario y manejar la respuesta exitosa', fakeAsync(() => {
    component.formData = {
      nombre: 'Ana',
      email: 'ana@mail.com',
      asunto: 'Consulta',
      comentarios: 'Esto es un comentario',
    };

    const respuestaMock: RespuestaServidor = {
      status: 'success',
      message: 'ok',
    };

    ayudaServiceSpy.enviarFormulario.and.returnValue(of(respuestaMock));

    spyOn(window, 'alert'); // No se usa, pero lo espías por seguridad
    const spyLog = spyOn(console, 'log');

    spyOn(component, 'esFormularioValido').and.returnValue(true);

    component.enviarFormulario();

    tick(); // Avanza el tiempo del observable

    expect(ayudaServiceSpy.enviarFormulario).toHaveBeenCalledWith(
      'Ana',
      'ana@mail.com',
      'Consulta',
      'Esto es un comentario'
    );

    expect(component.cargando).toBeFalse();
    expect(component.enviadoExitosamente).toBeTrue();
    expect(window.alert).not.toHaveBeenCalled();

    expect(spyLog).toHaveBeenCalledWith('respuesta servidor', {
      status: 'success',
      message: 'ok',
    });

    expect(component.formData).toEqual({
      nombre: '',
      email: '',
      asunto: '',
      comentarios: '',
    });
  }));

  it('debería manejar error al enviar el formulario', fakeAsync(() => {
    component.formData = {
      nombre: 'Luis',
      email: 'luis@mail.com',
      asunto: 'Problema',
      comentarios: 'Error al enviar',
    };

    const errorResponse = { status: 500, statusText: 'Server Error' };

    ayudaServiceSpy.enviarFormulario.and.returnValue(
      throwError(() => errorResponse)
    );

    spyOn(window, 'alert');
    spyOn(console, 'error');

    spyOn(component, 'esFormularioValido').and.returnValue(true);

    component.enviarFormulario();

    tick();

    expect(component.cargando).toBeFalse();
    expect(component.mensajeError).toBe(
      component.getErrorMessage(errorResponse)
    );
    expect(window.alert).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Error al enviar formulario:',
      errorResponse
    );
  }));

  describe('insertarLinkPersonalizado', () => {
    it('debería insertar un enlace con texto seleccionado', () => {
      // Crear mock para Quill
      const mockQuill = jasmine.createSpyObj('quill', [
        'getSelection',
        'formatText',
        'insertText',
      ]);
      mockQuill.getSelection.and.returnValue({ index: 5, length: 4 });

      component.editor = {
        quill: mockQuill,
      } as unknown as typeof component.editor;

      spyOn(window, 'prompt').and.returnValue('https://angular.io');

      component.insertarLinkPersonalizado();

      expect(mockQuill.formatText).toHaveBeenCalledWith(
        5,
        4,
        'link',
        'https://angular.io'
      );
      expect(mockQuill.insertText).not.toHaveBeenCalled();
    });

    it('debería insertar un enlace sin texto seleccionado', () => {
      const mockQuill = jasmine.createSpyObj('quill', [
        'getSelection',
        'formatText',
        'insertText',
      ]);
      mockQuill.getSelection.and.returnValue({ index: 10, length: 0 });

      component.editor = {
        quill: mockQuill,
      } as unknown as typeof component.editor;

      spyOn(window, 'prompt').and.returnValue('https://openai.com');

      component.insertarLinkPersonalizado();

      expect(mockQuill.insertText).toHaveBeenCalledWith(
        10,
        'https://openai.com',
        'link',
        'https://openai.com'
      );
      expect(mockQuill.formatText).not.toHaveBeenCalled();
    });

    it('no debería hacer nada si no se ingresa URL', () => {
      const mockQuill = jasmine.createSpyObj('quill', [
        'getSelection',
        'formatText',
        'insertText',
      ]);
      mockQuill.getSelection.and.returnValue({ index: 0, length: 5 });

      component.editor = {
        quill: mockQuill,
      } as unknown as typeof component.editor;

      spyOn(window, 'prompt').and.returnValue(null);

      component.insertarLinkPersonalizado();

      expect(mockQuill.formatText).not.toHaveBeenCalled();
      expect(mockQuill.insertText).not.toHaveBeenCalled();
    });

    it('no debería hacer nada si no hay selección ni editor', () => {
      component.editor = undefined;

      expect(() => component.insertarLinkPersonalizado()).not.toThrow();
    });
  });

  it('debería validar el formulario y marcar controles como tocados', () => {
    // Simular controles
    const mockControls: Record<string, { markAsTouched: jasmine.Spy }> = {
      nombre: { markAsTouched: jasmine.createSpy('markAsTouched') },
      email: { markAsTouched: jasmine.createSpy('markAsTouched') },
    };

    // Asignar comentarioForm con controles simulados y validación
    component.comentarioForm = {
      controls: mockControls,
      valid: true,
    } as unknown as typeof component.comentarioForm;

    const resultado = component.esFormularioValido();

    expect(mockControls['nombre'].markAsTouched).toHaveBeenCalled();
    expect(mockControls['email'].markAsTouched).toHaveBeenCalled();
    expect(resultado).toBeTrue();
  });

  it('getErrorMessage debería devolver mensaje correcto según error', () => {
    const erroresYMensajes: { error: unknown; esperado: string }[] = [
      {
        error: { message: 'Failed to fetch' },
        esperado:
          'No se pudo conectar con el servidor. Verifica tu conexión a Internet.',
      },
      {
        error: { statusText: 'Not Found' },
        esperado: 'El servicio de envío no está disponible. Intenta más tarde.',
      },
      {
        error: { message: 'Forbidden' },
        esperado: 'No tienes permisos para enviar este formulario.',
      },
      {
        error: { message: 'Bad Request' },
        esperado:
          'Los datos del formulario no son válidos. Verifica e intenta nuevamente.',
      },
      {
        error: { message: 'Internal Server Error' },
        esperado:
          'Hubo un problema en el servidor. Por favor, intenta más tarde.',
      },
      {
        error: { message: 'Error desconocido' },
        esperado:
          'Ocurrió un error inesperado. Intenta más tarde o contacta soporte.',
      },
    ];

    for (const { error, esperado } of erroresYMensajes) {
      expect(component.getErrorMessage(error)).toBe(esperado);
    }
  });
});
