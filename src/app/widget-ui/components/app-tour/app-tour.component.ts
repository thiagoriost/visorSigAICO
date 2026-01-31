import { Component, Input, OnInit } from '@angular/core';
import { OverlayComponent } from '@app/widget-ui/components/overlay/overlay.component';
import { ButtonModule } from 'primeng/button';
import {
  GuidedTour,
  GuidedTourModule,
  GuidedTourService,
  WindowRefService,
} from 'ngx-guided-tour';
import { TourAppService } from '@app/shared/services/tour-app/tour-app.service';

/**
 * Componente que contiene la configuracion del tour, el mensaje de bienvenida y el mensaje de finalizado
 * @date 25-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [OverlayComponent, ButtonModule, GuidedTourModule],
  providers: [TourAppService, GuidedTourService, WindowRefService],
  templateUrl: './app-tour.component.html',
  styleUrl: './app-tour.component.scss',
})
export class AppTourComponent implements OnInit {
  @Input() title = 'Bienvenido al Tour por la aplicación'; //texto principal del componente del tour
  @Input() messageHelp =
    'Explora las funciones de nuestra aplicación con el tour guiado. Haz clic en "Iniciar tour" para continuar.'; //texto del mensaje de la finalidad del tour
  @Input() startButtonLabel = 'Iniciar Tour';
  @Input() omitButtonLabel = 'Omitir';
  @Input() skipTourText = 'Omitir Tour';
  @Input() nextStepText = 'Siguiente';
  @Input() prevStepText = 'Anterior';
  @Input() doneTourText = 'Finalizar';
  @Input({ required: true }) steps: GuidedTour | null = null;

  @Input() backgroundOverlay = 'surface-500';
  @Input() textcolorClass = 'text-black';

  @Input() titleFinalizedTour = '¡Tour Finalizado!';
  @Input() messageFinalizedTour =
    'Recuerda que puedes realizar el tour nuevamente desde la herramienta de ayuda.';
  @Input() continueButtonLabel = 'Continuar';

  showOverlay = true; //variable para indicar si se debe mostrar el overlay con la informacion del tour
  isAvaliableOverlayFinalizedTour = false; //variable para indicar si el tour fue finalizado

  constructor(private guidedTourService: TourAppService) {}
  ngOnInit(): void {
    if (this.steps) {
      this.steps.skipCallback = () => {
        localStorage.setItem('realizedTour', 'true');
        console.warn('Tour omitido');
      };
      this.steps.completeCallback = () => {
        localStorage.setItem('realizedTour', 'true');
        this.isAvaliableOverlayFinalizedTour = true;
      };
    }

    this.guidedTourService.tour = this.steps;
    const isRealizedTour = localStorage.getItem('realizedTour');
    if (isRealizedTour && isRealizedTour === 'true') {
      this.showOverlay = false;
    }
  }

  /**
   * Metodo para iniciar el tour
   */
  startTour() {
    if (this.steps) {
      this.showOverlay = false;
      setTimeout(() => {
        this.guidedTourService.startTour();
      }, 300);
    } else {
      console.error(
        'No se puede iniciar el tour porque no se han proporcionado los pasos'
      );
    }
  }

  /**
   * Método para omitir el tour
   */
  omitTour() {
    localStorage.setItem('realizedTour', 'true');
    this.showOverlay = false;
  }

  /**
   * Oculta la variable de control para indicar que el tour fue finalizado
   */
  onContinue() {
    this.isAvaliableOverlayFinalizedTour = false;
  }
}
