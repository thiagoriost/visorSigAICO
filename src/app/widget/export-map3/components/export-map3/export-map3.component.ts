import {
  Component,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressBarModule } from 'primeng/progressbar';

import { MessageModule } from 'primeng/message';

import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';

// Nuevo: orquestador genérico
import { MapExportOrchestratorService } from '@app/shared/services/map-export-service/map-export-orchestrator.service';

// Sistema PDF por plantillas
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';

// Plantilla específica de SG3 (standard-v3)
import { StandardV3PdfTemplateService } from '@app/shared/pdf/services/templates/standard-v3-pdf-template.service';

// Papel / tipos compartidos
import {
  PaperFormat,
  PaperOrientation,
  MarginsPt,
} from '@app/shared/Interfaces/export-map/paper-format';

import {
  ExportFormData,
  TemplateId,
} from '@app/shared/Interfaces/export-map/pdf-template';

// Defaults ahora vienen del environment (no NgRx)
import { environment } from 'environments/environment';

// Utilidad de errores con stages (ver archivo export-map-errors.ts)
import { ExportError } from '@app/shared/Interfaces/export-map/export-map-errors';

/** Estados posibles de un trabajo de impresión. */
type JobStatus = 'creating' | 'done' | 'error';

/**
 * Modelo interno para representar un trabajo/cola de impresión.
 * - `progress`: 0–100
 * - `status`: estado de la ejecución
 * - `url`: blob URL del PDF cuando finaliza
 */
interface PrintJob {
  id: number;
  name: string;
  progress: number;
  status: JobStatus;
  url?: string;
  error?: string;
}

/** Tipo local para mensajes de p-messages (evita depender de tipos de PrimeNG) */
interface UiMsg {
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
}

/**
 * Componente de exportación a PDF con progreso: `ExportMap3Component`
 * -------------------------------------------------------------------
 * Ahora usa el **MapExportOrchestratorService** y la plantilla fija
 * **standard-v3**, que se registra desde este componente.
 */
@Component({
  selector: 'app-export-map3',
  standalone: true,
  imports: [
    SelectModule,
    CommonModule,
    ReactiveFormsModule,
    SelectButtonModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    ProgressBarModule,
    MessageModule,
  ],
  templateUrl: './export-map3.component.html',
  styleUrls: ['./export-map3.component.scss'],
})
export class ExportMap3Component implements OnInit, OnDestroy {
  /** Contenedor off-screen donde se renderiza temporalmente el mapa a exportar. */
  @ViewChild('hiddenMapContainer', { static: false })
  hiddenMapContainer!: ElementRef<HTMLDivElement>;
  readonly MAXLEN = { title: 100, author: 50 };

  /** Lista de trabajos de impresión en curso/finalizados para mostrar en UI. */
  printJobs: PrintJob[] = [];
  /** Secuencia incremental para asignar ids únicos a cada `PrintJob`. */
  private jobIdSeq = 0;
  /**
   * Mapa de timers por `job.id` para animar el progreso simulado mientras el PDF se construye.
   * Los timers se limpian al finalizar/cancelar o en `ngOnDestroy()`.
   */
  private jobTimers = new Map<number, number>();

  /** URL del logo institucional a incluir en el PDF. Se inyecta desde defaults del environment. */
  logoUrl!: string;

  /** Formulario reactivo con los parámetros de exportación. */
  exportForm: FormGroup;

  /**
   * Compatibilidad con listado anterior de resultados (si se necesitara).
   * Mantener vacío si solo se usa `printJobs`.
   */
  pdfResults: { url: string; name: string }[] = [];

  /** Opciones de orientación para el dropdown (primeng). */
  orientationOptions = [
    { label: 'Vertical', value: 'vertical' },
    { label: 'Horizontal', value: 'horizontal' },
  ];

  // Bandeja simple de mensajes para la UI (p-message)
  uiMessages: UiMsg[] = [];

