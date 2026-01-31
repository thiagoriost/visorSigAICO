import { Component } from '@angular/core';
import { TourService } from '@app/shared/services/tour/tour.service';
import { ButtonModule } from 'primeng/button';
import { launcherTourSteps } from '../tour-steps';
import { TourGuideOptions } from '@sjmc11/tourguidejs/src/core/options';

@Component({
  selector: 'app-launcher-tour',
  imports: [ButtonModule],
  templateUrl: './launcher-tour.component.html',
  styleUrl: './launcher-tour.component.scss',
})
export class LauncherTourComponent {
  constructor(public tour: TourService) {}

  start(): void {
    const tourConfig: TourGuideOptions = {
      steps: launcherTourSteps,
      dialogZ: 10000,
    };
    this.tour.start(tourConfig);
  }
}
