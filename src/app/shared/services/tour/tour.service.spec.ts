import { TestBed } from '@angular/core/testing';
import { TourService } from './tour.service';
import { TourGuideClient } from '@sjmc11/tourguidejs';
import { TourGuideOptions } from '@sjmc11/tourguidejs/src/core/options';
import { TourGuideStep } from '@sjmc11/tourguidejs/src/types/TourGuideStep';

describe('TourService', () => {
  let service: TourService;
  let mockTour: jasmine.SpyObj<TourGuideClient>;
  let steps: TourGuideStep[];
  let config: TourGuideOptions;

  beforeEach(() => {
    mockTour = jasmine.createSpyObj<TourGuideClient>('TourGuideClient', [
      'refresh',
      'start',
      'nextStep',
      'prevStep',
      'exit',
    ]);

    TestBed.configureTestingModule({
      providers: [TourService],
    });

    service = TestBed.inject(TourService);

    steps = [{ title: 'Paso 1', content: 'Contenido', target: 'body' }];
    config = { steps };
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('start()', () => {
    it('no debería iniciar si no hay pasos', () => {
      service.start({ steps: [] });

      const s = service as unknown as { tour?: TourGuideClient };
      expect(s.tour).toBeUndefined();
    });

    it('debería crear un TourGuideClient si no existe uno', () => {
      service.start(config);

      const s = service as unknown as { tour?: TourGuideClient };
      expect(s.tour).toBeTruthy();
    });

    it('debería llamar a refresh y start cuando el tour ya existe', () => {
      const s = service as unknown as { tour?: TourGuideClient };
      s.tour = mockTour;

      service.start(config);

      expect(mockTour.refresh).toHaveBeenCalled();
      expect(mockTour.start).toHaveBeenCalled();
    });
  });

  describe('métodos de navegación', () => {
    beforeEach(() => {
      const s = service as unknown as { tour?: TourGuideClient };
      s.tour = mockTour;
    });

    it('debería llamar a nextStep', () => {
      service.next();
      expect(mockTour.nextStep).toHaveBeenCalled();
    });

    it('debería llamar a prevStep', () => {
      service.prev();
      expect(mockTour.prevStep).toHaveBeenCalled();
    });

    it('debería llamar a exit', () => {
      service.exit();
      expect(mockTour.exit).toHaveBeenCalled();
    });
  });
});
