import { Component, Input } from '@angular/core';
import { ImageModule } from 'primeng/image';

/**
 * Componente que renderiza la imagen que se posiciona al lado derecho del visor
 * @date 2025/11/10
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-linea-negra-right-bottom-image',
  imports: [ImageModule],
  templateUrl: './right-bottom-image.component.html',
  styleUrl: './right-bottom-image.component.scss',
})
export class RightBottomImageComponent {
  @Input() isMobile = false;
  @Input() imageSrc = 'assets/images/sig_ancestral_vegetacion_2.png'; // Ruta de la imagen

  /**
   * Obtiene las dimensiones de ancho y alto de acuerdo a si es resolucion movil o no
   * @returns objeto con la variable width y height
   */
  getImageSize(): { width: string; height: string } {
    return this.isMobile
      ? { width: '250', height: '500' }
      : { width: '300', height: '1000' };
  }
}
