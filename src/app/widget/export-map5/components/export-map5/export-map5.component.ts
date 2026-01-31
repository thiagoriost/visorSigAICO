// src/app/shared/components/export-map5/export-map5.component.ts
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// Core compartido para clonar/renderizar mapa fuera de pantalla
import { MapExportCoreService } from '@app/shared/services/map-export-service/map-export-core.service';
import { GridService } from '@app/shared/services/grid-service/grid.service';

// ⬇️ Nuevo: orquestador genérico
import { MapExportOrchestratorService } from '@app/shared/services/map-export-service/map-export-orchestrator.service';

// ⬇️ Nuevo: builder + plantilla v4
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { StandardV4PdfTemplateService } from '@app/shared/pdf/services/templates/standard-v4-pdf-template.service';

import { MessageModule } from 'primeng/message';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
// ✅ PrimeNG 20+: Dropdown fue removido → Select
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { BlockUIModule } from 'primeng/blockui';
// ✅ PrimeNG 20+: FloatLabel se importa como módulo
import { FloatLabelModule } from 'primeng/floatlabel';

// Loading overlay
import { LoadingDataMaskWithOverlayComponent } from '@app/shared/components/loading-data-mask-with-overlay/loading-data-mask-with-overlay.component';

// Tipos/contratos compartidos
import {
  PaperOrientation,
  PaperFormat,
  MarginsPt, // ⬅️ Para los márgenes de v5
} from '@app/shared/Interfaces/export-map/paper-format';
import { ExportFormData } from '@app/shared/Interfaces/export-map/pdf-template';

// Defaults desde environment
import { environment } from 'environments/environment';

// OL types
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import { defaults as defaultInteractions } from 'ol/interaction';
import { unByKey } from 'ol/Observable';
import type { EventsKey } from 'ol/events';

/**
 * Contrato mínimo para acceder al `mapService` del core
 * (se usa para evitar `any` en el acceso interno).
 */
interface HasMapService {
  mapService: { getMap(): Map | null };
}

/**
 * Componente **Salida Gráfica v5**: `ExportMap5Component`
 * -------------------------------------------------------
 */
@Component({
  selector: 'app-export-map5',
  standalone: true,
  templateUrl: './export-map5.component.html',
  styleUrls: ['./export-map5.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    CheckboxModule,
    // ✅ PrimeNG 20+: SelectModule
    SelectModule,
    ButtonModule,
    DialogModule,
    BlockUIModule,
    // ✅ PrimeNG 20+: FloatLabelModule
    FloatLabelModule,
    LoadingDataMaskWithOverlayComponent,
    MessageModule,
  ],
})
export class ExportMap5Component implements OnInit {
  // Refs del DOM (preview visible y contenedor oculto para export)
  @ViewChild('previewContainer', { static: false })
  previewContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('exportHiddenMapContainer', { static: false })
  exportHiddenMapContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  // Formulario de opciones
  exportForm!: FormGroup;

  // Control externo del diálogo (two-way)
  private _displayDialog = false;
  @Input()
  set displayDialog(value: boolean) {
    if (value) this.openDialog();
    this._displayDialog = value;
  }
  get displayDialog(): boolean {
    return this._displayDialog;
  }
  @Output() displayDialogChange = new EventEmitter<boolean>();

  // Flags UI
  isDialogReady = false;
  showValidationErrors = false;
  loading = false;
  logoUrl!: string;

  // Estado del preview (mapa/clase y recursos asociados)
  private previewMap: Map | null = null;
  private previewGrid: VectorLayer | null = null;
  private previewSyncCleanup?: () => void; // cleanup de sync preview ↔ main
  private previewMoveKey?: EventsKey; // listener `moveend` del preview
  private gridUpdateRaf?: number; // throttle con RAF para actualizar grilla

  // Opciones fijas de orientación
  orientationOptions = [
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Vertical', value: 'vertical' },
  ];

  constructor(
    private fb: FormBuilder,
    private gridService: GridService,
    private core: MapExportCoreService,

    // ⬇️ Nuevo: orquestador + builder + plantilla v4
    private orchestrator: MapExportOrchestratorService,
    private pdfBuilder: PdfBuilderService,
    private tplV4: StandardV4PdfTemplateService
  ) {}

