// legend-image.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

import { LegendImageService } from './legend-image.service';

describe('LegendImageService (simple)', () => {
  let service: LegendImageService;
  let storeSpy: jasmine.SpyObj<Store<unknown>>;
  let fetchSpy: jasmine.Spy<
    (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  >;

  const okBlob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' });

  beforeEach(() => {
    storeSpy = jasmine.createSpyObj<Store<unknown>>('Store', ['select']);
    // Por defecto, el store emite un proxy (puedes cambiar por test con setProxy)
    storeSpy.select.and.returnValue(of('https://proxy/?url='));

    TestBed.configureTestingModule({
      providers: [LegendImageService, { provide: Store, useValue: storeSpy }],
    });

    // Mock global fetch con tipos correctos
    fetchSpy = spyOn(globalThis, 'fetch').and.callFake(async () => {
      return new Response(okBlob, { status: 200, statusText: 'OK' });
    });

    service = TestBed.inject(LegendImageService);
  });

  it('descarga la leyenda y devuelve un DataURL (usa proxy del store)', async () => {
    const legendUrl = 'http://wms.example.com?request=GetLegendGraphic';

    // Validamos que la URL proxificada es la esperada
    fetchSpy.and.callFake(async (url: RequestInfo | URL) => {
      const toStr = (u: RequestInfo | URL): string => {
        if (typeof u === 'string') return u;
        if (u instanceof URL) return u.toString();
        // Request
        return (u as Request).url;
      };
      expect(toStr(url)).toBe(
        'https://proxy/?url=' + encodeURIComponent(legendUrl)
      );
      return new Response(okBlob, { status: 200, statusText: 'OK' });
    });

    const dataUrl = await service.loadLegendAsDataURL(legendUrl);
    expect(fetchSpy).toHaveBeenCalled();
    expect(dataUrl.startsWith('data:image/png;base64,')).toBeTrue();
  });

  it('lanza error cuando la respuesta HTTP no es ok', async () => {
    fetchSpy.and.resolveTo(
      new Response(okBlob, { status: 404, statusText: 'Not Found' })
    );

    await expectAsync(
      service.loadLegendAsDataURL('http://wms/legend.png')
    ).toBeRejectedWithError(/404 Not Found/);
  });

  it('setProxy() sobrescribe el prefijo del proxy', async () => {
    // Este test no depende del valor del store
    service.setProxy('PFX:');

    fetchSpy.and.callFake(async (url: RequestInfo | URL) => {
      const toStr = (u: RequestInfo | URL): string => {
        if (typeof u === 'string') return u;
        if (u instanceof URL) return u.toString();
        return (u as Request).url;
      };
      expect(toStr(url)).toBe('PFX:' + encodeURIComponent('http://x/legend'));
      return new Response(okBlob, { status: 200, statusText: 'OK' });
    });

    const out = await service.loadLegendAsDataURL('http://x/legend');
    expect(out.startsWith('data:image/png;base64,')).toBeTrue();
  });

  it('rechaza si la URL está vacía', async () => {
    await expectAsync(service.loadLegendAsDataURL('')).toBeRejectedWithError(
      'URL de leyenda vacía.'
    );
  });
});
