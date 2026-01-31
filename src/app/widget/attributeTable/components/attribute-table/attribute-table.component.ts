// Angular Core
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
// PrimeNG
import {
  TableModule,
  TableRowSelectEvent,
  TableRowUnSelectEvent,
} from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
// NGRX
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
// Servicios propios
import { MapService } from '@app/core/services/map-service/map.service';
import { MapDrawService } from '../../services/mapDraw/map-draw.service';
import { LocateCoordinateService } from '@app/widget/ubicar-mediante-coordenadas/services/locate-coordinate.service';
// Interfaces y enums
import {
  AttributeTableData,
  GeoJSONGeometrias,
  RowWithGeometrias,
  Geometria,
} from '../../interfaces/geojsonInterface';
// Componentes
import { ExportDataComponent } from '../exportData/export-data/export-data.component';
import { selectAttributeTableData } from '@app/core/store/map/map.selectors';
import { Feature } from 'ol';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { delay, Subject, Subscription, takeUntil } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { AbrirWidget } from '@app/core/store/user-interface/user-interface.actions';

/**
 * Componente que muestra una tabla de atributos basada en un GeoJSON,
 * Los datos que alimentan este componente provienen directamente del `Store` de NgRx,
 * específicamente de la propiedad `tabla-atributos` mediante el selector `selectAttributeTableData('tabla-atributos')`.
 * y permite interactuar con el mapa a partir de las geometrías seleccionadas.
 * @author Heidy Paola Lopez Sanchez
 */

@Component({
  selector: 'app-attribute-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ExportDataComponent,
    DialogModule,
    TooltipModule,
  ],
  providers: [LocateCoordinateService],
  templateUrl: './attribute-table.component.html',
  styleUrl: './attribute-table.component.scss',
})
export class AttributeTableComponent implements AfterViewInit, OnDestroy {
  // Propiedades para almacenar datos provenientes del Store y su procesamiento.
  attributeTableData = {} as AttributeTableData;
  displayedColumns: string[] = [];
  // Fuente de datos de la tabla, cargada desde el GeoJSON.
  dataSource: Record<string, unknown>[] = [];
  // Almacena las filas seleccionadas por el usuario.
  selectedRow: Record<string, unknown>[] = [];
  // Almacena las geometrías seleccionadas en formato GeoJSON.
  geometriasSeleccionadas: GeoJSONGeometrias[] = [];
  geometriasExportacion: GeoJSONGeometrias[] = [];
  // Título asociado a las geometrías seleccionadas.
  tituloGeometriasSeleccionadas = '';
  // Controla la visibilidad del modal de exportación.
  visible = false;

  private destroy$ = new Subject<void>();
  // Suscripción al store para gestión y cancelación controlada.
  private subscription!: Subscription;
  // Constructor del componente que inyecta servicios para mapa y estado global.
  constructor(
    private mapDrawService: MapDrawService,
    private mapService: MapService,
    private store: Store<MapState>
  ) {}

