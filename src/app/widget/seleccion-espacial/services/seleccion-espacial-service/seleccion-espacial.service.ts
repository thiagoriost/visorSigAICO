import { Injectable, OnDestroy } from '@angular/core';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MapService } from '@app/core/services/map-service/map.service';
import { Draw } from 'ol/interaction';
import { SeleccionEspacialQueryService } from '../seleccion-espacial-query-service/seleccion-espacial-query.service';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Feature, Map, MapBrowserEvent, Overlay } from 'ol';
import { createBox } from 'ol/interaction/Draw';
import { Coordinate } from 'ol/coordinate';
import { Geometry } from 'ol/geom';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectProxyURL } from '@app/core/store/map/map.selectors';
import { MapActions } from '@app/core/store/map/map.actions';
import {
  AttributeTableData,
  GeoJSONGeometrias,
} from '@app/widget/attributeTable/interfaces/geojsonInterface';
import { FeatureWFSResult } from '../../interfaces/FeatureWFSResult';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { AbrirWidget } from '@app/core/store/user-interface/user-interface.actions';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

/**
 * Servicio encargado de gestionar la consulta de seleccion espacial
 * @date 13-05-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Injectable({
  providedIn: 'root',
})
export class SeleccionEspacialService implements OnDestroy {
  selectedLayer: CapaMapa | undefined = undefined; //capa seleccionada
  private destroy$ = new Subject<void>(); //gestiona la desuscripcion cuando se destruye el servicio

  drawInteraction: Draw | null = null; //dibujo a utilizar para seleccionar las capas
  vectorSource = new VectorSource(); //vector
  vectorLayer: VectorLayer = new VectorLayer({ source: this.vectorSource }); //capa vectorial
  proxyUrl = ''; //proxy para realizar las consultas
  mensajeAyuda: Overlay | null = null; //mensaje de ayuda para realizar la seleccion
  projection = ''; //proyeccion del mapa
  featureListFounded: GeoJSONGeometrias[] = []; //lista de features encontrados
  drawedVectorLayerList: VectorLayer[] = []; //lista de vectores dibujados en el mapa
  initialZoom = 0; //zoom inicial del mapa
  initialCenter: Coordinate | null = null; //centro inicial del mapa
  pointerMoveListener = (evt: MapBrowserEvent<UIEvent>): void => {
    const coordinate: Coordinate = evt.coordinate;
    if (this.mensajeAyuda) {
      (this.mensajeAyuda.getElement() as HTMLElement).style.display = 'block';
      this.mensajeAyuda.setPosition(coordinate);
    } else {
      const map = this.mapService.map;
      if (map) this.crearMensaje(map);
    }
  };
  private isSearchingInfoSubject = new BehaviorSubject<boolean>(false);
  isSearchingInfo$ = this.isSearchingInfoSubject.asObservable(); //observable para monitorear cuando se esta consultando informacion

  /**
   * Crea la instancia del servicio
   * @param mapService servicio de gestion del mapa
   * @param seleccionEspacialQueryService servicio para realizar la peticion HTTP
   * @param messageService servicio para gestionar mensajes
   * @param mapStore store del mapa
   */
  constructor(
    private mapService: MapService,
    private seleccionEspacialQueryService: SeleccionEspacialQueryService,
    private messageService: MessageService,
    private mapStore: Store<MapState>,
    private userService: Store<UserInterfaceState>
  ) {
    this.mapStore
      .select(selectProxyURL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(proxyResult => {
        if (proxyResult) {
          this.proxyUrl = proxyResult;
        }
      });
  }

  /**
   * Metodo para cambiar el valor del observable
   * @param value
   */
  setIsSearchingInfo(value: boolean) {
    this.isSearchingInfoSubject.next(value);
  }
  /**
   * Se ejecuta cuando se destruye el servicio
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Metodo para activar la seleccion del area a consultar en la geometria
   */
  activarSeleccion() {
    //obtenemos el mapa
    const map = this.mapService.map;
    if (!map) {
      this.messageService.add({
        summary: 'Error',
        detail: 'No se ha cargado el mapa',
        severity: 'error',
        life: 3000,
      });
      return;
    }
    if (this.mensajeAyuda) {
      map.removeOverlay(this.mensajeAyuda);
      this.mensajeAyuda = null;
    }

    if (this.drawInteraction) {
      map.removeInteraction(this.drawInteraction);
      this.drawInteraction = null;
    }

    this.vectorSource.clear();
    // Listener para mover el mensaje con el puntero
    if (!this.initialCenter) {
      this.initialCenter = map.getView().getCenter() ?? null;
      this.initialZoom = map.getView().getZoom() ?? 0;
    }
    map.on('pointermove', this.pointerMoveListener);
    this.projection = map.getView().getProjection().getCode();

    this.crearMensaje(map);
  }

  /**
   * Metodo para crear el mensaje de ayuda para crear el rectangulo
   * de seleccion del area
   * @param map mapa al que se le agrega el mensaje de ayuda
   */
  crearMensaje(map: Map) {
    if (!map) {
      console.error('Error al obtener el mapa');
      throw new Error('Error al obtener el mapa');
    }
    if (!this.mensajeAyuda) {
      const mensajeDiv = document.createElement('div');
      mensajeDiv.className = 'mensaje-overlay';
      mensajeDiv.innerText = `Haga clic en el mapa para comenzar a delimitar el área de 
        selección y suelte para finalizar la selección.`;
      mensajeDiv.style.cssText = `
            position: absolute;
            background-color: rgba(0,0,0,0.7);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: pre-line;
          `;

      this.mensajeAyuda = new Overlay({
        element: mensajeDiv,
        positioning: 'bottom-center',
        stopEvent: false,
      });
      map.addOverlay(this.mensajeAyuda);
      this.centerMap(map, this.mensajeAyuda);
      this.addDrawToMap(
        map,
        this.vectorLayer,
        this.drawInteraction,
        this.vectorSource
      );
    }
  }

  /**
   * Metodo para centrar el mapa
   * @param map mapa
   * @param mensajeOverlay mensaje de ayuda
   */
  centerMap(map: Map, mensajeOverlay: Overlay | null = null) {
    if (this.initialCenter) {
      map.getView().setCenter(this.initialCenter);
      map.getView().setZoom(this.initialZoom);
    }

    if (mensajeOverlay) {
      mensajeOverlay.setPosition(
        this.initialCenter ?? map.getView().getCenter()
      );
      mensajeOverlay.getElement()?.classList.remove('oculto');
      (mensajeOverlay.getElement() as HTMLElement).style.display = 'block';
    }
  }

  /**
   * Metodo para agregar el dibujo al mapa
   * @param map mapa
   * @param vectorLayer vector
   * @param drawInteraction  dibujo
   * @param vectorSource vector fuente
   */
  addDrawToMap(
    map: Map,
    vectorLayer: VectorLayer,
    drawInteraction: Draw | null,
    vectorSource: VectorSource
  ) {
    if (!map.getLayers().getArray().includes(vectorLayer)) {
      map.addLayer(vectorLayer);
    }

    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
    }

    drawInteraction = new Draw({
      source: vectorSource,
      type: 'Circle',
      geometryFunction: createBox(),
    });

    map.addInteraction(drawInteraction);
    this.drawInteraction = drawInteraction;
    this.moveOverlayWithPointer(drawInteraction);
  }

  /**
   * Metodo para mover el mensaje del overlay con el puntero
   * @param drawInteraction interaccion del dibujo
   * @returns
   */
  moveOverlayWithPointer(drawInteraction: Draw | null) {
    if (!drawInteraction) return;

    drawInteraction.once('drawend', (event: { feature: Feature<Geometry> }) => {
      const feature = event.feature;
      const geometry = feature.getGeometry();
      // Ocultar el mensaje
      if (this.mensajeAyuda) {
        (this.mensajeAyuda.getElement() as HTMLElement).style.display = 'none';
      }
      const map = this.mapService.map;
      if (!map || !geometry) {
        return;
      }
      if (this.mensajeAyuda) {
        (this.mensajeAyuda.getElement() as HTMLElement).style.display = 'none';
        map.removeOverlay(this.mensajeAyuda);
        this.mensajeAyuda = null;
      }
      if (this.drawInteraction) {
        map.removeInteraction(this.drawInteraction);
        this.drawInteraction = null;
      }
      map.un('pointermove', this.pointerMoveListener);
      const extent = geometry.getExtent();
      if (!this.selectedLayer) {
        this.messageService.add({
          summary: 'Error',
          detail: 'No se ha seleccionado una capa',
          severity: 'error',
          life: 3000,
        });
        return;
      }

      switch (this.selectedLayer.tipoServicio) {
        case 'REST':
          console.warn('Servico REST');
          this.messageService.add({
            summary: 'Error',
            detail: 'La capa seleccionada no contiene servicio WMS',
            severity: 'error',
            sticky: true,
          });
          break;
        case 'WMS':
          try {
            this.getWFSFeaureInfo(
              this.selectedLayer,
              [extent[0], extent[1], extent[2], extent[3]],
              this.projection
            );
            this.drawInteraction = null;
            drawInteraction.finishDrawing();
          } catch (error) {
            if (error instanceof Error) {
              console.error(error);
              this.messageService.add({
                summary: 'Error',
                detail: error.message,
                severity: 'error',
                life: 3000,
              });
            } else {
              console.error(error);
              this.messageService.add({
                summary: 'Error',
                detail: 'Se ha presentado un error desconocido',
                severity: 'error',
                life: 3000,
              });
            }
          }

          break;
      }
    });
  }

  /**
   *Metodo para establecer la capa seleccionada
   * @param layerDefinition capaSeleccionada
   */
  setLayerSelected(layerDefinition: CapaMapa | undefined) {
    this.selectedLayer = layerDefinition;
  }

  /**
   * Metodo para obtener la url de consulta de un feature WMS
   * @param layer
   * @param coordinate
   * @param resolution
   * @param projection
   * @param params
   */
  getWFSFeaureInfo(
    layer: CapaMapa,
    extent: [number, number, number, number],
    projection: string
  ) {
    const [minX, minY, maxX, maxY] = extent;
    const bbox = `${minX},${minY},${maxX},${maxY}`;
    const url = `${layer.urlServicioWFS}service=WFS&version=1.1.0&request=GetFeature&typename=${layer.nombre}&outputFormat=application/json&srsname=${projection}&bbox=${bbox},${projection}`;

    if (url) {
      let urlToQuery = '';
      if (this.proxyUrl !== undefined) {
        urlToQuery = this.proxyUrl + url;
      } else {
        urlToQuery = url;
      }
      this.setIsSearchingInfo(true);
      this.seleccionEspacialQueryService
        .searchWFSFeatures(urlToQuery)
        .then(response => {
          if (this.mensajeAyuda) {
            (this.mensajeAyuda.getElement() as HTMLElement).style.display =
              'none';
          }

          const featureList: GeoJSONGeometrias[] = [];
          if (response && response.features.length > 0) {
            const features = response.features;
            features.forEach(feature => {
              const resultFeature = feature as FeatureWFSResult;
              const geoJSONGeometria: GeoJSONGeometrias = {
                type: resultFeature.type,
                geometry: resultFeature.geometry,
                properties: resultFeature.properties,
              };
              featureList.push(geoJSONGeometria);
            });
            const attributeTable: AttributeTableData = {
              titulo: 'seleccion-espacial',
              geojson: { type: '', features: featureList },
              visible: true,
            };
            //enviar a la tabla de atributos
            this.mapStore.dispatch(
              MapActions.setWidgetAttributeTableData({
                widgetId: 'tabla-atributos',
                data: attributeTable,
              })
            );
            //activar la tabla de atributos
            this.userService.dispatch(
              AbrirWidget({ nombre: 'attributeTable', estado: true })
            );

            this.featureListFounded = featureList;
            //pendiente pintar las geometrias
            this.drawGeometries(this.featureListFounded);
          } else if (response && response.features.length === 0) {
            this.messageService.add({
              summary: 'Aviso',
              detail:
                'No se han encontrado geometrías dentro del área seleccionada',
              severity: 'warn',
              life: 3000,
            });
          }
          this.setIsSearchingInfo(false);
        })
        .catch(err => {
          console.error('Error: ', err);
          if (err instanceof Error) {
            this.messageService.add({
              summary: 'Error',
              detail: err.message,
              severity: 'error',
              life: 3000,
            });
          } else {
            this.messageService.add({
              summary: 'Error',
              detail: 'Se ha presentado un error desconocido',
              severity: 'error',
              life: 3000,
            });
          }
          this.setIsSearchingInfo(false);
        });
    } else {
      this.messageService.add({
        summary: 'Error',
        detail: 'No se ha encontrado la URL de la geometría',
        severity: 'error',
        life: 3000,
      });
    }
  }

  /**
   * Metodo para borrar la seleccion del área y las
   * geometrías encontradas
   */
  deleteSelection() {
    this.deleteGeometries();
    this.deleteDraw();
    const map = this.mapService.map;
    if (map) {
      this.centerMap(map); // ← Ajusta vista al zoom inicial
    }
  }

  /**
   * Metodo para eliminar una geometria del mapa
   * @returns
   */
  deleteDraw() {
    const map = this.mapService.map;
    if (!map) return;
    map.getLayers().remove(this.vectorLayer);
    if (this.drawInteraction) map.removeInteraction(this.drawInteraction);
  }

  /**
   * Metodo para dibujar una lista de geometrías
   * @param list lista de geometrias
   */
  drawGeometries(list: GeoJSONGeometrias[]) {
    if (list && list.length > 0) {
      list.forEach(element => {
        this.drawGeometry(element);
      });
    }
  }

  /**
   * Dibujar las geometrias a partir de los features encontrados
   * @param featureData featureEncontrado
   */
  drawGeometry(featureData: GeoJSONGeometrias) {
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(featureData),
    });
    // Crear una capa vectorial para mostrar la geometría
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 3,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)',
        }),
      }),
      properties: { id: 'featureData' },
    });
    this.drawedVectorLayerList.push(vectorLayer);
    //agrega la capa al mapa
    //busco grupo de capas superior y eliminar cuando se vuielva a dibujar
    const layerGroup = this.mapService.getLayerGroupByName(LayerLevel.UPPER);
    if (layerGroup) {
      layerGroup.getLayers().push(vectorLayer);
      this.mapService.map?.addLayer(vectorLayer);
    } else {
      this.messageService.add({
        summary: 'Error',
        detail: 'No se ha encontrado el nivel de capas.',
        severity: 'error',
        life: 3000,
      });
    }
  }

  /**
   * Metodo que elimina las geometrias almacenadas
   */
  deleteGeometries() {
    this.userService.dispatch(
      AbrirWidget({ nombre: 'attributeTable', estado: false })
    );
    if (this.drawedVectorLayerList && this.drawedVectorLayerList.length > 0) {
      //this.identifyQueryService.emitData(null);
      const layerGroup = this.mapService.getLayerGroupByName(LayerLevel.UPPER);
      if (layerGroup) {
        this.drawedVectorLayerList.forEach(element => {
          layerGroup.getLayers().remove(element);
          this.mapService.map?.removeLayer(element);
        });
      } else {
        this.messageService.add({
          summary: 'Error',
          detail: 'No se ha encontrado el nivel de capas.',
          severity: 'error',
          life: 3000,
        });
      }
    }
  }
}
