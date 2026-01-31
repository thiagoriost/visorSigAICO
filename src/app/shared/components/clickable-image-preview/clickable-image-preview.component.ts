import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { MessageModule } from 'primeng/message';

/**
 * Componente que muestra una vista previa de una imagen a partir de una URL.
 * La imagen es clickeable y abre un diálogo (modal) con la imagen en tamaño completo.
 *
 * @usage
 * <app-clickable-image-preview [imageUrl]="'https://.../imagen.png'"></app-clickable-image-preview>
 *
 * @author Gemini Code Assist
 * @version 1.0.0
 */
@Component({
  selector: 'app-clickable-image-preview',
  standalone: true,
  imports: [CommonModule, ImageModule, MessageModule],
  templateUrl: './clickable-image-preview.component.html',
  styleUrl: './clickable-image-preview.component.scss',
})
export class ClickableImagePreviewComponent implements OnChanges {
  /**
   * URL de la imagen que se va a mostrar. Es un campo obligatorio.
   * @type {string}
   */
  @Input({ required: true }) imageUrl!: string;

  /**
   * Indica si la URL proporcionada es válida y corresponde a una imagen.
   * @type {boolean}
   */
  isValidUrl = false;

  /**
   * Mensaje que se muestra cuando la URL de la imagen no es válida.
   * @type {string}
   */
  readonly validationMessage = 'URL de la imagen no es válida';

  /**
   * Hook del ciclo de vida que se ejecuta cuando cambian las propiedades de entrada.
   * Se utiliza para validar la URL de la imagen cada vez que cambia.
   * @param {SimpleChanges} changes - Objeto que contiene los cambios en las propiedades.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageUrl']) {
      this.validateUrl(this.imageUrl);
    }
  }

  /**
   * Valida si la URL proporcionada tiene un formato de imagen común.
   * @param {string} url - La URL a validar.
   */
  private validateUrl(url: string): void {
    const imageRegex = /\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/i;
    this.isValidUrl = imageRegex.test(url);
  }
}
