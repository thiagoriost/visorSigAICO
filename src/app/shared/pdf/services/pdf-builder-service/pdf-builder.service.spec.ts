// pdf-builder.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { PDF_TEMPLATES } from '@app/shared/pdf/tokens/pdf-template.token';
import {
  PdfTemplate,
  ExportFormData,
  TemplateId,
} from '@app/shared/Interfaces/export-map/pdf-template';
import {
  PaperFormat,
  PaperOrientation,
} from '@app/shared/Interfaces/export-map/paper-format';

// --- Mocks de templates con ids válidos ---
class StandardTemplateMock implements PdfTemplate {
  readonly id = 'standard' as const;
  readonly label = 'Standard Mock';
  render = jasmine.createSpy('render').and.resolveTo();
}

class StandardV2TemplateMock implements PdfTemplate {
  readonly id = 'standard-v2' as const;
  readonly label = 'Standard v2 Mock';
  render = jasmine.createSpy('render').and.resolveTo();
}

describe('PdfBuilderService', () => {
  let service: PdfBuilderService;
  let createUrlSpy: jasmine.Spy;

  const baseForm: ExportFormData = {
    title: 'Mi mapa',
    author: 'Alice',
    showGrid: false,
    includeLegend: false,
    orientation: PaperOrientation.Horizontal,
    paper: PaperFormat.Letter,
  };

  function buildArgs(
    overrides: Partial<Parameters<PdfBuilderService['build']>[0]> = {}
  ) {
    return {
      formData: baseForm,
      imgData: 'data:image/png;base64,AAA',
      scale: { dataUrl: 'data:image/png;base64,BBB', width: 100, height: 40 },
      legends: [],
      logoUrl: null,
      templateId: 'standard' as const, // <-- id válido
      paper: {
        format: PaperFormat.Letter,
        orientation: PaperOrientation.Horizontal,
      },
      map: { canvasWidth: 800, canvasHeight: 600 },
      meta: { dpi: 180, createdAt: new Date() },
      ...overrides,
    };
  }

  beforeEach(() => {
    createUrlSpy = spyOn(URL, 'createObjectURL').and.returnValue(
      'blob:unit-test-url'
    );
  });

  it('constructor: registra templates provistos por el token PDF_TEMPLATES', () => {
    const t1 = new StandardTemplateMock();
    const t2 = new StandardV2TemplateMock();

    TestBed.configureTestingModule({
      providers: [
        PdfBuilderService,
        { provide: PDF_TEMPLATES, useValue: [t1, t2] },
      ],
    });

    service = TestBed.inject(PdfBuilderService);

    const available = service
      .getAvailableTemplates()
      .map(t => t.id)
      .sort();
    expect(available).toEqual(['standard', 'standard-v2']);
  });

  it('registerTemplates(): registra en runtime y build() llama render() del template', async () => {
    TestBed.configureTestingModule({ providers: [PdfBuilderService] });
    service = TestBed.inject(PdfBuilderService);

    const t1 = new StandardTemplateMock();
    service.registerTemplates(t1);

    const { url, name, pdf } = await service.build(buildArgs());

    expect(t1.render).toHaveBeenCalledTimes(1);
    expect(url).toBe('blob:unit-test-url');
    expect(name).toBe('Mi_mapa.pdf');
    expect(pdf).toBeTruthy();
    expect(createUrlSpy).toHaveBeenCalled();
  });

  it('fallback: si el templateId no existe, usa el primero registrado', async () => {
    TestBed.configureTestingModule({ providers: [PdfBuilderService] });
    service = TestBed.inject(PdfBuilderService);

    const t1 = new StandardTemplateMock();
    service.registerTemplates(t1);

    // Forzamos un id desconocido sin usar `any`
    const badId = 'desconocido' as unknown as TemplateId;
    const args = buildArgs({ templateId: badId });

    await service.build(args);

    expect(t1.render).toHaveBeenCalledTimes(1);
  });

  it('lanza error claro si no hay plantillas registradas', async () => {
    TestBed.configureTestingModule({ providers: [PdfBuilderService] });
    service = TestBed.inject(PdfBuilderService);

    await expectAsync(service.build(buildArgs())).toBeRejectedWithError(
      /\[PDF] No hay plantillas registradas/
    );
  });
});
