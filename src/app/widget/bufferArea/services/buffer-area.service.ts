/**
 * Servicio para gestionar la selección de geometrías y la generación de buffers utilizando el servicio WFS.
 *
 * Este servicio permite a los usuarios seleccionar una geometría en el mapa mediante una interacción de dibujo
 * (tipo círculo) y, tras seleccionar la geometría, se envía una petición WFS para generar un buffer alrededor de ella.
 * Además, ofrece métodos para convertir las geometrías seleccionadas de GeoJSON a GML y para convertir las distancias
 * a metros, tomando en cuenta diferentes unidades de medida.
 *
 * @author Carlos Alberto Aristizabal Vargas
 * @date 06-05-2025
 * @version 1.0.0
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Map as OlMap } from 'ol';
import Draw, { createBox } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { MapService } from '@app/core/services/map-service/map.service';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { environment } from 'environments/environment';
import Overlay from 'ol/Overlay';
import { MapBrowserEvent } from 'ol';
import {
  AttributeTableData,
  GeoJSONData,
  GeoJSONGeometrias,
  Geometria,
} from '@app/widget/attributeTable/interfaces/geojsonInterface';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { FeatureCollection } from 'geojson';
import { selectWidgetData } from '@app/core/store/map/map.selectors';
import { Store } from '@ngrx/store';
import { BufferRequestDTO } from '@app/widget/bufferArea/Interfaz/bufferInterfaz';
import { Style, Stroke, Fill } from 'ol/style';

@Injectable({
  providedIn: 'root',
})
export class BufferAreaService {
  /**
   * Interacción de dibujo activa en el mapa.
   */
  public drawInteraction: Draw | null = null;

  /**
   * Fuente vectorial utilizada para almacenar geometrías dibujadas.
   */
  public vectorSource = new VectorSource();

  /**
   * Capa vectorial que contiene las geometrías dibujadas para el buffer.
   */
  public vectorLayer: VectorLayer = new VectorLayer({
    source: this.vectorSource,
  });

  /**
   * Superposición utilizada para mostrar un mensaje al usuario cuando se activa la selección de geometría.
   */
  private mensajeOverlay: Overlay | null = null;

  /**
   * URL del servicio remoto que realiza la operación de buffer.
   */
  private UrlService: string | undefined;

  /**
   * Geometría base dibujada en el mapa por el usuario.
   */
  private geometriaBaseDibujada: Geometry | null = null;

  /**
   * Crea una instancia del servicio BufferAreaService.
   *
   * @param http Cliente HTTP para realizar peticiones a servidores.
   * @param mapService Servicio para gestionar el mapa OpenLayers.
   * @param store Store de NgRx para acceder al estado global.
   */
  constructor(
    public http: HttpClient,
    public mapService: MapService,
    private store: Store
  ) {
    // Obtener widgetData desde el store una vez al crear el servicio
    firstValueFrom(this.store.select(selectWidgetData('Buffer'))).then(
      (widgetData: unknown) => {
        this.UrlService = (widgetData as { urlService: string }).urlService;
      }
    );
  }

  /**
   * Limpia las geometrías dibujadas, interacciones y capas asociadas al buffer.
   */
  public limpiarGeometrias(): void {
    const map = this.mapService.getMap();
    if (!map) return;

    this.vectorSource.clear();

    const upperGroup = this.mapService.getLayerGroupByName(LayerLevel.UPPER);
    if (
      upperGroup &&
      upperGroup.getLayers().getArray().includes(this.vectorLayer)
    ) {
      upperGroup.getLayers().remove(this.vectorLayer);
    }

    if (this.drawInteraction) {
      map.removeInteraction(this.drawInteraction);
      this.drawInteraction = null;
    }

    map.getOverlays().clear();
    this.mensajeOverlay = null;
  }

  /**
   * Consulta una capa WFS usando la geometría dibujada y genera un buffer con las entidades encontradas.
   *
   * @private
   * @param geometry Geometría utilizada como filtro espacial.
   * @param nombreCapa Nombre de la capa WFS a consultar.
   * @param urlWfs URL del servicio WFS.
   * @param distanciaMetros Distancia del buffer en metros.
   * @returns Promesa con los datos de la tabla de atributos.
   */
  private async consultarSeleccionEspacialYGenerarBuffer(
    geometry: Geometry,
    nombreCapa: string,
    urlWfs: string,
    distanciaMetros: number
  ): Promise<AttributeTableData[]> {
    const extent = geometry.getExtent();
    const [minX, minY, maxX, maxY] = extent;
    const projection =
      this.mapService.getMap()?.getView().getProjection().getCode() ||
      'EPSG:4326';

    const url = `${urlWfs}service=WFS&version=1.1.0&request=GetFeature&typename=${nombreCapa}&outputFormat=application/json&srsname=${projection}&bbox=${minX},${minY},${maxX},${maxY},${projection}`;

    const fullUrl = `${environment.map.proxy}${encodeURIComponent(url)}`;

    const responseText = await firstValueFrom(
      this.http.get(fullUrl, { responseType: 'text' })
    );

    const featureCollection: FeatureCollection = JSON.parse(responseText);

    if (
      !featureCollection.features ||
      featureCollection.features.length === 0
    ) {
      throw new Error(
        'No se encontraron entidades dentro de la geometría dibujada.'
      );
    }

    const bufferResponse = await this.generarBufferDesdeGeojson(
      featureCollection,
      distanciaMetros,
      false
    );

    const geojson: GeoJSONData = {
      type: 'FeatureCollection',
      features: bufferResponse.features.map(f => ({
        type: f.type,
        geometry: f.geometry as Geometria,
        properties: f.properties ?? {},
      })),
    };

    const resultados: AttributeTableData[] = [
      {
        titulo: `${nombreCapa} (Buffer ${distanciaMetros}m)`,
        geojson,
        visible: true,
      },
    ];

    return resultados;
  }

  /**
   * Envía una solicitud al servicio /buffer para generar un buffer desde un GeoJSON.
   *
   * @param geojson Colección de geometrías en formato GeoJSON.
   * @param distancia Distancia del buffer en metros.
   * @param disolver Indica si se debe disolver la geometría resultante.
   * @returns Promesa con el resultado del buffer como FeatureCollection.
   */
  public generarBufferDesdeGeojson(
    geojson: FeatureCollection,
    distancia: number,
    disolver = false
  ): Promise<FeatureCollection> {
    if (!this.UrlService) {
      return Promise.reject('No se ha definido la URL del servicio');
    }

    const url = environment.buffer.url;
    const featuresConvertidos: GeoJSONGeometrias[] = geojson.features.map(
      f => ({
        type: f.type,
        geometry: f.geometry as Geometria,
        properties: f.properties ?? {},
      })
    );

    const body: BufferRequestDTO = {
      dissolve: disolver,
      distanceMeters: distancia,
      geometryGeoJson: {
        type: 'FeatureCollection',
        features: featuresConvertidos,
      },
    };

    return firstValueFrom(
      this.http.post<FeatureCollection>(url, body, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
    );
  }

  /**
   * Inicia la interacción de dibujo para seleccionar el área base del buffer.
   *
   * Muestra un mensaje en el mapa indicando cómo realizar el dibujo. Al finalizar,
   * resuelve la promesa con la geometría seleccionada.
   *
   * @returns Promesa con la geometría dibujada.
   */
  public iniciarDibujoBuffer(): Promise<Geometry> {
    return new Promise((resolve, reject) => {
      const map: OlMap | null = this.mapService.getMap();
      if (!map) {
        reject('Mapa no inicializado');
        return;
      }

      if (!this.mensajeOverlay) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'mensaje-overlay';
        mensajeDiv.innerText = `Haga clic en el mapa para comenzar
          a delimitar el área de buffer y
          nuevamente para finalizar la selección.`;

        mensajeDiv.style.cssText = `
          position: absolute;
          background-color: rgba(0,0,0,0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: pre-line;
        `;

        this.mensajeOverlay = new Overlay({
          element: mensajeDiv,
          positioning: 'bottom-center',
          stopEvent: false,
        });

        map.addOverlay(this.mensajeOverlay);
      }

      const center = map.getView().getCenter();
      if (center && this.mensajeOverlay) {
        this.mensajeOverlay.setPosition(center);
        (this.mensajeOverlay.getElement() as HTMLElement).style.display =
          'block';
      }

      const upperGroup = this.mapService.getLayerGroupByName(LayerLevel.UPPER);
      if (upperGroup) {
        const layers = upperGroup.getLayers();
        const layerArray = layers.getArray();
        if (!layerArray.includes(this.vectorLayer)) {
          layers.push(this.vectorLayer);
        } else {
          const idx = layerArray.indexOf(this.vectorLayer);
          if (idx !== layerArray.length - 1) {
            layers.removeAt(idx);
            layers.push(this.vectorLayer);
          }
        }

        const estiloDibujo = new Style({
          stroke: new Stroke({
            color: 'rgba(15, 12, 12, 1)',
            width: 2,
          }),
          fill: new Fill({
            color: 'rgba(0, 123, 255, 0.3)',
          }),
        });

        this.vectorLayer.setStyle(estiloDibujo);
      }

      if (this.drawInteraction) {
        map.removeInteraction(this.drawInteraction);
      }

      this.drawInteraction = new Draw({
        source: this.vectorSource,
        type: 'Circle',
        geometryFunction: createBox(),
      });

      map.addInteraction(this.drawInteraction);

      const pointerMoveListener = (evt: MapBrowserEvent<UIEvent>): void => {
        if (this.mensajeOverlay) {
          this.mensajeOverlay.setPosition(evt.coordinate);
        }
      };
      map.on('pointermove', pointerMoveListener);

      this.drawInteraction.once(
        'drawend',
        (event: { feature: Feature<Geometry> }) => {
          const geometry = event.feature.getGeometry();
          (this.mensajeOverlay?.getElement() as HTMLElement).style.display =
            'none';

          if (!geometry) {
            reject('No se dibujó una geometría válida');
            return;
          }

          this.geometriaBaseDibujada = geometry;

          map.removeInteraction(this.drawInteraction!);
          this.drawInteraction = null;

          resolve(geometry);
        }
      );
    });
  }

  /**
   * Genera un buffer desde una geometría sin necesidad de interacción de dibujo.
   *
   * Este método es útil para trabajar con geometrías preexistentes.
   *
   * @param geometria Geometría base para la operación de buffer.
   * @param nombreCapa Nombre de la capa a consultar vía WFS.
   * @param urlWfs URL del servicio WFS.
   * @param distanciaMetros Distancia del buffer en metros.
   * @returns Promesa con los datos generados del buffer.
   */
  public async generarBufferDesdeGeometria(
    geometria: Geometry,
    nombreCapa: string,
    urlWfs: string,
    distanciaMetros: number
  ): Promise<AttributeTableData[]> {
    this.vectorSource.clear();
    this.geometriaBaseDibujada = null;

    return this.consultarSeleccionEspacialYGenerarBuffer(
      geometria,
      nombreCapa,
      urlWfs,
      distanciaMetros
    );
  }

  /**
   * Limpia la geometría dibujada en el mapa, remueve la interacción y oculta el mensaje.
   */
  public limpiarDibujoBuffer(): void {
    const map: OlMap | null = this.mapService.getMap();
    if (!map) return;

    if (this.drawInteraction) {
      map.removeInteraction(this.drawInteraction);
      this.drawInteraction = null;
    }

    if (this.vectorSource) {
      this.vectorSource.clear();
    }

    if (this.mensajeOverlay) {
      const el = this.mensajeOverlay.getElement() as HTMLElement;
      if (el) el.style.display = 'none';
      map.removeOverlay(this.mensajeOverlay);
      this.mensajeOverlay = null;
    }

    this.geometriaBaseDibujada = null;
  }
}
