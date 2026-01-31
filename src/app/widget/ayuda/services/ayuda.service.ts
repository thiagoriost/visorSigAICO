import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

/**
 * Servicio encargado de gestionar acciones relacionadas con la ayuda y soporte del sistema.
 * Incluye métodos para enviar formularios de contacto al backend y descargar manuales en PDF.
 *
 * Proporcionado en la raíz de la aplicación (`providedIn: 'root'`), disponible globalmente.
 *
 * Utiliza `HttpClient` para solicitudes HTTP y `fetch` para descargas de archivos.
 *
 * @author Carlos
 * @date 15-05-2025
 * @version 1.1.0
 */
@Injectable({
  providedIn: 'root',
})
export class AyudaService {
  constructor(private http: HttpClient) {}

  /**
   * Envía un formulario de contacto al backend con mensajes en formato HTML.
   *
   * Genera un mensaje para el usuario y otro para el administrador.
   * Captura errores de red o del servidor, que pueden ser tratados en el componente.
   *
   * @param nombre Nombre del usuario.
   * @param email Correo electrónico del usuario.
   * @param asunto Asunto del mensaje.
   * @param comentarios Comentarios del usuario.
   * @returns Observable con la respuesta del servidor o un error capturado.
   */
  enviarFormulario(
    nombre: string,
    email: string,
    asunto: string,
    comentarios: string
  ): Observable<unknown> {
    const url = environment.ayuda.urlSolicitudPost;

    const mensajeUsuario = `Buen día ${nombre}<br/><br/>
      Para el SIG es muy importante su opinión, se ha recibido su comentario con la siguiente información:<br/><br/>
      ${comentarios}<br/>`;

    const mensajeAdmin = `Un usuario ha enviado un correo con la siguiente información:<br/><br/>
      Nombre del Usuario: ${nombre}<br/>
      Correo Electrónico: ${email}<br/>
      Motivo del correo: ${asunto}<br/>
      Observación:<br/>
      ${comentarios}`;

    const body = {
      copiaCorreo: email,
      Asunto: asunto,
      MensajeUsuario: mensajeUsuario,
      MensajeAdmin: mensajeAdmin,
    };

    return this.http.post(url, body).pipe(catchError(this.handleError));
  }

  /**
   * Manejador de errores HTTP.
   *
   * Transforma el error en un objeto legible para los componentes consumidores.
   *
   * @param error Error HTTP capturado.
   * @returns Observable con el error transformado.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let mensaje = 'Ocurrió un error inesperado.';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o red
      mensaje = `Error de red: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      mensaje = `Error ${error.status}: ${error.statusText || 'Sin mensaje del servidor.'}`;
    }

    return throwError(() => new Error(mensaje));
  }

  /**
   * Descarga un archivo PDF desde una URL especificada.
   *
   * @param url URL del archivo PDF a descargar.
   * @param fileName Nombre con el que se guardará el archivo. Por defecto 'manual.pdf'.
   */
  downloadPDF(url: string, fileName = 'manual.pdf'): Promise<void> {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `No se pudo descargar el archivo: ${response.status} ${response.statusText}`
          );
        }
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => {
        console.error('Error al descargar PDF:', error);
        alert('No se pudo descargar el manual. Intente más tarde.');
        throw error;
      });
  }

  /**
   * Descarga el manual del sistema definido en el environment.
   *
   * @param fileName Nombre con el que se guardará el PDF. Por defecto 'manual.pdf'.
   */
  downloadManual(fileName = 'manual.pdf'): Promise<void> {
    return this.downloadPDF(environment.ayuda.urlManual, fileName);
  }
}
