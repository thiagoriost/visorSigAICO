import { Component, Input } from '@angular/core';
import { ImageModule } from 'primeng/image';

/**
 * Componente que renderiza la imagen que se ubica al lado izquierdo del visor
 * @date 2025/11/10
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-linea-negra-left-bottom-image',
  imports: [ImageModule],
  templateUrl: './left-bottom-image.component.html',
  styleUrl: './left-bottom-image.component.scss',
})
export class LeftBottomImageComponent {
  @Input() isMobile = false; //indica si esta en resolucion movil o no
  @Input() imageSrc = 'assets/images/sig_ancestral_vegetacion_1.png'; // Ruta de la imagen

  /**
   * Obtiene las dimensiones de ancho y alto de acuerdo a si es resolucion movil o no
   * @returns objeto con la variable width y height
   */
  getImageSize(): { width: string; height: string } {
    return this.isMobile
      ? { width: '250', height: '250' }
      : { width: '400', height: '400' };
  }
}
