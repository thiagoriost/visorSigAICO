import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flushMicrotasks,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MessageService } from 'primeng/api';

// Componente y acciones
import { AuthLoginModalComponent } from './auth-login-modal.component';
import { AuthService } from '../../services/auth-http-service/auth.service';
import { loginSuccess } from '@app/core/store/auth/auth.actions';

// Interfaces
import { AuthState } from '@app/core/interfaces/auth/AuthStateInterface';
import { AuthUserInterface } from '@app/core/interfaces/auth/UserModel';
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';
import { AuthResult } from '@directus/sdk';

/** * Interfaz auxiliar para tipar errores personalizados
 * (Coincide con la lógica de getErrorMessage del componente)
 */
interface CustomError {
  message?: string;
  extensions?: { code: string };
}

/** Factory para crear usuarios mock sin repetir código */
const createMockUser = (): AuthUserInterface => ({
  id: 'u-test-001',
  email: 'test@igac.gov.co',
  first_name: 'Javier',
  last_name: 'Muñoz',
  status: 'active',
  role: 'user',
  provider: 'local',
  avatar: null,
  description: null,
  location: null,
  tags: null,
  title: null,
  tfa_secret: null,
  token: null,
  last_page: '/home',
  theme_light: null,
  theme_dark: null,
  theme_light_overrides: null,
  theme_dark_overrides: null,
  external_identifier: null,
  auth_data: null,
  appearance: null,
  email_notifications: true,
  language: 'es',
  Id_Comunidad: '',
  Id_rol_visor: '',
  password: '',
});

/** Factory para AuthResult */
const createAuthResult = (): AuthResult => ({
  access_token: 'fake-jwt-token',
  expires: 3600,
  refresh_token: 'fake-refresh-token',
});

