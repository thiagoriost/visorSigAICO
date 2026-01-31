import { Component, Input } from '@angular/core';
import { ViewCoordsComponent } from '@app/widget/viewCoords/components/view-coords/view-coords.component';
import { BarraEscalaComponent } from '@app/widget/barraEscala/components/barra-escala/barra-escala.component';
import { CRSCode } from '@app/widget/viewCoords/interface/crs-code';
import { ScaleLineMobileVersionComponent } from '../scale-line-mobile-version/scale-line-mobile-version.component';

/**
 * Componente donde se muestra las coordenadas  y la barra de escala del mapa
 * @date 22-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-coordinates-scale-linea-negra',
  imports: [
    ViewCoordsComponent,
    BarraEscalaComponent,
    ScaleLineMobileVersionComponent,
  ],
  templateUrl: './coordinates-scale-linea-negra.component.html',
  styleUrl: './coordinates-scale-linea-negra.component.scss',
})
export class CoordinatesScaleLineaNegraComponent {
  crsCode = CRSCode; // enum de los sistemas de referencia

  @Input() isMobile = false; //indica si la resolucion de pantalla es de un dispositivo movil
}
