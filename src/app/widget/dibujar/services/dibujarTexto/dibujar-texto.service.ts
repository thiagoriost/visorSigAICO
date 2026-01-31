import { Injectable } from '@angular/core';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Feature } from 'ol';
import { MapService } from '@app/core/services/map-service/map.service';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { Subject } from 'rxjs';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import Point from 'ol/geom/Point'; // Importar la clase Point

/**
 * Servicio encargado de gestionar interacciones de dibujo y medición en el mapa.
 * Permite dibujar geometrías, medir áreas y longitudes, y gestionar estilos personalizados.
 */
@Injectable({
  providedIn: 'root',
})
export class DibujarTextoService {
  private draw: Draw | null = null;
  private modify: Modify | null = null;
  private snap: Snap | null = null;
  private source: VectorSource;
  private vectorLayer: VectorLayer;
  private banderaIntento = 0; // Bandera para el número de intentos para el cargue del mapa

  // Colores y estilos
  private fillColor = 'rgba(6, 13, 112, 0.33)';
  private strokeColor = 'rgba(190, 7, 41, 0.5)';
  private strokeWidth = 4;

  // Variables para medición
  longitudSubject: Subject<number> = new Subject<number>();
  areaSubject: Subject<number> = new Subject<number>();
  // Crear un array para almacenar los textos
  private textoCreados: Feature[] = [];
  // Crear un array para almacenar los textos eliminados
  private textoEliminados: Feature[] = [];

