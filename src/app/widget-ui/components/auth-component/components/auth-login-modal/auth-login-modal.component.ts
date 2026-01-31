import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ImageModule } from 'primeng/image';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthState } from '@app/core/interfaces/auth/AuthStateInterface';
import { Store } from '@ngrx/store';
import { AuthService } from '../../services/auth-http-service/auth.service';
import { AuthUserInterface } from '@app/core/interfaces/auth/UserModel';
import { loginSuccess } from '@app/core/store/auth/auth.actions';
import { Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';

/**
 * @description
 * Modal encargado de gestionar el proceso de autenticación del usuario.
 *
 * Incluye:
 * - Formulario reactivo con validaciones básicas.
 * - Integración con el servicio de autenticación real o modo demo.
 * - Manejo de `NgRx Store` al despachar la acción de login exitoso.
 * - Mensajería de error mediante `MessageService`.
 *
 * El modal se abre desde `AuthLoginComponent` y se utiliza cuando el usuario
 * no está autenticado.
 *

 * @author
 * javier.munoz@igac.gov.co y Heidy Paola Lopez Sanchez
 *
 * @version
 * 1.0.0
 *
 * @since
 * 10/12/2025
 * 
 * @class AuthLoginModalComponent
 */
@Component({
  selector: 'app-auth-login-modal',
  standalone: true,
  imports: [
    CommonModule,
    Dialog,
    ReactiveFormsModule,
    ImageModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './auth-login-modal.component.html',
  styleUrl: './auth-login-modal.component.scss',
})
export class AuthLoginModalComponent implements OnDestroy {
  // ============================= Inputs / Outputs =============================

  /**
   * @description Configuración personalizada para colores, textos y estilos.
   */
  @Input({ required: true }) config!: AuthConfigInterface;

  /**
   * @description Controla la visibilidad del modal. Utilizado con two-way binding: [(visible)].
   */
  @Input({ required: true }) visible = false;

  /**
   * @description Habilita el modo demo, donde se usan datos mock en vez de la API real.
   */
  @Input() demo = false;

  /**
   * @description Emite cambios en la visibilidad del modal.
   */
  @Output() visibleChange = new EventEmitter<boolean>();

  /**
   * @description Emite `true` cuando el usuario se autentica correctamente.
   */
  @Output() authenticated = new EventEmitter<boolean>();

  // ============================= Internal State =============================

  /**
   * @description Subject utilizado para limpiar subscripciones en el ciclo de vida (takeUntil).
   */
  private destroy$ = new Subject<void>();

  /**
   * @description Formulario reactivo que contiene email y password.
   */
  formGroup: FormGroup;

  /**
   * @description Mensaje de error retornado por la API o proceso local.
   */
  errorApi: string | null = null;

  /**
   * @description Indica si se está ejecutando el proceso de login.
   */
  loading = false;

  /**
   * @description Constructor del componente. Inicializa inyección de dependencias
   * y construcción del formulario reactivo.
   *
   * @param formBuilder Creador de formularios reactivos.
   * @param store Estado global de la aplicación mediante NgRx.
   * @param authService Servicio encargado de autenticar y obtener datos del usuario.
   * @param messageService Servicio para mostrar mensajes visuales (toast).
   */
  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AuthState>,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    // Inicialización del formulario con validaciones
    this.formGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  /**
   * @description Hook de destrucción del componente.
   * Emite y completa el Subject para liberar subscripciones activas.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * @description Maneja el cierre del modal. Emite `false` en visibleChange.
   */
  onHide() {
    this.visibleChange.emit(false);
  }

  /**
   * @description
   * Envía las credenciales del formulario para procesar el inicio de sesión.
   *
   * Flujo:
   * - Valida el formulario.
   * - Deshabilita el formulario y activa loading.
   * - Ejecuta login con API o mock según `demo`.
   * - Carga datos de usuario.
   * - Despacha loginSuccess al Store.
   * - Emite el evento authenticated.
   * - Maneja errores y los muestra al usuario.
   *
   * @returns Promesa que finaliza cuando termina el proceso completo.
   */
  async submit() {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.formGroup.disable(); // Evita cambios mientras se hace login

    try {
      if (this.demo) {
        // ==================== MODO DEMO ====================
        await this.authService.loginMock(this.formGroup.get('email')?.value);

        const userData: AuthUserInterface =
          (await this.authService.loadUserDataMock()) as AuthUserInterface;

        this.store.dispatch(loginSuccess({ user: userData }));
        this.authenticated.emit(true);
      } else {
        // ==================== LOGIN REAL ====================
        await this.authService.login(
          this.formGroup.get('email')?.value,
          this.formGroup.get('password')?.value
        );

        const userData: AuthUserInterface =
          (await this.authService.loadUserData()) as AuthUserInterface;

        this.store.dispatch(loginSuccess({ user: userData }));
        this.authenticated.emit(true);
      }
    } catch (error) {
      const mensajeError = this.getErrorMessage(error);
      this.errorApi = mensajeError;

      // reset solo del password como medida de seguridad
      this.formGroup.get('password')?.reset();

      // Toast de error
      this.messageService.add({
        severity: 'error',
        summary: 'Error en autenticación',
        detail: mensajeError,
      });
    } finally {
      // Limpieza siempre ejecutada
      this.loading = false;
      this.formGroup.enable();
    }
  }

  /**
   * @description
   * Devuelve un mensaje claro y legible en función del error recibido,
   * basado en códigos HTTP y patrones comunes de fallos de red.
   *
   * @param error Error recibido desde try/catch o la API.
   * @returns Mensaje de error humanizado.
   */
  private getErrorMessage(error: unknown): string {
    const err = error as Partial<{
      message: string;
      extensions: { code: string };
    }>;

    const mensaje = err.message || err.extensions?.code || '';

    // Manejo de errores comunes
    if (
      mensaje.includes('Failed to fetch') ||
      mensaje.includes('NetworkError')
    ) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a Internet.';
    }

    if (mensaje.includes('404') || mensaje.includes('Not Found')) {
      return 'El servicio no está disponible. Intenta más tarde.';
    }

    if (mensaje.includes('403') || mensaje.includes('Forbidden')) {
      return 'No tienes permisos para realizar esta acción.';
    }

    if (mensaje.includes('400') || mensaje.includes('Bad Request')) {
      return 'Los datos del formulario no son válidos.';
    }

    if (mensaje.includes('500') || mensaje.includes('Internal Server Error')) {
      return 'Hubo un problema en el servidor. Intenta más tarde.';
    }

    // 401 Unauthorized
    if (mensaje.includes('401')) {
      return mensaje.includes('Unauthorized')
        ? 'Usuario o clave no válidos.'
        : mensaje;
    }

    // Otros mensajes conocidos
    if (mensaje) return mensaje;

    // Mensaje genérico
    return 'Ocurrió un error inesperado. Intenta nuevamente.';
  }
}
