import { Component } from '@angular/core';
import { EnvioCorreoComponent } from '../envio-correo/envio-correo.component';
import { DescargaManualComponent } from '../descarga-manual/descarga-manual.component';
import { ButtonModule } from 'primeng/button';

/**
 * Componente encargado de mostrar las opciones de ayuda disponibles para el usuario,
 * como el envío de un correo de soporte o la descarga de un manual de usuario.
 * Permite alternar entre la visualización del componente de envío de correo
 * y el componente de descarga del manual, asegurando que solo uno esté visible a la vez.
 *
 * Este componente es independiente (standalone) y utiliza `NgIf` para el control
 * de visibilidad condicional, y `ButtonModule` de PrimeNG para los botones de acción.
 *
 * @author [Tu nombre]
 * @date 15-05-2025
 * @version 1.0.0
 */
@Component({
  selector: 'app-ayuda', // Selector HTML del componente
  standalone: true, // Componente independiente (no necesita declaración en un módulo)
  imports: [EnvioCorreoComponent, DescargaManualComponent, ButtonModule], // Módulos y componentes importados
  templateUrl: './ayuda.component.html', // Ruta de la plantilla HTML
  styleUrl: './ayuda.component.scss', // Ruta de los estilos del componente
})
export class AyudaComponent {
  // Indica si el componente de envío de correo debe mostrarse
  mostrarEnvioCorreo = false;

  // Indica si el componente de descarga de manual debe mostrarse
  mostrarDescargaManual = false;

  /**
   * Alterna la visualización del componente de envío de correo.
   * Si se activa esta opción, se oculta el componente de descarga del manual.
   */
  toggleEnvioCorreo(): void {
    this.mostrarEnvioCorreo = !this.mostrarEnvioCorreo;
    this.mostrarDescargaManual = false;
  }

  /**
   * Alterna la visualización del componente de descarga del manual.
   * Si se activa esta opción, se oculta el componente de envío de correo.
   */
  toggleDescargaManual(): void {
    this.mostrarDescargaManual = !this.mostrarDescargaManual;
    this.mostrarEnvioCorreo = false;
  }
}
