import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ClickableImagePreviewComponent } from '@app/shared/components/clickable-image-preview/clickable-image-preview.component';
import { Divider } from 'primeng/divider';

/**
 * Componenente encargado de renderiza una lista de imágenes, mostrando una miniatura de cada una con la posibilida de cliquear y ampliar la imagen
 * @date 2025-12-03
 * @author Andres Fabian Simbaqueba
 */
@Component({
  selector: 'app-image-list-renderer',
  imports: [ClickableImagePreviewComponent, Divider, NgClass],
  templateUrl: './image-list-renderer.component.html',
  styleUrl: './image-list-renderer.component.scss',
})
export class ImageListRendererComponent {
  @Input({ required: true }) urlImageList: string[] = []; //array de imagenes
  @Input() textColorClass = 'text-color'; //clase para el color de los textos
  @Input() emptyListMessage = 'No hay imágenes disponibles'; //mensaje informativo para mostrar cuando la lista de imagenes esta vacia
}
