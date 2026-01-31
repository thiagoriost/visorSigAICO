import { Component, Input } from '@angular/core';
// ***** COMPONENTS *****
import { BarraEscalaComponent } from '@app/widget/barraEscala/components/barra-escala/barra-escala.component';
import { ViewCoordsComponent } from '@app/widget/viewCoords/components/view-coords/view-coords.component';
import { CommonModule } from '@angular/common';

/**
 * @description Componente que contiene la barra de escala y las coordenadas del cursor para Gobierno Mayor
 * @author Sergio Alonso Mariño
 */
@Component({
  selector: 'app-coordinate-scale-line',
  standalone: true,
  imports: [BarraEscalaComponent, CommonModule, ViewCoordsComponent],
  templateUrl: './coordinate-scale-line.component.html',
  styleUrl: './coordinate-scale-line.component.scss',
})
export class CoordinateScaleLineComponent {
  @Input() isSmallScreen = false;
}
