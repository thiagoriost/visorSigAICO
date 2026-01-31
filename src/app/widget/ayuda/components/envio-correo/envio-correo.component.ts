import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { Editor, EditorModule } from 'primeng/editor';
import Quill from 'quill';
import { AyudaService } from '@app/widget/ayuda/services/ayuda.service';
import { MessageModule } from 'primeng/message';

/**
 * Configuración personalizada para la lista blanca de fuentes en Quill Editor.
 *
 * Se importa el attributor de fuentes (font) desde Quill para modificar
 * la lista de fuentes permitidas en el editor.
 *
 * La propiedad `whitelist` define las fuentes que estarán disponibles
 * para el usuario al seleccionar estilos de texto.
 *
 * Finalmente, se registra esta configuración personalizada para que
 * Quill utilice esta lista blanca de fuentes en lugar de la predeterminada.
 *
 * Fuentes permitidas:
 * - Arial
 * - Courier
 * - Helvetica
 * - Tahoma
 * - Times New Roman
 * - Verdana
 */
const Font = Quill.import('attributors/class/font');
Font.whitelist = [
  'arial',
  'courier',
  'helvetica',
  'tahoma',
  'times-new-roman',
  'verdana',
];
Quill.register(Font, true);
/**
 * Componente encargado de gestionar el envío de un formulario de contacto vía correo electrónico.
 * Permite al usuario ingresar nombre, correo, asunto y comentarios con formato enriquecido,
 * utilizando el editor Quill para la edición avanzada del campo de comentarios.
 *
 * Implementa validaciones básicas del formulario y controla el estado de envío mostrando mensajes
 * de éxito o error según la respuesta del servicio `AyudaService`.
 *
 * Además, configura una barra de herramientas personalizada en el editor Quill con fuentes permitidas,
 * estilos básicos de texto, alineación, listas y enlaces con inserción personalizada.
 *
 * El componente es independiente (standalone) y utiliza varios módulos de PrimeNG para la UI,
 * como botones, inputs, área de texto, mensajes y el editor.
 *
 * @author Carlos Alberto Aristizabal Vargas
 * @date 26-05-2025
 * @version 1.0.0
 */
@Component({
  selector: 'app-envio-correo',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MessageModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    EditorModule,
  ],
  templateUrl: './envio-correo.component.html',
  styleUrl: './envio-correo.component.scss',
})
export class EnvioCorreoComponent {
  /**
   * Referencia al editor de texto enriquecido Quill.
   */
  @ViewChild('editor') editor: Editor | undefined;

  /**
   * Referencia al formulario template-driven.
   */
  @ViewChild('comentarioForm') comentarioForm!: NgForm;

  /**
   * Datos que el usuario introduce en el formulario.
   */
  formData = {
    nombre: '',
    email: '',
    asunto: '',
    comentarios: '',
  };

  /**
   * Indica si el formulario está en proceso de envío.
   */
  cargando = false;

  /**
   * Mensaje de error que se mostrará si ocurre una falla en el envío.
   */
  mensajeError: string | null = null;

  /**
   * Bandera que indica si el formulario fue enviado exitosamente.
   */
  enviadoExitosamente = false;

  /**
   * Configuración de la barra de herramientas del editor Quill.
   */
  quillModules = {
    toolbar: {
      container: [
        [
          {
            font: [
              'arial',
              'courier',
              'helvetica',
              'tahoma',
              'times-new-roman',
              'verdana',
            ],
          },
        ],
        ['bold', 'italic', 'underline'],
        [{ align: '' }, { align: 'center' }, { align: 'right' }],
        ['link'],
        [{ list: 'ordered' }, { list: 'bullet' }],
      ],
      handlers: {
        link: this.insertarLinkPersonalizado.bind(this),
      },
    },
  };

  /**
   * Constructor que inyecta el servicio de ayuda para enviar el formulario.
   * @param ayudaService Servicio para envío de solicitudes de contacto.
   */
  constructor(private ayudaService: AyudaService) {}

