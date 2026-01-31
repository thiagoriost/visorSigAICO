import { InjectionToken } from '@angular/core';
import { PdfTemplate } from '../../Interfaces/export-map/pdf-template';
import { StandardPdfTemplateService } from '../services/templates/standard-pdf-template.service';
import { StandardV2PdfTemplateService } from '../services/templates/standard-v2-pdf-template.service';
import { StandardV4PdfTemplateService } from '../services/templates/standard-v4-pdf-template.service';
import { StandardV3PdfTemplateService } from '../services/templates/standard-v3-pdf-template.service';
import { StandardV5PdfTemplateService } from '../services/templates/standard-v5-pdf-template.service';

export const PDF_TEMPLATES = new InjectionToken<PdfTemplate[]>('PDF_TEMPLATES');

export const PDF_TEMPLATE_PROVIDERS = [
  // Asegura instancias disponibles en el inyector donde uses este array
  StandardPdfTemplateService,
  StandardV2PdfTemplateService,
  StandardV4PdfTemplateService,
  StandardV3PdfTemplateService,
  StandardV5PdfTemplateService,

  // Registra ambas como multi-provider del token
  {
    provide: PDF_TEMPLATES,
    useExisting: StandardPdfTemplateService,
    multi: true,
  },
  {
    provide: PDF_TEMPLATES,
    useExisting: StandardV2PdfTemplateService,
    multi: true,
  },
  {
    provide: PDF_TEMPLATES,
    useExisting: StandardV3PdfTemplateService,
    multi: true,
  },
  {
    provide: PDF_TEMPLATES,
    useExisting: StandardV4PdfTemplateService,
    multi: true,
  },
  {
    provide: PDF_TEMPLATES,
    useExisting: StandardV5PdfTemplateService,
    multi: true,
  },
];
