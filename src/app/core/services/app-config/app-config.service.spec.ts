import { TestBed } from '@angular/core/testing';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;
  const mockConfig = {
    geoportalUrl: 'https://mock.geoportal.com',
    version: '1.0.0',
    maxFeatures: 100,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppConfigService);

    // Mockeamos la función global `fetch` para evitar una llamada de red real.
    // Hacemos que devuelva una promesa que resuelve con nuestro objeto de configuración simulado.
    spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockConfig),
      } as Response)
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('load()', () => {
    it('debería llamar a fetch con la URL correcta y cargar la configuración', async () => {
      await service.load();

      // Verificamos que se llamó a fetch con la ruta esperada.
      expect(window.fetch).toHaveBeenCalledWith('./assets/config.json');

      // Verificamos que la configuración se haya guardado internamente.
      expect(service.get('version')).toBe('1.0.0');
    });

    it('debería manejar un error de red y asignar un objeto vacío a la configuración', async () => {
      // Hacemos que fetch rechace la promesa para simular un error de red.
      (window.fetch as jasmine.Spy).and.returnValue(
        Promise.reject('Error de red simulado')
      );
      const consoleErrorSpy = spyOn(console, 'error');

      await service.load();

      expect(consoleErrorSpy).toHaveBeenCalled();
      // Después de un error, get() debería devolver undefined para cualquier clave.
      expect(service.get('geoportalUrl')).toBeUndefined();
    });

    it('debería manejar un JSON inválido y asignar un objeto vacío a la configuración', async () => {
      // Hacemos que response.json() rechace la promesa.
      (window.fetch as jasmine.Spy).and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.reject('Error de parseo de JSON simulado'),
        } as Response)
      );
      const consoleErrorSpy = spyOn(console, 'error');

      await service.load();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(service.get('geoportalUrl')).toBeUndefined();
    });

    it('debería manejar una respuesta no exitosa (ej. 404)', async () => {
      (window.fetch as jasmine.Spy).and.returnValue(
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        } as Response)
      );
      const consoleErrorSpy = spyOn(console, 'error');

      await service.load();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(service.get('geoportalUrl')).toBeUndefined();
    });
  });

  describe('get()', () => {
    it('debería devolver undefined si la configuración no se ha cargado', () => {
      // Creamos una nueva instancia para asegurar que `load()` no se ha llamado.
      const freshService = new AppConfigService();
      expect(freshService.get('geoportalUrl')).toBeUndefined();
    });

    it('debería devolver el valor correcto para una clave existente después de cargar', async () => {
      await service.load();
      expect(service.get<string>('geoportalUrl')).toBe(
        'https://mock.geoportal.com'
      );
      expect(service.get<number>('maxFeatures')).toBe(100);
    });

    it('debería devolver undefined para una clave que no existe', async () => {
      await service.load();
      expect(service.get('nonExistentKey')).toBeUndefined();
    });
  });
});
