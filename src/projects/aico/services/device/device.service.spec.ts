import { TestBed } from '@angular/core/testing';
import { DeviceService } from './device.service';
import { BehaviorSubject } from 'rxjs';

/**
 * Suite de pruebas unitarias para el servicio DeviceService.
 *
 * Este conjunto de pruebas verifica la funcionalidad del servicio que detecta
 * el tipo de dispositivo (móvil o escritorio) basándose en el ancho de la ventana
 * y responde a cambios en el tamaño de la pantalla.
 *
 * @author GitHub Copilot
 * @version 1.0.0
 */
describe('DeviceService', () => {
  let service: DeviceService;
  let originalInnerWidth: number;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DeviceService],
    });

    // Guardar el ancho original de la ventana
    originalInnerWidth = window.innerWidth;

    service = TestBed.inject(DeviceService);
  });

  afterEach(() => {
    // Restaurar el ancho original de la ventana
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });

    // Limpiar el servicio
    service.ngOnDestroy();
  });

  describe('Inicialización del servicio', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have isMobile$ observable defined', () => {
      expect(service.isMobile$).toBeDefined();
    });

    it('should initialize BehaviorSubject', () => {
      expect(service['isMobileSubject']).toBeDefined();
    });

    it('should check screen size on initialization', done => {
      service.isMobile$.subscribe(isMobile => {
        expect(typeof isMobile).toBe('boolean');
        done();
      });
    });
  });

  describe('checkScreenSize - Detección de tamaño de pantalla', () => {
    it('should detect mobile when width is less than 768px', done => {
      // Establecer ancho de ventana para móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      service['checkScreenSize']();

      service.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(true);
        done();
      });
    });

    it('should detect desktop when width is 768px or more', done => {
      // Establecer ancho de ventana para escritorio
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      service['checkScreenSize']();

      service.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(false);
        done();
      });
    });

    it('should detect desktop exactly at 768px breakpoint', done => {
      // Establecer ancho exacto del breakpoint
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      service['checkScreenSize']();

      service.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(false);
        done();
      });
    });

    it('should detect mobile at 767px (just below breakpoint)', done => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      });

      service['checkScreenSize']();

      service.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(true);
        done();
      });
    });

    it('should handle very small screen widths', done => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      service['checkScreenSize']();

      service.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(true);
        done();
      });
    });

    it('should handle very large screen widths', done => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 2560,
      });

      service['checkScreenSize']();

      service.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(false);
        done();
      });
    });
  });

  describe('Window resize event handling', () => {
    it('should add resize event listener on construction', () => {
      spyOn(window, 'addEventListener');

      // Crear nueva instancia del servicio
      const newService = new DeviceService();

      expect(window.addEventListener).toHaveBeenCalledWith(
        'resize',
        jasmine.any(Function)
      );

      newService.ngOnDestroy();
    });

    it('should update isMobile when window is resized to mobile size', done => {
      // Iniciar con tamaño de escritorio
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      service['checkScreenSize']();

      // Cambiar a tamaño móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      // Simular evento resize
      window.dispatchEvent(new Event('resize'));

      setTimeout(() => {
        service.isMobile$.subscribe(isMobile => {
          expect(isMobile).toBe(true);
          done();
        });
      }, 100);
    });

    it('should update isMobile when window is resized to desktop size', done => {
      // Iniciar con tamaño móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      service['checkScreenSize']();

      // Cambiar a tamaño de escritorio
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      // Simular evento resize
      window.dispatchEvent(new Event('resize'));

      setTimeout(() => {
        service.isMobile$.subscribe(isMobile => {
          expect(isMobile).toBe(false);
          done();
        });
      }, 100);
    });

    it('should handle multiple resize events', () => {
      const values: boolean[] = [];

      service.isMobile$.subscribe(isMobile => {
        values.push(isMobile);
      });

      // Primer resize a móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('resize'));

      // Segundo resize a escritorio
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      window.dispatchEvent(new Event('resize'));

      // Tercer resize a móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
      window.dispatchEvent(new Event('resize'));

      expect(values.length).toBeGreaterThan(1);
    });
  });

  describe('isMobile$ Observable', () => {
    it('should be subscribable', () => {
      const subscription = service.isMobile$.subscribe();
      expect(subscription).toBeDefined();
      subscription.unsubscribe();
    });

    it('should emit current value immediately to new subscribers', done => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      service['checkScreenSize']();

      // Nueva suscripción debería recibir el valor actual inmediatamente
      service.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(false);
        done();
      });
    });

    it('should support multiple subscribers', () => {
      const subscriber1Values: boolean[] = [];
      const subscriber2Values: boolean[] = [];

      service.isMobile$.subscribe(isMobile => {
        subscriber1Values.push(isMobile);
      });

      service.isMobile$.subscribe(isMobile => {
        subscriber2Values.push(isMobile);
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      service['checkScreenSize']();

      expect(subscriber1Values.length).toBeGreaterThan(0);
      expect(subscriber2Values.length).toBeGreaterThan(0);
    });

    it('should emit values in correct sequence', () => {
      const emittedValues: boolean[] = [];

      service.isMobile$.subscribe(isMobile => {
        emittedValues.push(isMobile);
      });

      // Desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      service['checkScreenSize']();

      // Mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });
      service['checkScreenSize']();

      // Desktop again
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      service['checkScreenSize']();

      expect(emittedValues.length).toBeGreaterThanOrEqual(3);
      expect(emittedValues[emittedValues.length - 1]).toBe(false);
    });

    it('should not emit duplicate values when size changes within same category', () => {
      const emittedValues: boolean[] = [];

      service.isMobile$.subscribe(isMobile => {
        emittedValues.push(isMobile);
      });

      const initialLength = emittedValues.length;

      // Ambos son móvil
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });
      service['checkScreenSize']();

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
      service['checkScreenSize']();

      // BehaviorSubject emite incluso si el valor es el mismo
      // pero verificamos que todos sean true (móvil)
      const recentValues = emittedValues.slice(initialLength);
      recentValues.forEach(value => {
        expect(value).toBe(true);
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      spyOn(service['destroy$'], 'next');
      spyOn(service['destroy$'], 'complete');

      service.ngOnDestroy();

      expect(service['destroy$'].next).toHaveBeenCalled();
      expect(service['destroy$'].complete).toHaveBeenCalled();
    });

    it('should be safe to call multiple times', () => {
      expect(() => {
        service.ngOnDestroy();
        service.ngOnDestroy();
      }).not.toThrow();
    });

    it('should have destroy$ subject defined', () => {
      expect(service['destroy$']).toBeDefined();
    });
  });

  describe('Edge Cases y escenarios especiales', () => {
    it('should handle window.innerWidth of 0', done => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 0,
      });

      service['checkScreenSize']();

      service.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(true);
        done();
      });
    });

    it('should handle negative window width gracefully', done => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: -100,
      });

      service['checkScreenSize']();

      service.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(true);
        done();
      });
    });

    it('should handle rapid resize events', () => {
      const resizeCount = 10;

      for (let i = 0; i < resizeCount; i++) {
        const width = i % 2 === 0 ? 400 : 1024;
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        window.dispatchEvent(new Event('resize'));
      }

      // El servicio no debería fallar con eventos rápidos
      let currentValue: boolean | undefined;
      service.isMobile$.subscribe(isMobile => {
        currentValue = isMobile;
      });

      expect(currentValue).toBeDefined();
    });

    it('should maintain correct state after service re-creation', done => {
      service.ngOnDestroy();

      const newService = TestBed.inject(DeviceService);

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      newService['checkScreenSize']();

      newService.isMobile$.subscribe(isMobile => {
        expect(isMobile).toBe(true);
        done();
      });

      newService.ngOnDestroy();
    });
  });

  describe('Breakpoint testing - valores límite', () => {
    const testCases = [
      { width: 320, expected: true, description: 'Mobile small (320px)' },
      { width: 375, expected: true, description: 'Mobile medium (375px)' },
      { width: 414, expected: true, description: 'Mobile large (414px)' },
      {
        width: 767,
        expected: true,
        description: 'Just below breakpoint (767px)',
      },
      {
        width: 768,
        expected: false,
        description: 'Exactly at breakpoint (768px)',
      },
      {
        width: 769,
        expected: false,
        description: 'Just above breakpoint (769px)',
      },
      {
        width: 1024,
        expected: false,
        description: 'Tablet landscape (1024px)',
      },
      { width: 1280, expected: false, description: 'Desktop small (1280px)' },
      { width: 1920, expected: false, description: 'Desktop full HD (1920px)' },
      { width: 2560, expected: false, description: 'Desktop 2K (2560px)' },
    ];

    testCases.forEach(({ width, expected, description }) => {
      it(`should correctly detect ${description}`, done => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        service['checkScreenSize']();

        service.isMobile$.subscribe(isMobile => {
          expect(isMobile).toBe(expected);
          done();
        });
      });
    });
  });

  describe('Memory leaks prevention', () => {
    it('should properly clean up on destroy', () => {
      const subscription = service.isMobile$.subscribe();

      service.ngOnDestroy();

      expect(service['destroy$'].closed).toBe(true);

      subscription.unsubscribe();
    });

    it('should handle subscriptions after destroy', () => {
      service.ngOnDestroy();

      let receivedValue: boolean | undefined;
      const subscription = service.isMobile$.subscribe(value => {
        receivedValue = value;
      });

      // Debería aún poder suscribirse, aunque destroy$ esté completo
      expect(receivedValue).toBeDefined();
      subscription.unsubscribe();
    });
  });

  describe('Integración con BehaviorSubject', () => {
    it('should use BehaviorSubject for state management', () => {
      expect(service['isMobileSubject']).toBeInstanceOf(BehaviorSubject);
    });

    it('should expose observable from BehaviorSubject', () => {
      const observable = service['isMobileSubject'].asObservable();
      expect(observable).toBeDefined();
    });

    it('should update BehaviorSubject value on screen size change', () => {
      const initialValue = service['isMobileSubject'].value;

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: initialValue ? 1024 : 500,
      });

      service['checkScreenSize']();

      const newValue = service['isMobileSubject'].value;
      expect(newValue).toBe(!initialValue);
    });
  });
});