  /**
   * Realiza la suscripción al `Store` de NgRx, escuchando cambios en la propiedad `tabla-atributos`.
   * Esta propiedad contiene los datos de entrada que alimentan la tabla y sus geometrías asociadas.
   * La suscripción se guarda en una variable para garantizar su correcta cancelación en `ngOnDestroy`
   * y así prevenir fugas de memoria.
   */
  // ngOnInit(): void {
  //   this.subscription = this.store
  //     .select(selectAttributeTableData('tabla-atributos'))
  //     .subscribe(data => {
  //       if (data) {
  //         this.attributeTableData = data;
  //         this.procesarData();
  //       }
  //     });
  // }
  ngAfterViewInit() {
    this.subscription = this.store
      .select(selectAttributeTableData('tabla-atributos'))
      .pipe(delay(0), takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.attributeTableData = data;
          this.procesarData();
        }
      });
  }
  /**
   * Libera recursos antes de destruir el componente:
   * - Cancela la suscripción al Store para evitar fugas de memoria.
   * - Elimina la capa `Capa Geometrias` del mapa si se encuentra visible.
   * - Limpia la selección de geometrías en la tabla.
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.attributeTableData.visible) {
      this.mapService.removeLayer(
        { id: 'Capa Geometrias' } as CapaMapa,
        LayerLevel.UPPER
      );
    }
    // Cerrar widget
    this.store.dispatch(
      AbrirWidget({ nombre: 'attributeTable', estado: false })
    );

    this.limpiarSeleccion();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Procesa los datos recibidos desde el store:
   * - Configura las columnas a mostrar en la tabla.
   * - Convierte las geometrías en `Feature` para ser representadas en el mapa.
   * - Añade las geometrías al mapa y ajusta la vista.
   */
  procesarData(): void {
    // Obtiene el primer feature para extraer las columnas.
    const firstFeature = this.attributeTableData.geojson?.features?.[0];
    // Si existen propiedades, llena las columnas; si no, array vacío.
    this.displayedColumns = firstFeature?.properties
      ? Object.keys(firstFeature.properties)
      : [];
    // Guardar toda la data en una variable para exportación
    this.geometriasExportacion = this.attributeTableData.geojson.features;
    // Mapea todos los features para llenar la fuente de datos.
    this.dataSource = this.attributeTableData.geojson.features.map(
      (feature: GeoJSONGeometrias, index: number): RowWithGeometrias => ({
        id: index,
        ...feature.properties,
        _geometry: feature.geometry,
      })
    );
    // Si la propiedad visible es true, agregar las geometrías al mapa.
    if (this.attributeTableData.visible) {
      const features: Feature[] = [];
      for (const feature of this.attributeTableData.geojson.features) {
        // Crea una Feature de OpenLayers a partir de la geometría.
        const olFeature = this.mapDrawService.createFeatureFromGeometry(
          feature.geometry,
          'capa'
        );
        // Si la feature es válida, asigna propiedades y agrega al array.
        if (olFeature) {
          olFeature.setProperties(feature.properties || {});
          features.push(olFeature);
        }
      }
      // Añade todas las features como un grupo al mapa.
      this.mapDrawService.addGeometryGroupToMap(features, 'Capa Geometrias');
      // Ajusta la vista del mapa al límite de las geometrías.
      this.mapDrawService.zoomToFeaturesExtent(features);
    }
  }

  /**
   * Actualiza las geometrías seleccionadas tanto en la tabla como en el mapa.
   * Devuelve un array de `Feature` correspondiente a las geometrías seleccionadas.
   */
  actualizarGeometriasSeleccionadas(): Feature[] {
    const features: Feature[] = [];
    const geometrias: GeoJSONGeometrias[] = [];

    for (const row of this.selectedRow as RowWithGeometrias[]) {
      const geometry = row._geometry;
      if (!geometry || !geometry.type) continue;

      const feature = this.mapDrawService.createFeatureFromGeometry(
        geometry,
        'geometry'
      );
      // Si la feature es válida, asignar propiedades y agregar a los arrays.
      if (feature) {
        feature.setProperties({ ...row });
        features.push(feature);
        geometrias.push({
          type: 'Feature',
          geometry: geometry,
          properties: { ...row },
        });
      }
    }
    // Actualiza las geometrías seleccionadas y su título.
    this.geometriasSeleccionadas = geometrias;
    this.tituloGeometriasSeleccionadas = this.attributeTableData.titulo;
    return features; // Devuelve las features para usarlas en zoom.
  }

  /**
   * Acción que ocurre cuando el usuario selecciona una fila en la tabla.
   * - Añade la geometría al mapa.
   * - Centra la vista en la geometría seleccionada.
   */
  seleccionarfila(row: TableRowSelectEvent<Record<string, unknown>>): void {
    const dataRow = row.data as RowWithGeometrias;
    const layerName = `Geometria_${dataRow['id']}`;
    const geometria: Geometria = dataRow['_geometry'] as Geometria;
    this.mapDrawService.addSingleGeometryToMap(geometria, layerName);
    // Actualiza las geometrías seleccionadas.
    const features = this.actualizarGeometriasSeleccionadas();
    // Si hay geometrías seleccionadas, hace zoom a ellas.
    if (features.length > 0) {
      this.mapDrawService.zoomToFeaturesExtent(features);
    }
  }

  /**
   * Acción que ocurre al deseleccionar una fila.
   * - Elimina la geometría correspondiente del mapa.
   * - Actualiza el zoom si aún quedan geometrías seleccionadas.
   */
  deseleccionarFila(row: TableRowUnSelectEvent<Record<string, unknown>>): void {
    const dataRow = row.data as RowWithGeometrias;
    const layerName = `Geometria_${dataRow['id']}`;
    // Elimina la capa del mapa.
    this.mapService.removeLayer(
      { id: layerName } as CapaMapa,
      LayerLevel.UPPER
    );
    // Actualiza las geometrías seleccionadas.
    const features = this.actualizarGeometriasSeleccionadas();
    // Ajusta el zoom a las geometrías que siguen seleccionadas.
    if (features.length > 0) {
      this.mapDrawService.zoomToFeaturesExtent(features);
    }
  }

  /**
   * Abre el cuadro de diálogo de exportación de datos.
   */
  exportarDatos(): void {
    this.visible = true;
  }

  /**
   * Limpia todas las geometrías seleccionadas en el mapa y reinicia la selección de filas.
   */
  limpiarSeleccion(): void {
    // Itera sobre cada fila seleccionada y elimina su capa asociada.
    for (const row of this.selectedRow) {
      const layerName = `Geometria_${row['id']}`;
      this.mapService.removeLayer(
        { id: layerName } as CapaMapa,
        LayerLevel.UPPER
      );
    }
    // Limpia el array de filas seleccionadas.
    this.selectedRow = [];
  }
}