  constructor(
    private fb: FormBuilder,
    private orchestrator: MapExportOrchestratorService,
    private pdfBuilder: PdfBuilderService,
    private tplV3: StandardV3PdfTemplateService
  ) {
    // Inicializa el formulario con validaciones y valores por defecto básicos.
    this.exportForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.maxLength(50)]],
      showGrid: [false],
      includeLegend: [false],
      orientation: ['horizontal', Validators.required],
    });
  }

  /**
   * Asegura que exista la plantilla solicitada ('standard-v3');
   * si no está registrada, la registra.
   */
  private ensureTemplate(templateId: TemplateId = 'standard-v3'): void {
    const list = this.pdfBuilder.getAvailableTemplates();
    const hasRequested = list.some(t => t.id === templateId);
    if (!list.length || !hasRequested) {
      this.pdfBuilder.registerTemplates(this.tplV3);
    }
  }

  /**
   * ngOnInit()
   * ----------
   * Aplica valores por defecto provenientes de **environment.exportMap** (sin NgRx) y
   * no dispara eventos.
   * - Rellena: title, author, showGrid, includeLegend, orientation
   * - Establece `logoUrl` por defecto si viene configurado
   */
  ngOnInit(): void {
    const defs = environment.exportMap;
    this.exportForm.patchValue(
      {
        title: defs.title ?? '',
        author: defs.author ?? '',
        showGrid: !!defs.showGrid,
        includeLegend: !!defs.includeLegend,
        orientation:
          (defs.orientation as 'horizontal' | 'vertical') ?? 'horizontal',
      },
      { emitEvent: false }
    );

    this.logoUrl = defs.logoUrl || '';

    // Dejamos la plantilla registrada de una vez
    this.ensureTemplate('standard-v3');
  }

  /**
   * ngOnDestroy()
   * -------------
   * Limpia recursos:
   * - Revoca blobs de descargas finalizadas
   * - Detiene todos los timers de progreso
   */
  ngOnDestroy(): void {
    this.clearDownloads();
    this.jobTimers.forEach(id => clearInterval(id));
    this.jobTimers.clear();
  }

  /**
   * campoInvalido()
   * ---------------
   * Utilidad para mostrar mensajes de error bajo cada control cuando es inválido y fue tocado.
   */
  campoInvalido(ctrl: string): boolean {
    const c = this.exportForm.get(ctrl);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  /**
   * clearDownloads()
   * ----------------
   * Revoca las URLs de los trabajos ya finalizados (done/error) y limpia sus timers.
   */
  clearDownloads(): void {
    const toDelete = this.printJobs.filter(j => j.status !== 'creating');
    for (const job of toDelete) {
      if (job.url?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(job.url);
        } catch (_e) {
          console.debug('Ignorando error al revocar URL del blob', _e);
        }
      }
      const t = this.jobTimers.get(job.id);
      if (t) {
        clearInterval(t);
        this.jobTimers.delete(job.id);
      }
    }
    this.printJobs = this.printJobs.filter(j => j.status === 'creating');

    for (const item of this.pdfResults) {
      if (item?.url?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(item.url);
        } catch (_e) {
          console.debug('Ignorando error al revocar URL del blob', _e);
        }
      }
    }
    this.pdfResults = [];
  }

  /**
   * canClearDownloads
   * -----------------
   * Getter de conveniencia para habilitar/deshabilitar el botón
   * “Borrar descargas” en la plantilla.
   */
  get canClearDownloads(): boolean {
    return this.printJobs.some(j => j.status !== 'creating');
  }

  /**
   * startProgress()
   * ---------------
   * Inicia un progreso simulado suave que sube en intervalos hacia un máximo del 85%.
   */
  private startProgress(job: PrintJob): void {
    const tick = () => {
      const cap = 85;
      const inc = Math.random() * 6 + 2;
      job.progress = Math.min(cap, job.progress + inc);
    };
    tick();
    const intId = window.setInterval(tick, 600);
    this.jobTimers.set(job.id, intId);
  }

  /**
   * step()
   * ------
   * Asegura que el progreso del `job` supere o iguale un valor concreto.
   */
  private step(job: PrintJob, value: number): void {
    job.progress = Math.max(job.progress, value);
  }

  /**
   * finishProgress()
   * ----------------
   * Detiene el timer del `job` (si existiera) y establece progreso final a 100%.
   */
  private finishProgress(job: PrintJob): void {
    const id = this.jobTimers.get(job.id);
    if (id) {
      clearInterval(id);
      this.jobTimers.delete(job.id);
    }
    job.progress = 100;
  }

  /** Mensaje de error legible y contextual por campo. */
  errorMsg(campo: 'title' | 'author'): string | null {
    const control = this.exportForm.get(campo);
    if (!control || !(control.touched || control.dirty)) return null;
    const errors = control.errors;
    if (!errors) return null;

    if (errors['required']) {
      return campo === 'title'
        ? 'El título es obligatorio.'
        : 'El autor es obligatorio.';
    }
    if (errors['maxlength']) {
      const lim = this.MAXLEN[campo];
      return campo === 'title'
        ? `El título debe contener máximo ${lim} caracteres.`
        : `El autor debe contener máximo ${lim} caracteres.`;
    }
    return null;
  }

  // Utilidad para mostrar errores en UI con p-messages
  private pushUiError(summary: string, detail?: string) {
    this.uiMessages = [
      { severity: 'error', summary, detail, sticky: false, life: 6000 },
    ];
  }

  /**
   * onSubmit()
   * ----------
   * Ahora:
   * - Normaliza los datos a `ExportFormData` (con orientación enum + papel).
   * - Asegura la plantilla `standard-v3` registrada.
   * - Llama al **MapExportOrchestratorService.exportToPdf** con márgenes v3.
   */
  async onSubmit(): Promise<void> {
    if (this.exportForm.invalid) {
      this.exportForm.markAllAsTouched();
      this.pushUiError('Formulario inválido', 'Revisa los campos requeridos.');
      return;
    }

    const raw = this.exportForm.value;

    const formData: ExportFormData = {
      title: raw.title,
      author: raw.author,
      showGrid: !!raw.showGrid,
      includeLegend: !!raw.includeLegend,
      orientation:
        raw.orientation === 'vertical'
          ? PaperOrientation.Vertical
          : PaperOrientation.Horizontal,
      paper: PaperFormat.Letter,
    };

    const safeName = `${formData.title?.trim().replace(/\s+/g, '_') || 'documento'}.pdf`;

    const job: PrintJob = {
      id: ++this.jobIdSeq,
      name: safeName,
      progress: 0,
      status: 'creating',
    };
    this.printJobs.unshift(job);
    this.startProgress(job);

    const container = this.hiddenMapContainer?.nativeElement;
    if (!container) {
      job.status = 'error';
      job.error = 'No se encontró el contenedor off-screen del mapa.';
      this.pushUiError('No se puede exportar', job.error);
      console.error(`[ExportMap3][job=${job.id}] Falta hiddenMapContainer`);
      this.finishProgress(job);
      return;
    }

    const logoUrl = this.logoUrl || '';

    // Márgenes específicos de SG v3 (copiados del orquestador viejo v3)
    const frameMargin = 20;
    const headerSpace = 40;
    const footerTableH = 3 * 20;
    const footerExtra = 10;

    const mapMargins: MarginsPt = {
      top: frameMargin + headerSpace,
      right: frameMargin,
      bottom: frameMargin + footerTableH + footerExtra,
      left: frameMargin,
    };

    try {
      console.groupCollapsed(`[ExportMap3][job=${job.id}] submit`);
      console.debug('[ExportMap3] formData', formData);

      this.step(job, 15);

      // Aseguramos la plantilla standard-v3 antes de llamar al orquestador
      this.ensureTemplate('standard-v3');

      const result = await this.orchestrator.exportToPdf(
        container,
        logoUrl,
        formData,
        {
          logPrefix: '[PDF v3-refac]',
          templateId: 'standard-v3',
          mapMargins,
          gridOptions: {
            expandBy: 5,
            idealCells: 135,
          },
        }
      );

      this.step(job, 90);

      if (!result) {
        job.status = 'error';
        job.error = 'No se pudo generar el PDF (resultado vacío).';
        this.pushUiError('Error generando PDF', job.error);
        console.error(
          `[ExportMap3][job=${job.id}] Orchestrator devolvió resultado vacío`
        );
        this.finishProgress(job);
        return;
      }

      job.url = result.url;
      job.name = result.name || job.name;
      job.status = 'done';
      this.finishProgress(job);

      console.debug(`[ExportMap3][job=${job.id}] OK ->`, job.name);
    } catch (err: unknown) {
      job.status = 'error';
      const msg =
        err instanceof ExportError
          ? `${err.message}`
          : err instanceof Error
            ? err.message
            : String(err);

      job.error = msg || 'Error inesperado';
      this.pushUiError('Error exportando mapa', job.error);

      if (err instanceof ExportError) {
        console.error(
          `[ExportMap3][job=${job.id}] ERROR (${err.stage})`,
          err.message
        );
      } else {
        console.error(`[ExportMap3][job=${job.id}] ERROR`, err);
      }

      this.finishProgress(job);
    } finally {
      console.groupEnd();
    }
  }
}
