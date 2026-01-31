import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import GeoJSON from 'ol/format/GeoJSON';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { IdentifyQueryService } from '@app/widget/identify/services/identify-query-service/identify-query.service';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { ResultIdentifyWMSQuery } from '@app/widget/identify/interfaces/ResultIdentifyQuery';
import { MapActions } from '@app/core/store/map/map.actions';
import { AbrirWidget } from '@app/core/store/user-interface/user-interface.actions';
import { MapService } from '@app/core/services/map-service/map.service';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { MapState } from '@app/core/interfaces/store/map.model';
import { FeatureResult } from '../../interfaces/FeatureResult';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { environment } from 'environments/environment';

/**
 * Servicio para gestionar las consultas a capas de tipo WFS
 * @date 2025/10/31
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Injectable({ providedIn: 'root' })
export class IdentifyWfsService {
  proxyURL = environment.map.proxy; // indica la URL del proxy para realizar peticiones
  private destroy$ = new Subject<void>(); //administrador de suscripciones
  drawedVectorLayer: VectorLayer | null = null; // vectorlayer pintado en el mapa

  fluorescentGreenYellowColor = '#CCFF00'; //verde amarillo neon muy brillante
  neonPinkColor = '#FF1493'; //Rosa intenso tipo marcador fosforescente
  electricCyanColor = '#00FFFF'; //Azul celeste saturado tipo neón
  fluoresecentOrangeColor = '#FF6600'; //Naranja intenso, muy visible sobre fondos oscuros
  neonPurpleColor = '#BF00FF'; //Morado eléctrico, resalta muchísimo
  radiusBase = 5;
  widthBase = 3;

  constructor(
    private mapStore: Store<MapState>,
    private identifyQueryService: IdentifyQueryService,
    private messageService: MessageService,
    private userStore: Store<UserInterfaceState>,
    private mapService: MapService
  ) {}

  /**
   * Metodo para obtener la url de consulta de un feature WMS
   * @param layer capa seleccionada
   * @param coordinate coordenada
   * @param resolution resolucion del mapa
   * @param projection sistema de proyeccion del mapa
   * @param params paramatros de la consulta
   */
  getWFSFeatureInfo(
    layer: ImageLayer<ImageWMS>,
    coordinate: number[],
    resolution: number,
    projection: string,
    params: object
  ) {
    this.mapStore.dispatch(MapActions.deleteGeometryIdentified());
    const urlFeatureInfo = layer
      .getSource()
      ?.getFeatureInfoUrl(coordinate, resolution, projection, params);

    if (urlFeatureInfo) {
      let urlToQuery = '';
      if (this.proxyURL !== undefined) {
        urlToQuery = this.proxyURL + urlFeatureInfo;
      } else {
        urlToQuery = urlFeatureInfo;
      }
      this.identifyQueryService
        .searchWFSFeature(urlToQuery)
        .then(response => {
          if (response && response.features.length > 0) {
            this.messageService.clear();
            this.drawGeometry(response);
            this.mapStore.dispatch(
              MapActions.addGeometryIdentified({
                geometryIdentified: {
                  geometry: response,
                  layerName: layer.getProperties()['titulo'],
                },
              })
            );
            this.userStore.dispatch(
              AbrirWidget({ estado: true, nombre: 'ResultadoIdentificar' })
            );
          } else {
            this.messageService.add({
              summary: 'Aviso',
              detail: 'No se ha identificado una geometría válida',
              severity: 'warn',
              sticky: true,
            });
            this.userStore.dispatch(
              AbrirWidget({ estado: false, nombre: 'ResultadoIdentificar' })
            );
          }
        })
        .catch(err => {
          this.userStore.dispatch(
            AbrirWidget({ estado: false, nombre: 'ResultadoIdentificar' })
          );

          this.messageService.add({
            summary: 'Error',
            detail: 'Error al consultar la geometría WFS',
            severity: 'error',
            life: 3000,
          });
          console.error('Error: ', err);
        });
    } else {
      this.messageService.add({
        summary: 'Error',
        detail: 'No se ha podido obtener la URL de consulta WFS',
        severity: 'error',
        life: 3000,
      });
    }
  }

  /**
   * Dibujar las geometrias a partir de los features encontrados
   * @param featureData featureEncontrado
   */
  drawGeometry(featureData: ResultIdentifyWMSQuery): VectorLayer {
    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(featureData),
    });
    // Crear una capa vectorial para mostrar la geometría
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: this.getStylesOfFeatures(featureData.features),
      properties: { id: 'featureData' },
    });
    this.drawedVectorLayer = vectorLayer;
    //agrega la capa al mapa
    //buscar grupo de capas superior y eliminar cuando se vuielva a dibujar
    const layerGroup = this.mapService.getLayerGroupByName(LayerLevel.UPPER);
    if (layerGroup) {
      layerGroup.getLayers().push(vectorLayer);
      //this.mapService.map?.addLayer(vectorLayer);
    } else {
      this.messageService.add({
        summary: 'Error',
        detail: 'No se ha encontrado el nivel de capas.',
        severity: 'error',
        life: 3000,
      });
    }
    return vectorLayer;
  }

  /**
   * Elimina la geometria dibujada en el mapa y oculta el widget de mostrar resultado
   */
  deleteGeometry() {
    this.mapStore.dispatch(MapActions.deleteGeometryIdentified());
    if (this.drawedVectorLayer) {
      const layerGroup = this.mapService.getLayerGroupByName(LayerLevel.UPPER);
      if (layerGroup) {
        layerGroup.getLayers().remove(this.drawedVectorLayer);
        this.mapService.map?.removeLayer(this.drawedVectorLayer);
        this.userStore.dispatch(
          AbrirWidget({ estado: false, nombre: 'ResultadoIdentificar' })
        );
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

  /**
   * Destruir la suscripcion del subject
   */
  destroysubject(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Metodo para obtener el estilo del feature de acuerdo con el tipo (Point, Multipoint,LineString,MultiLineString, Polygon, MultiPolygon,GeometryCollection,Circle)
   * @param feature feature
   * @returns configuracion de estilos para el feature
   */
  getStyleOfFeature(feature: FeatureResult): Style | null {
    //colores

    if (feature.geometry !== null) {
      try {
        const geometry = feature.geometry as {
          type: string;
          coordinates: [[number, number]];
        };
        // Estilos reutilizables
        const strokePinkColor = new Stroke({
          color: this.neonPinkColor,
          width: this.widthBase * 2,
        });
        const strokePinkWide = new Stroke({
          color: this.neonPinkColor,
          width: this.widthBase * 2,
        });
        const strokeGreenYellow = new Stroke({
          color: this.fluorescentGreenYellowColor,
          width: this.widthBase,
        });
        const strokeCyanDashed = new Stroke({
          color: this.electricCyanColor,
          lineDash: [4],
          width: this.widthBase * 3,
        });
        const strokePurple = new Stroke({
          color: this.neonPurpleColor,
          width: this.widthBase * 2,
        });
        const fillYellowLight = new Fill({ color: 'rgba(255, 255, 0, 0.1)' });
        const fillBlueLight = new Fill({ color: 'rgba(0, 0, 255, 0.1)' });
        const fillPurple = new Fill({ color: this.neonPurpleColor });
        const fillRedLight = new Fill({ color: this.fluoresecentOrangeColor });

        const circleImageSmall = new CircleStyle({
          radius: this.radiusBase,
          fill: undefined,
          stroke: strokePinkColor,
        });

        const circleImageMagenta = new CircleStyle({
          radius: this.radiusBase * 2,
          fill: undefined,
          stroke: new Stroke({ color: this.neonPurpleColor }),
        });
        const styles: Record<string, Style> = {
          Point: new Style({ image: circleImageSmall }),
          MultiPoint: new Style({ image: circleImageSmall }),
          LineString: new Style({ stroke: strokeGreenYellow }),
          MultiLineString: new Style({ stroke: strokeGreenYellow }),
          Polygon: new Style({ stroke: strokeCyanDashed, fill: fillBlueLight }),
          MultiPolygon: new Style({
            stroke: strokeGreenYellow,
            fill: fillYellowLight,
          }),
          GeometryCollection: new Style({
            stroke: strokePurple,
            fill: fillPurple,
            image: circleImageMagenta,
          }),
          Circle: new Style({ stroke: strokePinkWide, fill: fillRedLight }),
        };
        return styles[geometry.type] ?? null;
      } catch (error) {
        console.error('Error al cargar los estilos del feature ', error);
        this.messageService.add({
          summary: 'Error',
          detail: 'La geometría no tiene el formato adecuado',
          severity: 'error',
          sticky: true,
        });
        return null;
      }
    }
    return null;
  }

  /**
   * Metodo para obtener los estilos de una lista de features
   * @param features lista de features
   * @returns lista de estilos
   */
  getStylesOfFeatures(features: FeatureResult[]): Style[] {
    const styles: Style[] = [];
    features.forEach(feature => {
      const style = this.getStyleOfFeature(feature);
      if (style !== null) styles.push(style);
    });
    return styles;
  }
}
