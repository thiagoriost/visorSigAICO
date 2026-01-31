import { Component, Input } from '@angular/core';
import { OverlayComponent } from '@app/widget-ui/components/overlay/overlay.component';
import { PersonalizedSpinnerComponent } from '@app/shared/components/personalized-spinner/personalized-spinner.component';

/**
 * Componente que se encarga de mostrar en el overlay un textro y un spinner de carga
 * @date 06-06-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-loading-data-mask-with-overlay',
  standalone: true,
  imports: [OverlayComponent, PersonalizedSpinnerComponent],
  templateUrl: './loading-data-mask-with-overlay.component.html',
  styleUrl: './loading-data-mask-with-overlay.component.scss',
})
export class LoadingDataMaskWithOverlayComponent {
  @Input() title = ''; //titulo de la mascara
  @Input({ required: true }) isContained = false; //variable para saber si es contained o no
}
