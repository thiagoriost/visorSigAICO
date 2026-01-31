import { Injectable } from '@angular/core';
import { TourGuideClient } from '@sjmc11/tourguidejs';
import { TourGuideOptions } from '@sjmc11/tourguidejs/src/core/options';

/**
 * Servicio que gestiona el tour por la aplicación usando la librería `@sjmc11/tourguidejs`.
 * Permite configurar los pasos del tour, iniciarlo, navegar entre pasos y finalizarlo.
 *
 * @date 07-09-2025
 * @author
 *  Heidy Paola Lopez Sanchez
 */
@Injectable({
  providedIn: 'root',
})
export class TourService {
  // Instancia del cliente de TourGuideJS
  private tour!: TourGuideClient;

  /**
   * Inicia el tour.
   * - Si no hay pasos definidos, no hace nada.
   * - Si no existe un tour, lo crea con los pasos actuales.
   * - Luego refresca e inicia el tour.
   */
  start(tourConfig: TourGuideOptions): void {
    if (!tourConfig.steps?.length) return; // No hay pasos → no iniciar

    // Crear el tour si no existe
    if (!this.tour) {
      this.tour = new TourGuideClient({
        ...tourConfig,
      });
    }
    this.tour.refresh();
    // Iniciar el tour
    this.tour.start();
  }

  /**
   * Avanza al siguiente paso del tour.
   */
  next(): void {
    this.tour?.nextStep();
  }

  /**
   * Retrocede al paso anterior del tour.
   */
  prev(): void {
    this.tour?.prevStep();
  }

  /**
   * Finaliza el tour.
   */
  exit(): void {
    this.tour?.exit();
  }
}
