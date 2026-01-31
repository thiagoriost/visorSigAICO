import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DescargaManualComponent } from '@app/widget/ayuda/components/descarga-manual/descarga-manual.component';
import { TourAppService } from '@app/shared/services/tour-app/tour-app.service';
import {
  GuidedTour,
  GuidedTourModule,
  GuidedTourService,
  WindowRefService,
} from 'ngx-guided-tour';
import { tourSteps } from '../../files/TourSteps';

/**
 * Componente de ayuda que incluye el manual de usuario y el botón para iniciar el tour de la aplicacion
 * @date 25-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-ayuda-opiac',
  standalone: true,
  imports: [ButtonModule, DescargaManualComponent, GuidedTourModule],
  providers: [TourAppService, GuidedTourService, WindowRefService],
  templateUrl: './ayuda-opiac.component.html',
  styleUrl: './ayuda-opiac.component.scss',
})
export class AyudaOpiacComponent {
  tourGuideSteps: GuidedTour = tourSteps;
  constructor(private tourAppService: TourAppService) {}

  /**
   *Iniciar el tour
   */
  onStartTour() {
    setTimeout(() => {
      this.tourAppService.tour = this.tourGuideSteps;
      this.tourAppService.startTour();
    }, 300);
  }
}
