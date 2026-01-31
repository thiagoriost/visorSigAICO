import { Component, Input } from '@angular/core';
import { ImageModule } from 'primeng/image';

/**
 * @class LeftbarHeaderComponent
 * @description
 * Componente visual que representa el **encabezado fijo de la barra lateral izquierda (Leftbar)**
 * dentro del visor geográfico CRIC.
 *
 * Su función principal es mostrar la identidad visual (logotipo o marca institucional)
 * y servir como contenedor superior para elementos gráficos o informativos.
 *
 * Está diseñado para adaptarse de manera **responsive**, reaccionando a los estados:
 * - **Móvil (isMobile):** Ajusta el diseño para pantallas reducidas.
 * - **Minimizado (isMinimized):** Controla el modo colapsado de la barra lateral.
 *
 * No implementa lógica interna ni suscripciones; actúa únicamente como componente de presentación.
 *
 * @date 16-10-2025
 * @version 1.0.0
 * @author
 * Carlos Muñoz — IGAC (javier.munoz@igac.gov.co)
 *
 * @example
 * ```html
 * <!-- Ejemplo de uso dentro del layout lateral -->
 * <app-leftbar-header
 *   [isMobile]="true"
 *   [isMinimized]="false">
 * </app-leftbar-header>
 * ```
 */
@Component({
  selector: 'app-leftbar-header',
  standalone: true,
  imports: [ImageModule],
  templateUrl: './leftbar-header.component.html',
  styleUrl: './leftbar-header.component.scss',
})
export class LeftbarHeaderComponent {
  /**
   * @input isMobile
   * Indica si el componente se está mostrando en un **dispositivo móvil**.
   * Este valor permite aplicar estilos adaptativos o mostrar versiones simplificadas del encabezado.
   *
   * @type {boolean}
   * @default false
   * @example
   * ```html
   * <app-leftbar-header [isMobile]="true"></app-leftbar-header>
   * ```
   */
  @Input() isMobile = false;

  /**
   * @input isMinimized
   * Determina si la barra lateral está en **modo minimizado**.
   * Se utiliza para ajustar el tamaño del logotipo o su visibilidad dentro del encabezado.
   *
   * @type {boolean}
   * @default false
   * @example
   * ```html
   * <app-leftbar-header [isMinimized]="true"></app-leftbar-header>
   * ```
   */
  @Input() isMinimized = false;
}
