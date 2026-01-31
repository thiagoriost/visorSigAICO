import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Core compartido para crear mapa off-screen / clonado
import { MapExportCoreService } from '@app/shared/services/map-export-service/map-export-core.service';

import { GridService } from '@app/shared/services/grid-service/grid.service';

//  Nuevo: orquestador genérico
import { MapExportOrchestratorService } from '@app/shared/services/map-export-service/map-export-orchestrator.service';

// Nuevo: builder + plantilla estándar v2
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { StandardPdfTemplateService } from '@app/shared/pdf/services/templates/standard-pdf-template.service';

import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { BlockUIModule } from 'primeng/blockui';
import { LoadingDataMaskWithOverlayComponent } from '@app/shared/components/loading-data-mask-with-overlay/loading-data-mask-with-overlay.component';

import {
  PaperOrientation,
  PaperFormat,
  MarginsPt,
} from '@app/shared/Interfaces/export-map/paper-format';
import { ExportFormData } from '@app/shared/Interfaces/export-map/pdf-template';

// Defaults ahora vienen del environment (no NgRx)
import { environment } from 'environments/environment';

// OL types
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';

/**
 * Componente: ExportMap2Component
 * -------------------------------
 * UI de **Salida Gráfica v2** con previsualización integrada.
 */
@Component({
  selector: 'app-export-map2',
  standalone: true,
  templateUrl: './export-map2.component.html',
  styleUrls: ['./export-map2.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    CheckboxModule,
    SelectModule,
    ButtonModule,
    DialogModule,
    BlockUIModule,
    FloatLabelModule,
    LoadingDataMaskWithOverlayComponent,
  ],
})
export class ExportMap2Component implements OnInit {
  /** Contenedor visible del **preview** de mapa. */
  @ViewChild('previewContainer', { static: false })
  previewContainer!: ElementRef<HTMLDivElement>;

  /**
   * Contenedor **off-screen** donde el orquestador montará el mapa temporal
   * que luego se rasteriza para el PDF.
   */
  @ViewChild('exportHiddenMapContainer', { static: false })
  exportHiddenMapContainer!: ElementRef<HTMLDivElement>;

  /** Contenedor con scroll para reposicionar al abrir el diálogo. */
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  /** Formulario de exportación. */
  exportForm!: FormGroup;

  /** Control de visibilidad del diálogo (two-way binding). */
  private _displayDialog = false;
  @Input()
  set displayDialog(value: boolean) {
    if (value) this.openDialog();
    this._displayDialog = value;
  }
  get displayDialog(): boolean {
    return this._displayDialog;
  }

  /** Emite cambios de visibilidad hacia el contenedor. */
  @Output() displayDialogChange = new EventEmitter<boolean>();

  /** Señal de que el diálogo terminó el setup inicial (para mostrar el preview). */
  isDialogReady = false;

  /** Muestra mensajes de validación bajo los inputs. */
  showValidationErrors = false;

  /** Flag de solicitud en curso (bloquea acción de exportar). */
  loading = false;

  /** URL de logo institucional (inyectada desde environment). */
  logoUrl!: string;

  /** Límites de caracteres (alineado a SG v4). */
  readonly MAXLEN = { title: 100, author: 50 };

  // ===== Estado del preview =====
  /** Mapa clonado para la previsualización. */
  private previewMap: Map | null = null;

  /** Capa de grilla independiente usada solo en el preview. */
  private previewGrid: VectorLayer | null = null;

