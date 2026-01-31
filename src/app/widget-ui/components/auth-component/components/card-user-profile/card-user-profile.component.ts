import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AuthUserInterface } from '@app/core/interfaces/auth/UserModel';
import { CommonModule } from '@angular/common';
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';

/**
 * @description Tarjeta encargada de mostrar la información básica del usuario autenticado,
 * incluyendo:
 * - Avatar del usuario.
 * - Nombre, correo o comunidad (según modelo disponible).
 * - Botón para cerrar sesión.
 *
 * Este componente actúa como pieza visual dentro de un contenedor de autenticación.
 * No realiza lógica de negocio; únicamente emite eventos al componente padre.
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
 * @class CardUserProfileComponent
 */
@Component({
  selector: 'app-card-user-profile',
  imports: [AvatarModule, ButtonModule, DividerModule, CommonModule],
  templateUrl: './card-user-profile.component.html',
  styleUrl: './card-user-profile.component.scss',
})
export class CardUserProfileComponent {
  /** Configuración visual del componente (colores, bordes, textos). */
  @Input({ required: true }) config!: AuthConfigInterface;

  /** Información del usuario autenticado que se mostrará en la tarjeta. */
  @Input({ required: true }) user!: AuthUserInterface;

  /** Evento emitido al solicitar cerrar sesión desde la tarjeta. */
  @Output() logoutEvent = new EventEmitter<void>();

  /**
   * Emite el evento de cierre de sesión hacia el componente padre.
   * Este método no ejecuta lógica adicional, solo delega la acción.
   */
  cerrarSesion() {
    this.logoutEvent.emit();
  }
}