describe('AuthLoginModalComponent', () => {
  let component: AuthLoginModalComponent;
  let fixture: ComponentFixture<AuthLoginModalComponent>;

  // Spies estrictamente tipados
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let store: MockStore<AuthState>;

  // Configuración inicial del Store
  const initialState = {
    auth: { user: null, loading: false, error: null },
  };

  // Configuración mock para el input requerido
  const mockConfig: AuthConfigInterface = {
    modalLogoUrl: 'assets/logo.png',
    textColor: 'text-primary',
    modalButtonText: 'Entrar',
    modalButtonColor: 'primary',
    modalButtonBorder: '',
  };

  beforeEach(async () => {
    // 1. Crear Spies con métodos específicos, incluyendo los mocks para modo demo
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'login',
      'loginMock', // Nuevo: para modo demo
      'loadUserData',
      'loadUserDataMock', // Nuevo: para modo demo
    ]);

    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', [
      'add',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AuthLoginModalComponent, // Standalone
        NoopAnimationsModule, // Importante para componentes de UI
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch'); // Espiamos el dispatch del store real inyectado

    fixture = TestBed.createComponent(AuthLoginModalComponent);
    component = fixture.componentInstance;

    // 2. Asignar Inputs requeridos antes de detectChanges
    component.config = mockConfig;
    component.visible = true;

    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('Validaciones del Formulario', () => {
    it('debe ser inválido cuando está vacío', () => {
      component.formGroup.reset();
      expect(component.formGroup.valid).toBeFalse();
    });

    it('debe validar formato de email incorrecto', () => {
      const emailControl = component.formGroup.get('email');
      emailControl?.setValue('correo-sin-formato');
      expect(emailControl?.valid).toBeFalse();
      expect(emailControl?.hasError('email')).toBeTrue();
    });

    it('debe ser válido con datos correctos', () => {
      component.formGroup.setValue({
        email: 'usuario@dominio.com',
        password: 'securePassword123',
      });
      expect(component.formGroup.valid).toBeTrue();
    });
  });

  describe('Interacción UI', () => {
    it('debe emitir visibleChange(false) al llamar onHide', () => {
      spyOn(component.visibleChange, 'emit');
      component.onHide();
      expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('Método submit()', () => {
    it('no debe llamar al servicio si el formulario es inválido', async () => {
      component.formGroup.setValue({ email: '', password: '' });
      await component.submit();

      expect(component.formGroup.touched).toBeTrue();
      expect(authServiceSpy.login).not.toHaveBeenCalled();
    });

    // ==========================================
    // ESCENARIO 1: Login Real (demo = false)
    // ==========================================
    it('debe ejecutar flujo de LOGIN REAL exitoso', async () => {
      component.demo = false;
      const mockUser = createMockUser();
      const mockAuthResult = createAuthResult();

      // Configurar retornos exitosos
      authServiceSpy.login.and.returnValue(Promise.resolve(mockAuthResult));
      authServiceSpy.loadUserData.and.returnValue(Promise.resolve(mockUser));

      spyOn(component.authenticated, 'emit');

      // Llenar formulario
      component.formGroup.setValue({ email: 'real@test.com', password: '123' });

      await component.submit();

      // Verificaciones
      expect(component.loading).toBeFalse();
      expect(authServiceSpy.login).toHaveBeenCalledWith('real@test.com', '123');
      expect(authServiceSpy.loadUserData).toHaveBeenCalled();

      // Verificar Store y Output
      expect(store.dispatch).toHaveBeenCalledWith(
        loginSuccess({ user: mockUser })
      );
      expect(component.authenticated.emit).toHaveBeenCalledWith(true);
      expect(component.formGroup.enabled).toBeTrue();
    });

    // ==========================================
    // ESCENARIO 2: Manejo de Errores
    // ==========================================
    it('debe manejar error API (401), mostrar Toast, resetear password y habilitar form', async () => {
      // Configuramos un error 401 que es el flujo más común de login
      const errorMock: CustomError = { message: '401 Unauthorized' };
      authServiceSpy.login.and.returnValue(Promise.reject(errorMock));

      component.formGroup.setValue({
        email: 'error@test.com',
        password: 'wrong',
      });
      component.formGroup.enable(); // Aseguramos que está habilitado antes de submit

      await component.submit();

      // El mensaje de error debe ser el mapeado en getErrorMessage para 401
      expect(component.errorApi).toBe('Usuario o clave no válidos.');
      expect(component.loading).toBeFalse();

      // El password debe resetearse a null (valor de reset)
      expect(component.formGroup.get('password')?.value).toBeNull();

      // El formulario debe volver a habilitarse en el bloque finally
      expect(component.formGroup.enabled).toBeTrue();

      // Verificar que se llamó al MessageService
      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({
          severity: 'error',
          summary: 'Error en autenticación',
          detail: 'Usuario o clave no válidos.',
        })
      );
    });
  });

  describe('Mapeo de Errores (getErrorMessage)', () => {
    // Usamos fakeAsync para manejar las promesas sincrónicamente
    it('debe mapear correctamente los códigos de error', fakeAsync(async () => {
      const testCases: { error: CustomError | unknown; expected: string }[] = [
        {
          error: { message: 'Failed to fetch' },
          expected:
            'No se pudo conectar con el servidor. Verifica tu conexión a Internet.',
        },
        {
          error: { message: '404 Not Found' },
          expected: 'El servicio no está disponible. Intenta más tarde.',
        },
        {
          error: { message: '500 Internal Server Error' },
          expected: 'Hubo un problema en el servidor. Intenta más tarde.',
        },
        {
          error: {
            extensions: { code: 'FORBIDDEN' },
            message: '403 Forbidden',
          },
          expected: 'No tienes permisos para realizar esta acción.',
        },
        {
          error: {
            message: '401 Unauthorized',
          },
          expected: 'Usuario o clave no válidos.',
        },
        {
          error: {}, // Error vacío desconocido
          expected: 'Ocurrió un error inesperado. Intenta nuevamente.',
        },
      ];

      for (const test of testCases) {
        // Configuramos el rechazo para la iteración actual
        authServiceSpy.login.and.returnValue(Promise.reject(test.error));
        component.formGroup.setValue({ email: 't@t.com', password: 'p' });
        component.formGroup.enable(); // Aseguramos que el formulario está listo

        // Ejecutamos la función asíncrona
        await component.submit();

        // Resolvemos las microtareas (el catch y el finally) de la Promise
        flushMicrotasks();

        // Verificamos
        expect(component.errorApi)
          .withContext(`Fallo con error: ${JSON.stringify(test.error)}`)
          .toBe(test.expected);
      }
    }));
  });
});