  /** Opciones del dropdown de orientación (para la UI). */
  orientationOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
  ];

  constructor(
    private fb: FormBuilder,
    private gridService: GridService,
    private core: MapExportCoreService,

    // Nuevo: orquestador + builder + plantilla estándar (v2)
    private orchestrator: MapExportOrchestratorService,
    private pdfBuilder: PdfBuilderService,
    private tplStandard: StandardPdfTemplateService
  ) {}

  ngOnInit(): void {
    // Form + validaciones (título y autor requeridos + longitud máxima)
    this.exportForm = this.fb.group({
      title: [
        '',
        [Validators.required, Validators.maxLength(this.MAXLEN.title)],
      ],
      author: [
        '',
        [Validators.required, Validators.maxLength(this.MAXLEN.author)],
      ],
      showGrid: [false],
      includeLegend: [false],
      orientation: ['horizontal', Validators.required],
      logoUrl: [''],
    });

    // Defaults desde environment (sin Store/NgRx)
    const defs = environment.exportMap;
    if (defs) {
      if (defs.title) this.exportForm.get('title')!.setValue(defs.title);
      if (defs.author) this.exportForm.get('author')!.setValue(defs.author);
      if (defs.showGrid != null)
        this.exportForm.get('showGrid')!.setValue(!!defs.showGrid);
      if (defs.includeLegend != null)
        this.exportForm.get('includeLegend')!.setValue(!!defs.includeLegend);
      if (defs.orientation)
        this.exportForm.get('orientation')!.setValue(defs.orientation);
      this.logoUrl =
        defs.logoUrl ||
        'projects/opiac/assets/images/leopardo-amazonico-opiac.png';
    }

    // Toggle de grilla SOLO sobre el preview (no el mapa principal)
    this.exportForm.get('showGrid')!.valueChanges.subscribe((vis: boolean) => {
      if (this.previewGrid) this.previewGrid.setVisible(!!vis);
    });

    // Ajuste de tamaño del preview al cambiar orientación
    this.exportForm.get('orientation')!.valueChanges.subscribe(val => {
      setTimeout(() => this.adjustPreviewSize(val), 80);
      // Al cambiar tamaño, notificar al mapa de preview
      setTimeout(() => this.previewMap?.updateSize(), 120);
    });
  }

  // ===========================================================================
  // UI / diálogo
  // ===========================================================================

  openDialog(): void {
    this._displayDialog = true;
    this.isDialogReady = false;
    this.displayDialogChange.emit(true);

    // Pequeño delay para permitir layout del Dialog
    setTimeout(async () => {
      this.isDialogReady = true;

      // Tras visibilizar el contenido, llevar el scroll a top y ajustar preview
      setTimeout(async () => {
        this.scrollContainer?.nativeElement?.scrollTo({
          top: 0,
          behavior: 'auto',
        });
        this.adjustPreviewSize(this.exportForm.value.orientation);

        // 1) Crear mapa de PREVIEW dentro del contenedor visible
        await this.mountPreviewMap();

        // 2) Mostrar/ocultar grilla del preview según el formulario
        if (this.previewGrid)
          this.previewGrid.setVisible(!!this.exportForm.value.showGrid);
      }, 30);
    }, 80);
  }

  private async mountPreviewMap(): Promise<void> {
    // Limpiar instancia previa si existe
    if (this.previewMap) {
      this.previewMap.setTarget(undefined);
      this.previewMap = null;
      this.previewGrid = null;
    }

    const cont = this.previewContainer?.nativeElement;
    if (!cont) return;

    // Dimensiones actuales del preview
    const w = cont.clientWidth || 800;
    const h = cont.clientHeight || 600;

    // Necesario para que OL calcule tamaño real
    cont.style.position = 'relative';
    cont.style.overflow = 'hidden';

    // Proyección / extent con base en el mapa original
    const mainMap = this.core['mapService'].getMap();
    if (!mainMap) return;

    const v0 = mainMap.getView();
    const projection = v0.getProjection().getCode();
    const tmpExtent = v0.calculateExtent(mainMap.getSize()!) as [
      number,
      number,
      number,
      number,
    ];

    // Crear mapa limpio pero visible (target = previewContainer)
    this.previewMap = this.core.createCleanMap(cont, tmpExtent, projection, []);
    this.previewMap.setSize([w, h]); // explícito por si el rAF no alcanza
    this.previewMap.updateSize();

    // Cargar las capas visibles (INTERMEDIATE + UPPER) en el preview
    const layers = this.core.getIntermediateAndUpperLayers();
    await this.core.loadExportMapLayers(this.previewMap, layers);
    await this.core.waitForMapToRender(this.previewMap);

    // Inyectar una grilla independiente sobre el preview (visible según form)
    const extent = this.previewMap
      .getView()
      .calculateExtent(this.previewMap.getSize()!) as [
      number,
      number,
      number,
      number,
    ];
    this.previewGrid = this.gridService.makeStandaloneGridLayer(extent, {
      idealCells: 48,
      color: 'rgba(0,0,0,0.22)',
      width: 1,
      expandBy: 3,
    });
    this.previewGrid.setVisible(!!this.exportForm.value.showGrid);
    this.previewMap.addLayer(this.previewGrid);
  }

  /**
   * onSubmit()
   * ----------
   * Ahora:
   * - Calcula márgenes v2.
   * - Asegura plantilla `standard`.
   * - Delegamos todo en el **MapExportOrchestratorService**.
   */
  async onSubmit(): Promise<void> {
    this.showValidationErrors = true;
    this.exportForm.markAllAsTouched();
    if (this.exportForm.invalid) return;

    this.loading = true;

    try {
      // Normalización de orientación (string → enum)
      const orientation: PaperOrientation =
        this.exportForm.value.orientation === 'horizontal'
          ? PaperOrientation.Horizontal
          : PaperOrientation.Vertical;

      // Payload para el orquestador PDF
      const payload: ExportFormData = {
        title: this.exportForm.value.title,
        author: this.exportForm.value.author,
        showGrid: this.exportForm.value.showGrid,
        includeLegend: this.exportForm.value.includeLegend,
        orientation,
        paper: PaperFormat.Letter,
      };

      // 1) Asegurar plantilla 'standard' registrada (lógica vieja del servicio v2)
      const list = this.pdfBuilder.getAvailableTemplates();
      const hasStandard = list.some(t => t.id === 'standard');
      if (!list.length || !hasStandard) {
        this.pdfBuilder.registerTemplates(this.tplStandard);
      }

      // 2) Márgenes específicos de SG v2 (como en el orquestador viejo)
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

      // 3) Delegar todo el flujo al orquestador genérico
      const res = await this.orchestrator.exportToPdf(
        this.exportHiddenMapContainer.nativeElement,
        this.logoUrl,
        payload,
        {
          logPrefix: '[PDF v2-refac]',
          templateId: 'standard',
          mapMargins,
        }
      );

      // Descarga del PDF si hubo resultado
      if (res) {
        const a = document.createElement('a');
        a.href = res.url;
        a.download = res.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(res.url), 10_000);
      }

      // Cierre y limpieza de estado
      this.onCancel();
      this.loading = false;
    } catch (err) {
      console.error('Error generando PDF:', err);
      this.loading = false;
    }
  }

  onCancel(): void {
    if (this.previewMap) {
      this.previewMap.setTarget(undefined);
      this.previewMap = null;
      this.previewGrid = null;
    }

    this._displayDialog = false;
    this.displayDialogChange.emit(false);
    this.showValidationErrors = false;
  }

  // ===========================================================================
  // Helpers de UI / validación
  // ===========================================================================

  campoInvalido(ctrl: 'title' | 'author' | 'orientation'): boolean {
    const c = this.exportForm.get(ctrl);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

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

  private adjustPreviewSize(orientation: 'horizontal' | 'vertical') {
    const container = this.previewContainer?.nativeElement;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (orientation === 'horizontal') {
      container.style.width = `${Math.floor(width * 0.9)}px`;
      container.style.height = `${Math.floor(height * 0.75)}px`;
    } else {
      container.style.width = `${Math.floor(width * 0.85)}px`;
      container.style.height = `${Math.floor(height * 1.2)}px`;
    }

    this.previewMap?.updateSize();
  }

  get titleControl() {
    return this.exportForm.get('title');
  }

  get authorControl() {
    return this.exportForm.get('author');
  }
}
