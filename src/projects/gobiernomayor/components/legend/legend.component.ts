import { Component } from '@angular/core';
import { LegendSecondVersionComponent } from '@app/widget/legend-v2/components/legend-second-version/legend-second-version.component';

/**
 * @description Componente que renderiza el componete de leyenad para Gobierno Mayor
 * @author Sergio Alonso Mariño Duque
 */
@Component({
  selector: 'app-legend',
  standalone: true,
  imports: [LegendSecondVersionComponent],
  templateUrl: './legend.component.html',
  styleUrl: './legend.component.scss',
})
export class LegendComponent {}
