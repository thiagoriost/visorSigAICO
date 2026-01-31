import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { selectIsAuthenticated } from '@app/core/store/auth/auth.selectors';
import { AuthLoginComponent } from '@app/widget-ui/components/auth-component/components/auth-login/auth-login.component';
import { AuthUserProfileComponent } from '@app/widget-ui/components/auth-component/components/auth-user-profile/auth-user-profile.component';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';

/**
 * @description
 * Componente contenedor encargado de administrar el estado de autenticación del usuario.
 * Se suscribe al store de NgRx para identificar si hay sesión activa y, según ello,
 * muestra el formulario de login (`AuthLoginComponent`) o el perfil del usuario (`AuthUserProfileComponent`).
 *
 * Este componente también recibe configuración visual y de comportamiento a través de `AuthConfigInterface`.
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
 * @class AuthContainerComponent
 */
@Component({
  selector: 'app-auth-container',
  standalone: true,
  imports: [
    CommonModule,
    AuthLoginComponent,
    AuthUserProfileComponent,
    Button,
    Popover,
  ],
  templateUrl: './auth-container.component.html',
  styleUrl: './auth-container.component.scss',
})
export class AuthContainerComponent implements OnDestroy {
  /**
   * @description Configuración personalizada para la UI, textos y estilos del módulo de autenticación.
   */
  @Input({ required: true }) config!: AuthConfigInterface;

  /**
   * @description Indica si el módulo se está ejecutando en modo demo.
   * Permite comportamientos diferenciados sin afectar la lógica base.
   */
  @Input() isDemoVersion = true;

  /**
   * @description Define si está renderizándose en versión móvil para adaptar estilos o layouts.
   */
  @Input() isMobileVersion = false;

  /**
   * @description Icono mostrado en el botón o avatar del usuario.
   */
  @Input() userIcon = 'pi pi-user';

  /**
   * @description Observable proveniente del store que emite `true` cuando el usuario está autenticado.
   */
  isAuthenticated$: Observable<boolean>;

  /**
   * @description Subject utilizado para manejar destrucción de suscripciones.
   * Se completa en `ngOnDestroy()` para evitar fugas de memoria.
   */
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {
    // Inicializa el observable seleccionando el estado de autenticación
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  /**
   * @description
   * Destruye el Subject `destroy$` para prevenir fugas de memoria por suscripciones abiertas.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
