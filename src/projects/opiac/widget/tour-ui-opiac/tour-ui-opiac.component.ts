import { Component } from '@angular/core';
import { AppTourComponent } from '@app/widget-ui/components/app-tour/app-tour.component';
import { GuidedTour } from 'ngx-guided-tour';
import { tourSteps } from '../../files/TourSteps';

/**
 * Componente que implementa el componente generico de tour
 * @date 25-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-tour-ui-opiac',
  standalone: true,
  imports: [AppTourComponent],
  templateUrl: './tour-ui-opiac.component.html',
  styleUrl: './tour-ui-opiac.component.scss',
})
export class TourUiOpiacComponent {
  steps: GuidedTour = tourSteps;
}
