import { Component } from '@angular/core';
import { BarraEscalaComponent } from '@app/widget/barraEscala/components/barra-escala/barra-escala.component';

/**
 * Componente que renderiza la escala grafica en dos elementos: el primero es el dropdown y el segundo la barra de escala
 * @date 2025-12-05
 * @author Andres Fabian Simbaqueba
 */
@Component({
  selector: 'app-scale-line-mobile-version',
  imports: [BarraEscalaComponent],
  templateUrl: './scale-line-mobile-version.component.html',
  styleUrl: './scale-line-mobile-version.component.scss',
})
export class ScaleLineMobileVersionComponent {}
