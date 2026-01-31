import { TestBed } from '@angular/core/testing';

import { TourAppService } from './tour-app.service';
import {
  GuidedTour,
  GuidedTourService,
  WindowRefService,
} from 'ngx-guided-tour';

describe('TourAppService', () => {
  let service: TourAppService;
  let guidedTourServiceSpy: jasmine.SpyObj<GuidedTourService>;

  const mockTour: GuidedTour = {
    tourId: 'test-tour',
    steps: [
      {
        title: 'Paso 1',
        content: 'Contenido del paso 1',
        selector: '.step-1',
      },
    ],
  };
  beforeEach(() => {
    const spy = jasmine.createSpyObj('GuidedTourService', ['startTour']);
    TestBed.configureTestingModule({
      providers: [
        TourAppService,
        { provide: GuidedTourService, useValue: spy },
        WindowRefService,
      ],
    });
    service = TestBed.inject(TourAppService);
    guidedTourServiceSpy = TestBed.inject(
      GuidedTourService
    ) as jasmine.SpyObj<GuidedTourService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get the appTourGuide', () => {
    service.tour = mockTour;
    expect(service.tour).toEqual(mockTour);
  });

  it('should start tour if appTourGuide is set', () => {
    service.tour = mockTour;
    service.startTour();
    expect(guidedTourServiceSpy.startTour).toHaveBeenCalledWith(mockTour);
  });

  it('should not start tour if appTourGuide is null', () => {
    service.tour = null;
    service.startTour();
    expect(guidedTourServiceSpy.startTour).not.toHaveBeenCalled();
  });
});
