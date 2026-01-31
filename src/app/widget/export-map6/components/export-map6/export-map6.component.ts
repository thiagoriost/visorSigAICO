import {
  Component,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

/**
 * PrimeNG 20:
 * - tabview fue removido → ahora se usa "tabs"
 * - dropdown fue removido → ahora se usa "select"
 * - messages fue removido → se reemplaza por lista de "message"
 */
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

// Orquestador y PDF
import { MapExportOrchestratorService } from '@app/shared/services/map-export-service/map-export-orchestrator.service';
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { StandardV5PdfTemplateService } from '@app/shared/pdf/services/templates/standard-v5-pdf-template.service';

import {
  PaperFormat,
  PaperOrientation,
  MarginsPt,
} from '@app/shared/Interfaces/export-map/paper-format';
import {
  ExportFormData,
  TemplateId,
} from '@app/shared/Interfaces/export-map/pdf-template';

import { environment } from 'environments/environment';
import { ExportError } from '@app/shared/Interfaces/export-map/export-map-errors';

/** Estado de un job de exportación. */
type JobStatus = 'creating' | 'done' | 'error';

/**
 * Estructura de cada trabajo en la bandeja de exportaciones.
 * `progress` se mantiene por compatibilidad, aunque la UI actual usa spinner.
 */
interface PrintJob {
  id: number;
  name: string;
  progress: number;
  status: JobStatus;
  url?: string;
  error?: string;
}

/**
 * Mensaje de UI para la bandeja de avisos (PrimeNG Messages).
 * Se usa para errores de formulario o problemas en la exportación.
 */
interface UiMsg {
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
}

/**
 * Componente: ExportMap6Component
 * -------------------------------
 * UI de **Salida Gráfica v6** basada en la plantilla PDF estándar v5.
 *
 * Responsabilidades:
 * - Gestiona el **formulario** de exportación (título, autor, grilla, leyenda, orientación).
 * - Registra y asegura la disponibilidad de la **plantilla PDF v5** en `PdfBuilderService`.
 * - Orquesta la **generación del PDF** con `MapExportOrchestratorService.exportToPdf`.
 * - Mantiene una **bandeja de trabajos** con spinner y acciones de descarga / eliminación.
 * - Muestra **mensajes de error** y feedback al usuario mediante `MessagesModule`.
 * - Toma **valores por defecto** desde `environment.exportMap` (sin NgRx).
 *
 * Flujo general:
 * 1) Usuario completa el formulario y presiona **Exportar**.
 * 2) Se construye `ExportFormData` con orientación `'horizontal' | 'vertical'`
 *    mapeada a `PaperOrientation`.
 * 3) Se asegura que la plantilla v5 esté registrada en el `PdfBuilderService`.
 * 4) Se invoca el orquestador para renderizar mapa off-screen y construir el PDF.
 * 5) El resultado (blob URL + nombre sugerido) se incorpora a la bandeja de trabajos.
 *
 * Notas:
 * - Componente **standalone** con módulos PrimeNG y Forms en `imports`.
 * - Usa un contenedor off-screen (`hiddenMapContainer`) para renderizar el mapa temporal.
 * - Emplea un **spinner** y un progreso “simulado” para dar sensación de avance.
 * - Las plantillas se registran explícitamente vía `StandardV5PdfTemplateService`.
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  26-11-2025
 * @version
 *  1.0.0
 */
@Component({
  selector: 'app-export-map6',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // PrimeNG 20+: Tabs (reemplazo de TabView)
    TabsModule,

    // PrimeNG 20+: Select (reemplazo de Dropdown)
    SelectModule,

    InputTextModule,
    ButtonModule,
    CheckboxModule,
    FloatLabelModule,
    ProgressSpinnerModule,

    // PrimeNG 20+: MessagesModule removido → usar MessageModule y renderizar lista
    MessageModule,
  ],
  templateUrl: './export-map6.component.html',
  styleUrls: ['./export-map6.component.scss'],
})
export class ExportMap6Component implements OnInit, OnDestroy {
  /**
   * Contenedor **off-screen** donde el orquestador montará el mapa temporal
   * que luego se rasteriza para el PDF.
   */
  @ViewChild('hiddenMapContainer', { static: false })
  hiddenMapContainer!: ElementRef<HTMLDivElement>;

  /** Límites de longitud de campos de texto (para mensajes legibles). */
  readonly MAXLEN = { title: 100, author: 50 };

  /** Formulario reactivo principal de exportación. */
  exportForm: FormGroup;

  /** Lista de mensajes visibles en la UI (errores, avisos). */
  uiMessages: UiMsg[] = [];

  /** Pestaña activa: 0 = Diseño, 1 = Exportaciones. */
  activeIndex = 0;

  /** Cola de trabajos de exportación (PDFs generados o en curso). */
  printJobs: PrintJob[] = [];

  /** Secuencia incremental para IDs de trabajos. */
  private jobIdSeq = 0;