  /**
   * Inserta un enlace personalizado en el editor de texto.
   * Si hay texto seleccionado, lo convierte en un enlace.
   * Si no hay selección, inserta la URL directamente.
   */
  insertarLinkPersonalizado(): void {
    const quill = this.editor?.quill;
    if (quill) {
      const range = quill.getSelection();
      const url = prompt('Ingrese la URL del enlace:');
      if (url && range) {
        if (range.length > 0) {
          quill.formatText(range.index, range.length, 'link', url);
        } else {
          quill.insertText(range.index, url, 'link', url);
        }
      }
    }
  }

  /**
   * Valida el formulario y marca los controles como tocados si hay errores.
   * @returns true si el formulario es válido, false si no.
   */
  esFormularioValido(): boolean {
    if (this.comentarioForm && this.comentarioForm.controls) {
      Object.values(this.comentarioForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
    return !!this.comentarioForm?.valid;
  }

  /**
   * Envía el formulario de contacto al servidor si es válido.
   * Si se envía exitosamente, muestra un mensaje de éxito y oculta el formulario.
   * Si falla, muestra un mensaje de error.
   */
  enviarFormulario(): void {
    if (!this.esFormularioValido()) {
      return;
    }

    this.cargando = true;
    this.mensajeError = null;

    const { nombre, email, asunto, comentarios } = this.formData;
    this.ayudaService
      .enviarFormulario(nombre, email, asunto, comentarios)
      .subscribe({
        next: response => {
          const res = response as { status: string; message: string };
          console.log('respuesta servidor', res);
          this.cargando = false;
          this.enviadoExitosamente = true;
          this.limpiarFormulario();
        },
        error: (error: unknown) => {
          this.cargando = false;
          this.mensajeError = this.getErrorMessage(error);
          console.error('Error al enviar formulario:', error);
        },
      });
  }

  /**
   * Limpia los campos del formulario y reinicia los estados de error.
   */
  limpiarFormulario(): void {
    this.formData = {
      nombre: '',
      email: '',
      asunto: '',
      comentarios: '',
    };
    this.mensajeError = null;

    if (this.comentarioForm) {
      // Resetear formulario y asignar valores vacíos explícitamente
      this.comentarioForm.resetForm(this.formData);
    }
  }

  /**
   * Permite al usuario volver a mostrar el formulario después de un envío exitoso.
   * Limpia todos los estados previos y vuelve a la vista del formulario.
   */
  volverAMostrarFormulario(): void {
    this.enviadoExitosamente = false;
    this.limpiarFormulario();
  }

  /**
   * Devuelve un mensaje de error legible en función del error recibido.
   * @param error Objeto de error recibido.
   * @returns Texto explicativo del error.
   */
  getErrorMessage(error: unknown): string {
    const err = error as Partial<{ message: string; statusText: string }>;
    const mensaje = err.message || err.statusText || '';

    if (
      mensaje.includes('Failed to fetch') ||
      mensaje.includes('NetworkError')
    ) {
      return 'No se pudo conectar con el servidor. Verifica tu conexión a Internet.';
    }

    if (mensaje.includes('404') || mensaje.includes('Not Found')) {
      return 'El servicio de envío no está disponible. Intenta más tarde.';
    }

    if (mensaje.includes('403') || mensaje.includes('Forbidden')) {
      return 'No tienes permisos para enviar este formulario.';
    }

    if (mensaje.includes('400') || mensaje.includes('Bad Request')) {
      return 'Los datos del formulario no son válidos. Verifica e intenta nuevamente.';
    }

    if (mensaje.includes('500') || mensaje.includes('Internal Server Error')) {
      return 'Hubo un problema en el servidor. Por favor, intenta más tarde.';
    }

    return 'Ocurrió un error inesperado. Intenta más tarde o contacta soporte.';
  }
}