  constructor(private mapService: MapService) {
    this.source = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.source,
    });

    this.inicializarCapaDibujo();
  }

  /**
   * Añade una interacción de dibujo al mapa basada en el texto a dibujar.
   */
  addTextFeature(text: string, colorTexto: string, tamañoTexto: number): void {
    const fontTexto = `${tamañoTexto}px sans-serif`;
    const map = this.mapService.getMap();

    if (!map) {
      return;
    }

    // Limpiar las características previas del vector source antes de iniciar un nuevo dibujo
    this.source.getFeatures().forEach(feature => {
      if (!feature.get('tipo')) {
        this.source.removeFeature(feature);
      }
    });

    // Eliminar interacciones previas si existen
    if (this.draw) {
      map.removeInteraction(this.draw);
    }
    if (this.snap) {
      map.removeInteraction(this.snap);
    }

    // Crear la interacción Draw, pero solo para el tipo de geometría Point (el clic en el mapa)
    const geometryType = 'Point';
    const style = new Style({
      fill: new Fill({
        color: this.fillColor,
      }),
      stroke: new Stroke({
        color: this.strokeColor,
        width: this.strokeWidth,
      }),
    });

    // Configurar la interacción Draw para que solo se dibuje el texto en el mapa
    this.draw = new Draw({
      source: this.source,
      type: geometryType,
      stopClick: true, // Este parámetro previene que el clic se detenga después de dibujar el punto
      style: style,
    });

    // Agregar la interacción de dibujo al mapa
    map.addInteraction(this.draw);

    // Esto es clave: Aquí hemos agregado el evento 'drawend', que es cuando el usuario termina de dibujar
    this.draw.on('drawend', event => {
      const feature: Feature = event.feature;
      const geometry = feature.getGeometry();

      if (geometry instanceof Point) {
        const coordinates = geometry.getCoordinates();

        // Verificar si el texto está disponible y agregarlo
        if (text && text.trim()) {
          // Crear la feature del texto en las coordenadas del clic
          const textFeature = new Feature({
            geometry: new Point(coordinates),
            tipo: 'texto',
          });

          textFeature.set('tipo', 'texto');

          // Crear el estilo con el texto
          const textStyle = new Style({
            text: new Text({
              text: text, // Usar el texto pasado como parámetro
              font: fontTexto,
              fill: new Fill({
                color: colorTexto, // Color del texto
              }),
              stroke: new Stroke({
                color: 'white', // Color del borde del texto
                width: 2,
              }),
            }),
          });

          // Asignar el estilo con texto a la feature
          textFeature.setStyle(textStyle);

          // Agregar la feature del texto al source
          this.source.addFeature(textFeature);

          // Guardar la característica de texto en el arreglo
          this.textoCreados.push(textFeature); // Guardamos la característica de texto
        }
      }
    });
  }

  /**
   * Actualiza el color de relleno para los elementos dibujados.
   */
  updateFillColor(color: string): void {
    this.fillColor = color;
    this.updateDrawingInteraction();
  }

  /**
   * Actualiza el color de contorno para los elementos dibujados.
   */
  updateStrokeColor(color: string): void {
    this.strokeColor = color;
    this.updateDrawingInteraction();
  }

  /**
   * Actualiza el grosor del contorno para los elementos dibujados.
   */
  updateStrokeWidth(width: number): void {
    this.strokeWidth = width;
    this.updateDrawingInteraction();
  }

  /**
   * Actualiza la interacción de dibujo con los nuevos estilos.
   */
  private updateDrawingInteraction(): void {
    const style = new Style({
      fill: new Fill({
        color: this.fillColor,
      }),
      stroke: new Stroke({
        color: this.strokeColor,
        width: this.strokeWidth,
      }),
    });

    if (this.draw) {
      const map = this.mapService.getMap();
      if (map) {
        map.removeInteraction(this.draw);
      }
    }

    const map = this.mapService.getMap();
    if (map) {
      this.draw = new Draw({
        source: this.source,
        type: 'Point',
        stopClick: true,
        style: style,
      });
      map.addInteraction(this.draw);
    }
  }

  /**
   * Método para deshacer el último texto.
   */
  deshacerTexto(): void {
    if (this.textoCreados.length > 0) {
      // Obtener la última característica de texto
      const ultimoTexto = this.textoCreados.pop();

      if (ultimoTexto) {
        // Eliminar la característica de texto del VectorSource
        this.source.removeFeature(ultimoTexto);

        // Guardar el texto en textos eliminados
        this.textoEliminados.push(ultimoTexto);

        // Limpiar el mapa y redibujar los textos restantes
        this.redibujarTexto();
      }
    }
  }

  /**
   * Limpiar todos los textos y redibujar los que quedan en textoCreados.
   */
  private redibujarTexto(): void {
    // Limpiar todas las características de texto del mapa
    this.source.clear();

    // Volver a agregar los textos restantes al VectorSource
    this.textoCreados.forEach(textFeature => {
      this.source.addFeature(textFeature);
    });
  }

  /**
   * Método para recuperar el último texto eliminado.
   */
  recuperarTexto(): void {
    if (this.textoEliminados.length > 0) {
      const textoRecuperado = this.textoEliminados.pop();

      // Verificar que textoRecuperado no sea undefined
      if (textoRecuperado) {
        this.textoCreados.push(textoRecuperado); // Solo lo agregamos si no es undefined
        this.redibujarTexto();
        console.log('Texto recuperado:', textoRecuperado);
      } else {
        console.log('Error: No se pudo recuperar el texto.');
      }
    } else {
      console.log('No hay textos para recuperar.');
    }
  }

  /**
   * Método para borrar los dibujos del mapa sin eliminarlos del array.
   */
  borrarTexto(): void {
    // Limpiar las geometrías del VectorSource (el mapa).
    this.source.clear();
  }

  /**
   * Inicia la capa de dibujo agregándola a la capa del mapa.
   */
  inicializarCapaDibujo() {
    this.banderaIntento++;

    const upperGroup = this.mapService.getLayerGroupByName(LayerLevel.UPPER);

    if (!upperGroup) {
      if (this.banderaIntento < 5) {
        setTimeout(() => {
          this.inicializarCapaDibujo();
        }, 1000);
      }
      return;
    }

    // Agregar la capa a grupo de capas
    upperGroup?.getLayers().push(this.vectorLayer);
  }

  /**
   * Elimina las interacciones de dibujo del mapa.
   */
  removeDrawingInteraction(): void {
    const map = this.mapService.getMap();

    if (!map) {
      console.error('El mapa no está disponible');
      return;
    }

    // Eliminar las interacciones de dibujo, modificación y snap si existen
    if (this.draw) {
      map.removeInteraction(this.draw);
      this.draw = null;
    }

    if (this.modify) {
      map.removeInteraction(this.modify);
      this.modify = null;
    }

    if (this.snap) {
      map.removeInteraction(this.snap);
      this.snap = null;
    }
  }

  /**
   * Verifica si existe al menos un texto dibujado que pueda ser deshecho.
   *
   * Este método evalúa si la lista `textoCreados` contiene elementos,
   * lo cual indica que hay textos actualmente dibujados en el mapa y por tanto
   * es posible realizar una operación de deshacer.
   *
   * @returns `true` si hay textos para deshacer, `false` en caso contrario.
   */
  puedeDeshacer(): boolean {
    return this.textoCreados.length > 0;
  }

  /**
   * Verifica si existe texto previamente deshecho que pueda ser recuperado.
   *
   * Actualmente este método reutiliza la condición `textoCreados.length > 0`,
   * lo cual indica que hay textos dibujados. Sin embargo, para una
   * implementación completa de recuperación, se recomienda
   * usar una pila separada (por ejemplo, `textoDeshechos`).
   *
   * @returns `true` si hay textos que pueden recuperarse, `false` en caso contrario.
   */
  puedeRecuperar(): boolean {
    return this.textoCreados.length > 0;
  }
}
