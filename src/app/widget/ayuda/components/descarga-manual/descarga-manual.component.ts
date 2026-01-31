import { Component } from '@angular/core';
import { environment } from 'environments/environment';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AyudaService } from '@app/widget/ayuda/services/ayuda.service';
import { CommonModule } from '@angular/common';
/**
 * Componente encargado de gestionar la descarga del manual de usuario en formato PDF.
 * Utiliza el servicio `AyudaService` para realizar la descarga del archivo desde una URL definida
 * en las variables de entorno. La acción se dispara al hacer clic en un botón de descarga.
 *
 * Este componente es independiente (standalone) y emplea `ButtonModule` y `MessageModule` de PrimeNG
 * para la interfaz del botón de descarga y la visualización de mensajes de error.
 *
 * @author Carlos Alberto Aristizabal Vargas
 * @date 15-05-2025
 * @version 1.1.0
 */
@Component({
  selector: 'app-descarga-manual',
  standalone: true,
  imports: [CommonModule, ButtonModule, MessageModule],
  templateUrl: './descarga-manual.component.html',
  styleUrl: './descarga-manual.component.scss',
})
export class DescargaManualComponent {
  mensajeError: string | null = null;

  /**
   * Constructor que inyecta el servicio `AyudaService` utilizado para la descarga del archivo.
   * @param ayudaService Servicio que contiene la lógica de descarga del archivo PDF.
   */
  constructor(private ayudaService: AyudaService) {}

  /**
   * Método encargado de descargar el manual de usuario.
   * Llama al servicio `AyudaService.downloadPDF` con la URL del manual definida
   * en el archivo de entorno y el nombre de archivo deseado.
   * Si ocurre un error, muestra un mensaje informativo.
   */
  descargarManual(): void {
    this.ayudaService
      .downloadPDF(environment.ayuda.urlManual, environment.ayuda.nombreManual)
      .catch((error: Error) => {
        this.mensajeError = this.getErrorMessage(error);
      });
  }

  /**
   * Método que interpreta y devuelve un mensaje de error legible para el usuario,
   * específicamente relacionado con la descarga del manual de usuario.
   *
   * @param error Objeto de tipo `Error` recibido al fallar la descarga.
   * @returns Mensaje descriptivo del error para mostrar al usuario.
   */
  public getErrorMessage(error: Error): string {
    const mensaje = error.message || '';

    if (
      mensaje.includes('Failed to fetch') ||
      mensaje.includes('NetworkError')
    ) {
      return 'No se pudo conectar con el servidor para descargar el manual. Verifica tu conexión a Internet o intenta más tarde.';
    }

    if (mensaje.includes('404') || mensaje.includes('Not Found')) {
      return 'El manual no se encuentra disponible en este momento. Por favor, intenta más tarde o contacta al soporte.';
    }

    if (mensaje.includes('403') || mensaje.includes('Forbidden')) {
      return 'No tienes permisos para acceder al manual. Contacta con el administrador del sistema.';
    }

    if (mensaje.includes('400') || mensaje.includes('Bad Request')) {
      return 'La solicitud de descarga del manual es inválida. Verifica la configuración del sistema.';
    }

    if (mensaje.includes('500') || mensaje.includes('Internal Server Error')) {
      return 'El servidor encontró un error inesperado al intentar descargar el manual. Intenta nuevamente más tarde.';
    }

    return 'Ocurrió un error al intentar descargar el manual. Por favor, intenta más tarde.';
  }
}
