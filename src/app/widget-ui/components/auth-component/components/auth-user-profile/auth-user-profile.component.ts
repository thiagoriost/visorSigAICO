import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { Store } from '@ngrx/store';
import { selectUser } from '@app/core/store/auth/auth.selectors';
import { AuthUserInterface } from '@app/core/interfaces/auth/UserModel';
import { Observable, Subject } from 'rxjs';
import { logout } from '@app/core/store/auth/auth.actions';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { AuthService } from '@app/widget-ui/components/auth-component/services/auth-http-service/auth.service';
import { CardUserProfileComponent } from '../card-user-profile/card-user-profile.component';
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';

/**
 * @description Componente encargado de mostrar la información del usuario autenticado.
 *
 * Funcionalidades principales:
 * - Visualizar datos básicos del perfil del usuario.
 * - Presentar un menú de acciones como cerrar sesión.
 *
 * Este componente se renderiza únicamente cuando existe una sesión activa.
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
 * @class AuthUserProfileComponent
 */
@Component({
  selector: 'app-auth-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    PopoverModule,
    CardUserProfileComponent,
  ],
  templateUrl: './auth-user-profile.component.html',
  styleUrl: './auth-user-profile.component.scss',
})
export class AuthUserProfileComponent implements OnDestroy {
  /** Configuración visual y funcional del componente */
  @Input({ required: true }) config!: AuthConfigInterface;

  /** Indica si el componente opera en modo demo (mock sin backend) */
  @Input() demo = true;

  /** Observable que expone el usuario autenticado desde el store */
  user$: Observable<AuthUserInterface | undefined>;

  /** Subject utilizado para controlar la destrucción de suscripciones */
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private authService: AuthService
  ) {
    // Obtiene el observable del usuario desde el store global
    this.user$ = this.store.select(selectUser);
  }

  /**
   * Hook de destrucción del componente.
   * Libera todas las suscripciones abiertas emitiendo y completando el Subject.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cierra la sesión del usuario autenticado.
   *
   * Comportamiento:
   * - En modo demo ejecuta `logoutMock()`.
   * - En modo real ejecuta `logout()` contra backend.
   * - Finalmente despacha la acción `logout()` para limpiar el estado global.
   *
   * @returns Promise<void> Para permitir async/await desde el template o llamadas externas.
   */
  async onLogout(): Promise<void> {
    if (this.demo) {
      // Cierra sesión sin backend (modo demo)
      await this.authService.logoutMock();
    } else {
      // Cierra sesión real con servicios remotos
      await this.authService.logout();
    }

    // Actualiza el store indicando que la sesión se cerró
    this.store.dispatch(logout());
  }
}
