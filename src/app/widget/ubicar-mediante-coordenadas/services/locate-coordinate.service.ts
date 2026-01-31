import { Injectable } from '@angular/core';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Point } from 'ol/geom';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { MapService } from '@app/core/services/map-service/map.service';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import proj4 from 'proj4';
import { Coordinate } from 'ol/coordinate';

/**
 * Servicio con los metodos encargados de crear o eliminar una capa
 * ubicando un punto en las coordenadas suministradas
 * @author Gregory Nicolas Murcia Buitrago
 **/

@Injectable()
export class LocateCoordinateService {
  initialZoom = 0; //zoom inicial del mapa
  initialCenter: Coordinate | null = null; //centro inicial del mapa
  /**
   * @Description Contructor de clase
   * @param mapService - Servicio de mapa
   * Se registra las proyecciones al instanciar el servicio
   **/
  constructor(private mapService: MapService) {
    this.registrarProyecciones();
    const map = this.mapService.map;
    if (map) {
      this.initialCenter = map.getView().getCenter() ?? null;
      this.initialZoom = map.getView().getZoom() ?? 0;
    }
  }

  /**
   * @Description Metodo encargado de crear una capa y
   * ubicar un punto en las coordenadas recibidas
   * @param coordinates - Coordenadas a ubicar
   * @param idCoordenada id de la coordenada a crear --> para poder eliminar dinamicamente
   **/
  addPointToMap(coordinates: [number, number], idCoordenada: string): void {
    if (!coordinates || coordinates.length !== 2) {
      return;
    }

    // Crea un objeto Point usando las coordenadas proporcionadas
    const point = new Point(coordinates);

    // Crear un Feature con el punto
    const pointFeature = new Feature(point);

    // Establecer un estilo para el punto (usando un ícono)
    const style = new Style({
      image: new Icon({
        src: 'assets/images/icon.png',
        scale: 1,
      }),
    });

    // Asigna el estilo al Feature del punto
    pointFeature.setStyle(style);

    //Crear una fuente vectorial que contendrá el punto
    const vectorSource = new VectorSource({
      features: [pointFeature], // Aquí añades el Feature creado con el punto
    });

    //Crear una capa vectorial que utilizará la fuente vectorial
    const vectorLayer = new VectorLayer({
      source: vectorSource, // Fuente de datos (nuestro punto)
      properties: {
        id: idCoordenada,
        name: idCoordenada,
      },
    });

    //Obtener el grupo de capas "superiores" del mapa
    const upperLayerGroup = this.mapService.getLayerGroupByName(
      LayerLevel.UPPER
    );
    if (upperLayerGroup) {
      //Si se encuentra el grupo de capas "superiores", se añade la capa del punto a ese grupo
      upperLayerGroup.getLayers().push(vectorLayer); // Añade la capa al grupo de capas superiores
    }
  }

  /**
   * @Description Metodo para centrar el mapa en las coordenadas del punto ubicado
   * y aplicar zoom
   * @param coordinates - Coordenadas para centrar el mapa
   **/
  centerMapOnPoint(coordinates: [number, number], zoomLevel?: number): void {
    const map = this.mapService.getMap(); // Obtener el mapa

    if (map) {
      // Verificar si el mapa no es null
      const view = map.getView(); // Obtener la vista del mapa
      if (view) {
        const currentZoom = view.getZoom() ?? 0;
        const newZoom = Math.min(currentZoom + (zoomLevel ?? 1), 20); // Zoom máximo 20
        // Centrar la vista en las coordenadas dadas
        view.setCenter(coordinates);
        view.setZoom(newZoom);
      } else {
        console.warn('No se pudo obtener la vista del mapa.');
      }
    } else {
      console.warn('El mapa no está disponible aún.');
    }
  }

  /**
   * @Description Metodo encargado de eliminar la capa y el punto creados
   * @param layerName - Nombre de la capa creada
   **/
  removeLayerByName(layerName: string) {
    const upperLayerGroup = this.mapService.getLayerGroupByName(
      LayerLevel.UPPER
    );
    if (!upperLayerGroup) {
      return;
    }

    // Obtener el array de capas del grupo
    const layersArray = upperLayerGroup.getLayers().getArray();

    // Encontrar el índice de la capa con el nombre especificado
    const layerIndex = layersArray.findIndex(
      layer => layer.get('name') === layerName
    );

    if (layerIndex !== -1) {
      layersArray.splice(layerIndex, 1);
      // Actualizar el mapa para que se refleje la eliminación
      const map = this.mapService.getMap();
      if (map) {
        map.render();
      }
    }
  }

  /**
   * Registra las diferentes proyecciones
   * Informacion extraida de
   * https://epsg.io/4686
   * https://epsg.io/9377
   * https://epsg.io/4326
   */
  private registrarProyecciones(): void {
    // Definición de EPSG:9377 (SIRGAS 2000 / MAGNA-SIRGAS)
    proj4.defs(
      'EPSG:9377',
      '+proj=tmerc +lat_0=4 +lon_0=-73 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
    );
    // Definición de EPSG:4686 (SIRGAS 2000 geográfico)
    proj4.defs('EPSG:4686', '+proj=longlat +ellps=GRS80 +no_defs +type=crs');

    // Registrar las definiciones con OpenLayers
    proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
  }
  /**
   * Transformar una coordenada de un sistema de proyeccion a otro
   * @param proyeccionOrigen sistema de proyeccion origen
   * @param proyeccionDestino sistema de proyeccion destino
   * @param coordenada coordenada a transformar
   * @returns
   */
  transformarCoordenada(
    proyeccionOrigen: 'EPSG:4686' | 'EPSG:9377' | 'EPSG:4326',
    proyeccionDestino: string,
    coordenada: [number, number]
  ): [number, number] {
    return proj4(proyeccionOrigen, proyeccionDestino, coordenada);
  }

  /**
   * Metodo para restablecer el zoom y el centro del mapa
   * al cerrar el componente
   */
  restartZommAndCenter() {
    const map = this.mapService.map;
    if (this.initialCenter && map) {
      map.getView().setCenter(this.initialCenter);
      map.getView().setZoom(this.initialZoom);
    }
  }
}