  ngOnInit(): void {
    this.exportForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      author: ['', [Validators.required, Validators.maxLength(50)]],
      showGrid: [false],
      includeLegend: [false],
      orientation: ['horizontal', Validators.required],
      logoUrl: [''],
    });

    // Defaults desde environment
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

    // Toggle de grilla SOLO sobre el preview
    this.exportForm.get('showGrid')!.valueChanges.subscribe((vis: boolean) => {
      if (this.previewGrid) this.previewGrid.setVisible(!!vis);
    });

    // Ajuste de tamaño del preview al cambiar orientación
    this.exportForm.get('orientation')!.valueChanges.subscribe(val => {
      setTimeout(() => this.adjustPreviewSize(val), 80);
      setTimeout(() => this.previewMap?.updateSize(), 120);
    });
  }

  // =======================================================================
  // UI / diálogo
  // =======================================================================

  openDialog(): void {
    this._displayDialog = true;
    this.isDialogReady = false;
    this.displayDialogChange.emit(true);

    setTimeout(async () => {
      this.isDialogReady = true;

      setTimeout(async () => {
        // Llevar al principio y dimensionar contenedores
        this.scrollContainer?.nativeElement?.scrollTo({
          top: 0,
          behavior: 'auto',
        });
        this.adjustPreviewSize(this.exportForm.value.orientation);

        // 1) Crear mapa de PREVIEW
        await this.mountPreviewMap();

        // 2) Visibilidad inicial de grilla según el formulario
        if (this.previewGrid)
          this.previewGrid.setVisible(!!this.exportForm.value.showGrid);
      }, 30);
    }, 80);
  }

  private async mountPreviewMap(): Promise<void> {
    // Limpiar instancia previa si existía
    if (this.previewMap) {
      this.previewSyncCleanup?.();
      this.previewSyncCleanup = undefined;
      if (this.previewMoveKey) unByKey(this.previewMoveKey);
      this.previewMoveKey = undefined;

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

    // Mapa principal (para copiar proyección/extent y sincronizar vista)
    const mainMap = (this.core as unknown as HasMapService).mapService.getMap();
    if (!mainMap) return;

    const v0 = mainMap.getView();
    const projection = v0.getProjection().getCode();
    const tmpExtent = v0.calculateExtent(mainMap.getSize()!) as [
      number,
      number,
      number,
      number,
    ];

    // Crear mapa limpio (target = previewContainer)
    this.previewMap = this.core.createCleanMap(cont, tmpExtent, projection, []);

    // Interacciones activas (pan/zoom) sin rotación
    const interactions = defaultInteractions({
      altShiftDragRotate: false,
      pinchRotate: false,
      mouseWheelZoom: true,
      pinchZoom: true,
      doubleClickZoom: true,
      keyboard: true,
    });
    const coll = this.previewMap.getInteractions();
    coll.clear();
    interactions.forEach(i => coll.push(i));

    this.previewMap.setSize([w, h]);
    this.previewMap.updateSize();

    // Cargar capas visibles y esperar render
    const layers = this.core.getIntermediateAndUpperLayers();
    await this.core.loadExportMapLayers(this.previewMap, layers);
    await this.core.waitForMapToRender(this.previewMap);

    // Grilla independiente sobre el preview
    this.previewGrid = this.createOrUpdatePreviewGrid();

    // Sincronizar vistas (preview ↔ main)
    this.previewSyncCleanup = this.syncPreviewWithMain(
      mainMap,
      this.previewMap,
      true
    );

    // Actualizar grilla cuando el usuario hace pan/zoom
    this.previewMoveKey = this.previewMap.on('moveend', () => {
      if (this.gridUpdateRaf) cancelAnimationFrame(this.gridUpdateRaf);
      this.gridUpdateRaf = requestAnimationFrame(() => {
        this.createOrUpdatePreviewGrid();
      });
    });
  }

  private createOrUpdatePreviewGrid(): VectorLayer | null {
    if (!this.previewMap) return this.previewGrid;

    const extent = this.previewMap
      .getView()
      .calculateExtent(this.previewMap.getSize()!) as [
      number,
      number,
      number,
      number,
    ];

    const visible = this.exportForm.value.showGrid;

    if (this.previewGrid) {
      this.previewMap.removeLayer(this.previewGrid);
      this.previewGrid = null;
    }

    this.previewGrid = this.gridService.makeStandaloneGridLayer(extent, {
      idealCells: 48,
      color: 'rgba(0,0,0,0.22)',
      width: 1,
      expandBy: 3,
    });

    this.previewGrid.setVisible(!!visible);
    this.previewMap.addLayer(this.previewGrid);

    return this.previewGrid;
  }

  private syncPreviewWithMain(
    mainMap: Map,
    previewMap: Map,
    bidirectional = true
  ): () => void {
    const vMain = mainMap.getView();
    const vPrev = previewMap.getView();

    let syncing = false;
    const keys: EventsKey[] = [];

    const applyPrevToMain = () => {
      if (syncing) return;
      syncing = true;
      const c = vPrev.getCenter();
      const r = vPrev.getResolution();
      if (c) vMain.setCenter(c);
      if (r != null) vMain.setResolution(r);
      syncing = false;
    };

    const applyMainToPrev = () => {
      if (syncing) return;
      syncing = true;
      const c = vMain.getCenter();
      const r = vMain.getResolution();
      if (c) vPrev.setCenter(c);
      if (r != null) vPrev.setResolution(r);
      syncing = false;
    };

    // Preview → Main
    keys.push(vPrev.on('change:center', applyPrevToMain));
    keys.push(vPrev.on('change:resolution', applyPrevToMain));

    // Main → Preview
    if (bidirectional) {
      keys.push(vMain.on('change:center', applyMainToPrev));
      keys.push(vMain.on('change:resolution', applyMainToPrev));
    }

    // Alineación inicial
    applyMainToPrev();

    return () => keys.forEach(k => unByKey(k));
  }

  /**
   * onSubmit()
   * ----------
   * - Empuja center/resolution del preview al mapa principal.
   * - Asegura plantilla `standard-v4`.
   * - Usa márgenes específicos v5.
   * - Delegamos en el **MapExportOrchestratorService**.
   */
  async onSubmit(): Promise<void> {
    this.showValidationErrors = true;
    this.exportForm.markAllAsTouched();
    if (this.exportForm.invalid) return;

    this.loading = true;

    try {
      // Empuja preview → main y espera un frame/render
      const mainMap = (
        this.core as unknown as HasMapService
      ).mapService.getMap();
      if (this.previewMap && mainMap) {
        const vPrev = this.previewMap.getView();
        const vMain = mainMap.getView();
        const c = vPrev.getCenter();
        const r = vPrev.getResolution();
        if (c) vMain.setCenter(c);
        if (r != null) vMain.setResolution(r);

        await new Promise<void>(resolve =>
          requestAnimationFrame(() => resolve(void 0))
        );
        if (this.core.waitForMapToRender) {
          await this.core.waitForMapToRender(mainMap);
        }
      }

      // Armar payload para el orquestador
      const orientation: PaperOrientation =
        this.exportForm.value.orientation === 'horizontal'
          ? PaperOrientation.Horizontal
          : PaperOrientation.Vertical;

      const payload: ExportFormData = {
        title: this.exportForm.value.title,
        author: this.exportForm.value.author,
        showGrid: this.exportForm.value.showGrid,
        includeLegend: this.exportForm.value.includeLegend,
        orientation,
        paper: PaperFormat.Letter,
      };

      // 1) Forzar plantilla v4 y registrarla (lógica del servicio viejo v5)
      this.pdfBuilder.registerTemplates(this.tplV4);
      const list = this.pdfBuilder.getAvailableTemplates();
      const hasStdV4 = list.some(t => t.id === 'standard-v4');
      const templateId = hasStdV4 ? 'standard-v4' : ('standard-v4' as const);

      // 2) Márgenes adaptados al template v4 (como en orquestador viejo)
      const marginSide = 20;
      const topSpace = 16;
      const ribbonH = 84;
      const footerExtra = 8;

      const mapMargins: MarginsPt = {
        top: topSpace,
        right: marginSide,
        bottom: ribbonH + footerExtra,
        left: marginSide,
      };

      // 3) Delegar al orquestador genérico
      const res = await this.orchestrator.exportToPdf(
        this.exportHiddenMapContainer.nativeElement,
        this.logoUrl,
        payload,
        {
          logPrefix: '[PDF v5 → template v4]',
          templateId,
          mapMargins,
        }
      );

      if (res) {
        const a = document.createElement('a');
        a.href = res.url;
        a.download = res.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(res.url), 10_000);
      }

      this.onCancel();
      this.loading = false;
    } catch (err) {
      console.error('Error generando PDF:', err);
      this.loading = false;
    }
  }

  onCancel(): void {
    this.previewSyncCleanup?.();
    this.previewSyncCleanup = undefined;

    if (this.previewMoveKey) unByKey(this.previewMoveKey);
    this.previewMoveKey = undefined;

    if (this.previewMap) {
      this.previewMap.setTarget(undefined);
      this.previewMap = null;
      this.previewGrid = null;
    }

    this._displayDialog = false;
    this.displayDialogChange.emit(false);
    this.showValidationErrors = false;
  }

  // =======================================================================
  // Helpers
  // =======================================================================

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
}
