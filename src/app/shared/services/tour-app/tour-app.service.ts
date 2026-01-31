import { Injectable } from '@angular/core';
import { GuidedTour, GuidedTourService } from 'ngx-guided-tour';

/**
 * Servicio que gestiona el tour por la aplicacion
 * @date 18-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Injectable()
export class TourAppService {
  appTourGuide: GuidedTour | null = null; //guia del tour

  constructor(private guidedTourService: GuidedTourService) {}

  /**
   * Metodo getter
   */
  get tour(): GuidedTour | null {
    return this.appTourGuide;
  }

  /**
   * Metodo setter
   */
  set tour(appTourGuide: GuidedTour | null) {
    this.appTourGuide = appTourGuide;
  }

  /**
   * Iniciar el tour
   */
  startTour() {
    if (this.appTourGuide !== null) {
      this.guidedTourService.startTour(this.appTourGuide);
    } else {
      console.error('La guia de tour es nula');
    }
  }
}