  /** Timers de progreso “simulado” por job (limpieza en destroy). */
  private jobTimers = new Map<number, number>();

  /** URL de logo institucional (inyectada desde environment). */
  logoUrl!: string;

  /** Opciones de orientación mostradas en el dropdown (modelo string). */
  orientationOptions = [
    { label: 'Vertical', value: 'vertical' },
    { label: 'Horizontal', value: 'horizontal' },
  ];

  constructor(
    private fb: FormBuilder,
    private orchestrator: MapExportOrchestratorService,
    private pdfBuilder: PdfBuilderService,
    private tplV5: StandardV5PdfTemplateService
  ) {
    // Inicialización del formulario con validaciones básicas.
    this.exportForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.maxLength(50)]],
      showGrid: [false],
      includeLegend: [false],
      orientation: ['horizontal', Validators.required],
    });
  }

  /**
   * onTabChange(v)
   * --------------
   * PrimeNG Tabs puede emitir `string | number | undefined`.
   * Convertimos a number para mantener `activeIndex: number`.
   */
  onTabChange(v: string | number | undefined): void {
    this.activeIndex = typeof v === 'number' ? v : Number(v ?? 0);
  }

  /**
   * ngOnInit()
   * ----------
   * - Carga **defaults** desde `environment.exportMap` y rellena el formulario.
   * - Asegura que la plantilla estándar v5 esté registrada en el `PdfBuilderService`.
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
    this.ensureTemplate('standard-v5');
  }

  /**
   * ngOnDestroy()
   * -------------
   * Limpia descargas y timers para evitar fugas de memoria y handles activos.
   */
  ngOnDestroy(): void {
    this.clearDownloads();
    this.jobTimers.forEach(id => clearInterval(id));
    this.jobTimers.clear();
  }

  /**
   * ensureTemplate(templateId)
   * --------------------------
   * Verifica si el `PdfBuilderService` conoce la plantilla solicitada.
   * Si no existe, registra explícitamente la plantilla v5.
   *
   * @param templateId Id de plantilla que se espera encontrar (por defecto 'standard-v5').
   */
  private ensureTemplate(templateId: TemplateId = 'standard-v5'): void {
    const list = this.pdfBuilder.getAvailableTemplates();
    const hasRequested = list.some(t => t.id === templateId);
    if (!list.length || !hasRequested) {
      this.pdfBuilder.registerTemplates(this.tplV5);
    }
  }

  /**
   * campoInvalido(ctrl)
   * -------------------
   * Helper de validación para marcar campos con error en la plantilla.
   *
   * @param ctrl Nombre del control de formulario.
   * @returns `true` si el control es inválido y ya fue tocado/modificado.
   */
  campoInvalido(ctrl: string): boolean {
    const c = this.exportForm.get(ctrl);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  /**
   * errorMsg(campo)
   * ----------------
   * Genera mensajes legibles de validación para `title` y `author`.
   *
   * @param campo 'title' | 'author'
   * @returns Mensaje de error legible o `null` si no hay error relevante.
   */
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

  /**
   * pushUiError(summary, detail)
   * ----------------------------
   * Agrega un mensaje de error a la bandeja de `Messages`.
   *
   * @param summary Título corto del error.
   * @param detail  Descripción opcional del problema.
   */
  private pushUiError(summary: string, detail?: string) {
    this.uiMessages = [
      {
        severity: 'error',
        summary,
        detail,
        sticky: false,
        life: 6000,
        closable: true,
      },
    ];
  }

  /**
   * startProgress(job)
   * ------------------
   * Inicia un **progreso simulado** para que el spinner no parezca infinito.
   * La barra lógica avanza hasta ~90% y se completa al finalizar el job real.
   *
   * @param job Trabajo que se está procesando.
   */
  private startProgress(job: PrintJob): void {
    const tick = () => {
      const cap = 90;
      const inc = Math.random() * 5 + 3;
      job.progress = Math.min(cap, job.progress + inc);
    };
    tick();
    const intId = window.setInterval(tick, 800);
    this.jobTimers.set(job.id, intId);
  }

  /**
   * finishProgress(job)
   * -------------------
   * Completa el progreso a 100 y limpia el timer asociado.
   */
  private finishProgress(job: PrintJob): void {
    const id = this.jobTimers.get(job.id);
    if (id) {
      clearInterval(id);
      this.jobTimers.delete(id);
    }
    job.progress = 100;
  }

  /**
   * clearDownloads()
   * ----------------
   * Revoca todas las URLs de blob de los trabajos y limpia los timers.
   * Se utiliza al destruir el componente o cuando se limpia la bandeja.
   */
  clearDownloads(): void {
    for (const job of this.printJobs) {
      if (job.url?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(job.url);
        } catch (_e) {
          console.debug('Error al revocar URL', _e);
        }
      }
      const t = this.jobTimers.get(job.id);
      if (t) {
        clearInterval(t);
        this.jobTimers.delete(job.id);
      }
    }
    this.printJobs = [];
  }

  /**
   * removeJob(job)
   * --------------
   * Elimina un trabajo individual de la bandeja y revoca su URL si aplica.
   *
   * @param job Trabajo a eliminar.
   */
  removeJob(job: PrintJob): void {
    if (job.url?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(job.url);
      } catch (_e) {
        console.debug('Error al revocar URL', _e);
      }
    }
    const t = this.jobTimers.get(job.id);
    if (t) {
      clearInterval(t);
      this.jobTimers.delete(job.id);
    }
    this.printJobs = this.printJobs.filter(j => j.id !== job.id);
  }

  /**
   * downloadJob(job)
   * ----------------
   * Lanza la descarga del PDF asociado creando un `<a>` temporal.
   *
   * @param job Trabajo cuyo PDF se desea descargar.
   */
  downloadJob(job: PrintJob): void {
    if (!job.url) return;
    const a = document.createElement('a');
    a.href = job.url;
    a.download = job.name;
    a.target = '_blank';
    a.click();
    a.remove();
  }

  /** TrackBy para *ngFor de trabajos (mejora rendimiento de la lista). */
  trackJob(_index: number, job: PrintJob): number {
    return job.id;
  }

  /** Hay algún job finalizado que pueda limpiarse. */
  get canClearDownloads(): boolean {
    return this.printJobs.some(j => j.status !== 'creating');
  }

  /**
   * onSubmit()
   * ----------
   * Valida el formulario, crea un **job** en la bandeja, invoca el orquestador
   * de exportación y actualiza el estado con el resultado (o error).
   */
  async onSubmit(): Promise<void> {
    if (this.exportForm.invalid) {
      this.exportForm.markAllAsTouched();
      this.pushUiError('Formulario inválido', 'Revisa los campos requeridos.');
      return;
    }

    // 1) Normalización de datos
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

    // 2) Nombre seguro para archivo PDF
    const safeName = `${formData.title?.trim().replace(/\s+/g, '_') || 'documento'}.pdf`;

    // 3) Alta del job y arranque de progreso
    const job: PrintJob = {
      id: ++this.jobIdSeq,
      name: safeName,
      progress: 0,
      status: 'creating',
    };

    this.printJobs.unshift(job);
    this.startProgress(job);

    // 4) UI: cambiar automáticamente a la pestaña "Exportaciones"
    this.activeIndex = 1;

    // 5) Verificar contenedor off-screen
    const container = this.hiddenMapContainer?.nativeElement;
    if (!container) {
      job.status = 'error';
      job.error = 'No se encontró el contenedor off-screen del mapa.';
      this.pushUiError('No se puede exportar', job.error);
      console.error(`[ExportMap6][job=${job.id}] Falta hiddenMapContainer`);
      this.finishProgress(job);
      return;
    }

    const logoUrl = this.logoUrl || '';

    // Flag para controlar el render de escala vertical (por ahora false).
    const VScaleLine = false;

    // Márgenes específicos para marco, encabezado y pie de tabla en la plantilla.
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
      console.groupCollapsed(`[ExportMap6][job=${job.id}] submit`);
      console.debug('[ExportMap6] formData', formData);

      // Asegurar que la plantilla requerida esté registrada
      this.ensureTemplate('standard-v5');

      // 6) Ejecutar export (mapa off-screen → PDF)
      const result = await this.orchestrator.exportToPdf(
        container,
        logoUrl,
        formData,
        {
          logPrefix: '[PDF v5-SG6]',
          templateId: 'standard-v5',
          mapMargins,
          gridOptions: {
            expandBy: 5,
            idealCells: 135,
          },
        },
        VScaleLine
      );

      if (!result) {
        job.status = 'error';
        job.error = 'No se pudo generar el PDF (resultado vacío).';
        this.pushUiError('Error generando PDF', job.error);
        console.error(
          `[ExportMap6][job=${job.id}] Orchestrator devolvió resultado vacío`
        );
        this.finishProgress(job);
        return;
      }

      // 7) Cerrar job con éxito
      job.url = result.url;
      job.name = result.name || job.name;
      job.status = 'done';
      this.finishProgress(job);

      console.debug(`[ExportMap6][job=${job.id}] OK ->`, job.name);
    } catch (err: unknown) {
      // 8) Manejo de error general
      job.status = 'error';
      const msg =
        err instanceof ExportError
          ? err.message
          : err instanceof Error
            ? err.message
            : String(err);

      job.error = msg || 'Error inesperado';
      this.pushUiError('Error exportando mapa', job.error);

      if (err instanceof ExportError) {
        console.error(
          `[ExportMap6][job=${job.id}] ERROR (${err.stage})`,
          err.message
        );
      } else {
        console.error(`[ExportMap6][job=${job.id}] ERROR`, err);
      }
      this.finishProgress(job);
    } finally {
      console.groupEnd();
    }
  }
}
