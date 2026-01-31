import { Component } from '@angular/core';
// ***** COMPONENTS *****
import { ViewCoordsComponent } from '@app/widget/viewCoords/components/view-coords/view-coords.component';

import { BarraEscalaComponent } from '@app/widget/barraEscala/components/barra-escala/barra-escala.component';
/**
 * @description Componente que contiene la barra de escala las coordenadas del cursor para Aiso
 * @author Heidy Paola Lopez Sanchez
 */
@Component({
  selector: 'app-coordinate-scale-line',
  standalone: true,
  imports: [ViewCoordsComponent, BarraEscalaComponent],
  templateUrl: './coordinate-scale-line.component.html',
  styleUrl: './coordinate-scale-line.component.scss',
})
export class CoordinateScaleLineComponent {}
