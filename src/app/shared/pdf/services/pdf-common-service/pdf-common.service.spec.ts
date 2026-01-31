// pdf-common.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { jsPDF } from 'jspdf';
import { PdfCommonService } from './pdf-common.service';
import { LegendEntry } from '../../../Interfaces/export-map/pdf-template';

describe('PdfCommonService (simple)', () => {
  let service: PdfCommonService;

  // PNG 1x1 (blanco) – útil para pruebas rápidas
  const ONE_PX_PNG =
    'data:image/png;base64,' +
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NgYGD4DwABBAEAJq6W3wAAAABJRU5ErkJggg==';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdfCommonService);
  });

  it('debe crearse', () => {
    expect(service).toBeTruthy();
  });

  it('loadImageAsDataURL: debe retornar un dataURL PNG', async () => {
    const dataUrl = await service.loadImageAsDataURL(ONE_PX_PNG);
    expect(typeof dataUrl).toBe('string');
    expect(dataUrl.startsWith('data:image/png')).toBeTrue();
  });

  it('addLegendPages: debe agregar al menos una página con leyendas', async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });

    // Stub del getImageSize para no depender del DOM real de <img/>
    const sizeSpy = spyOn(
      service as unknown as {
        getImageSize: (
          dataUrl: string
        ) => Promise<{ width: number; height: number }>;
      },
      'getImageSize'
    ).and.callFake(async () => ({ width: 800, height: 1200 })); // “alto” para forzar escalado/paginación

    const legends: LegendEntry[] = [
      { layerName: 'Capa 1', dataUrl: ONE_PX_PNG },
      { layerName: 'Capa 2', dataUrl: ONE_PX_PNG },
    ];

    const pagesBefore = doc.getNumberOfPages();

    await service.addLegendPages(doc, legends);

    const pagesAfter = doc.getNumberOfPages();

    expect(sizeSpy).toHaveBeenCalled();
    expect(pagesAfter).toBeGreaterThan(pagesBefore);
  });

  it('downloadPdfBlob: debe devolver blob URL y nombre saneado', () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    doc.text('Hola PDF', 40, 40);

    const { url, name } = service.downloadPdfBlob(doc, 'Mi mapa:*2025');
    expect(typeof url).toBe('string');
    expect(url.startsWith('blob:')).toBeTrue();
    expect(name.endsWith('.pdf')).toBeTrue();
    // Nombre saneado: sin caracteres raros (reemplazados por "_")
    expect(name).toContain('Mi_mapa__2025.pdf');

    // Limpieza del ObjectURL (comentario para evitar no-empty)
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignorar error al revocar URL en entorno de test
    }
  });
});
