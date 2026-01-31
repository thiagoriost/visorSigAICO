import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AuthLoginModalComponent } from '@app/widget-ui/components/auth-component/components/auth-login-modal/auth-login-modal.component';
import { ButtonModule } from 'primeng/button';
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';

/**
 * @description
 * Componente encargado de gestionar el inicio de sesión del usuario.
 *
 * Renderiza el botón de acceso y controla la apertura del modal de autenticación
 * (`AuthLoginModalComponent`). Este modal contiene el formulario de login real.
 *
 * Funcionalidades principales:
 * - Mostrar/ocultar el modal de autenticación.
 * - Recibir configuración visual y operativa mediante `AuthConfigInterface`.
 * - Permitir modo demo, simulando la comunicación con la API mediante datos mock.
 *
 * Este componente se utiliza cuando el usuario **no** está autenticado.
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
 * @class AuthLoginComponent
 */
@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, AuthLoginModalComponent, ButtonModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss',
})
export class AuthLoginComponent {
  /**
   * @description Configuración personalizada para textos, estilos, colores e iconos.
   */
  @Input({ required: true }) config!: AuthConfigInterface;

  /**
   * @description Modo demo que permite emular una autenticación sin conectarse a Directus.
   */
  @Input() demo = false;

  /**
   * @description Indica si el componente debe comportarse bajo la versión móvil.
   */
  @Input() isMobileVersion = false;

  /**
   * @description Controla la visibilidad del modal de autenticación.
   */
  showModal = false;

  /**
   * @description Evento invocado cuando la autenticación fue exitosa.
   * Cierra el modal de login.
   */
  onAuthenticated() {
    this.showModal = false; // Oculta el modal al autenticarse
  }

  /**
   * @description Abre el modal de autenticación.
   */
  showDialog() {
    this.showModal = true; // Muestra el modal al presionar el botón de login
  }
}
