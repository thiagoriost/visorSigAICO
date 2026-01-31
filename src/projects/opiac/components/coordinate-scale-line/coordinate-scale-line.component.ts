import { Component } from '@angular/core';
// ***** COMPONENTS *****
import { BarraEscalaComponent } from '@app/widget/barraEscala/components/barra-escala/barra-escala.component';
import { ViewCoordsComponent } from '@app/widget/viewCoords/components/view-coords/view-coords.component';
/**
 * @description Componente que contiene la barra de escala y las coordenadas del cursor para OPIAC
 * @author Juan Carlos Valderrama Gonzalez
 */
@Component({
  selector: 'app-coordinate-scale-line',
  standalone: true,
  imports: [BarraEscalaComponent, ViewCoordsComponent],
  templateUrl: './coordinate-scale-line.component.html',
  styleUrl: './coordinate-scale-line.component.scss',
})
export class CoordinateScaleLineComponent {}
