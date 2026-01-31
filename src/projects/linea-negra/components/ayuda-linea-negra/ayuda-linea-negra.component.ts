import { Component } from '@angular/core';
import { TourService } from '@app/shared/services/tour/tour.service';
import { DescargaManualComponent } from '@app/widget/ayuda/components/descarga-manual/descarga-manual.component';
import { launcherTourSteps } from '@projects/linea-negra/settings/tourSteps';
import { TourGuideOptions } from '@sjmc11/tourguidejs/src/core/options';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';

/**
 * Description placeholder
 * @date 2025-11-26
 * @author Andres Fabian Simbaqueba
 *
 * @export
 * @class AyudaLineaNegraComponent
 * @typedef {AyudaLineaNegraComponent}
 */
@Component({
  selector: 'app-ayuda-linea-negra',
  imports: [DescargaManualComponent, Button, Divider],
  templateUrl: './ayuda-linea-negra.component.html',
  styleUrl: './ayuda-linea-negra.component.scss',
})
export class AyudaLineaNegraComponent {
  /**
   * Crea una instancia del componente
   * @param tour servicio del tour
   */
  constructor(private tour: TourService) {}

  /**
   * Inicia el tour del visor
   */
  startTour(): void {
    const tourConfig: TourGuideOptions = {
      steps: launcherTourSteps,
      nextLabel: 'Siguiente',
      prevLabel: 'Anterior',
      finishLabel: 'Finalizar',
      dialogPlacement: 'bottom',
      dialogMaxWidth: 370,
      targetPadding: 1,
    };
    this.tour.start(tourConfig);
  }
}
