import { Injectable } from '@angular/core';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Feature } from 'ol';
import { MapService } from '@app/core/services/map-service/map.service';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Fill, Stroke } from 'ol/style';
import { Circle, LineString, Polygon } from 'ol/geom';
import { Subject } from 'rxjs';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { createRegularPolygon } from 'ol/interaction/Draw';
import Point from 'ol/geom/Point'; //Importar la clase
import { GeometriaEstilo } from '@app/widget/dibujar/interfaces/dibujar.geometriaEstilo';
import { Circle as CircleStyle } from 'ol/style';
import { environment } from 'environments/environment.development';
import { Text } from 'ol/style';
import { getLength as getGeodesicLength } from 'ol/sphere';

/**
 * Servicio encargado de gestionar interacciones de dibujo y medición en el mapa.
 * Permite dibujar geometrías, medir áreas y longitudes, y gestionar estilos personalizados.
 */
@Injectable({
  providedIn: 'root',
})
export class DibujarService {
  private draw: Draw | null = null;
  private modify: Modify | null = null;
  private snap: Snap | null = null;
  private source: VectorSource;
  private vectorLayer: VectorLayer;
  private banderaIntento = 0; // Bandera para el número de intentos para el cargue del mapa

  // Colores y estilos
  private fillColor = '#ffffff';
  private colorRelleno = '';

  private strokeColor = '#ffcc33';
  private colorContorno = '';

  private strokeWidth = 2;
  private grosorContorno = 2;

  private tipoGeometria = '';

  // Variables para mostrar texto de área y longitud
  public textoArea = '';
  public textoLongitud = '';
  public mostrarArea = false;
  public mostrarDistancia = false;

  // Variables para medición
  longitudSubject: Subject<number> = new Subject<number>();
  areaSubject: Subject<number> = new Subject<number>();
  // Crear un array para almacenar las geometrías
  private geometriaCreadas: GeometriaEstilo[] = [];
  // Array para guardar las geometrías eliminadas
  private geometriaEliminadas: GeometriaEstilo[] = [];
  constructor(private mapService: MapService) {
    this.source = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.source,
    });

    this.inicializarCapaDibujo();
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
  public updateDrawingInteraction(): void {
    if (!this.tipoGeometria) return;

    const map = this.mapService.getMap();
    if (!map) return;

    // Remover interacciones previas
    if (this.draw) map.removeInteraction(this.draw);
    if (this.snap) map.removeInteraction(this.snap);

    let geometryType: 'Point' | 'LineString' | 'Polygon' | 'Circle';
    let geometryFunction;

    switch (this.tipoGeometria) {
      case 'Point':
        geometryType = 'Point';
        break;
      case 'LineString':
      case 'Line':
      case 'LineAlzada':
        geometryType = 'LineString';
        break;
      case 'Polygon':
      case 'HanddrawPolygon':
        geometryType = 'Polygon';
        break;
      case 'Circle':
        geometryType = 'Circle';
        break;
      case 'Extension':
        geometryType = 'Circle';
        geometryFunction = createRegularPolygon(4);
        break;
      case 'Triangle':
        geometryType = 'Circle';
        geometryFunction = createRegularPolygon(3);
        break;
      default:
        geometryType = 'Point';
    }

    const style = new Style({
      fill: new Fill({ color: this.fillColor }),
      stroke: new Stroke({
        color: this.strokeColor,
        width: this.strokeWidth,
      }),
    });

    this.draw = new Draw({
      source: this.source,
      type: geometryType,
      stopClick: true,
      style: style,
      freehand:
        this.tipoGeometria === 'LineAlzada' ||
        this.tipoGeometria === 'HanddrawPolygon',
      geometryFunction: geometryFunction,
    });

    map.addInteraction(this.draw);

    this.draw.on('drawend', event => {
      const feature: Feature = event.feature;
      const geometry = feature.getGeometry();

      // Asignar estilo personalizado
      feature.setStyle(
        new Style({
          fill: new Fill({ color: this.fillColor }),
          stroke: new Stroke({
            color: this.strokeColor,
            width: this.strokeWidth,
          }),
        })
      );

      const projection = environment.map.projection; // 'EPSG:4326'

      //Para cálculos de distancia o área,
      //se realiza una transformación de la geometría a EPSG:3857
      //con el fin de obtener resultados precisos sobre la superficie terrestre.
      const metricProjection = 'EPSG:3857';

      let longitud = 0;
      let area = 0;

      // Medición de longitud para líneas
      if (geometry instanceof LineString) {
        const transformed = geometry
          .clone()
          .transform(projection, metricProjection);
        longitud = transformed.getLength();
        this.longitudSubject.next(longitud);
      }

      // Medición de área para polígonos
      if (geometry instanceof Polygon) {
        const transformed = geometry
          .clone()
          .transform(projection, metricProjection);
        area = transformed.getArea();

        // Calcular longitud del perímetro usando LineString
        const coordinates = transformed.getCoordinates()[0]; // anillo exterior
        const perimeterLine = new LineString(coordinates);
        longitud = getGeodesicLength(perimeterLine); // <-- uso correcto

        this.areaSubject.next(area);
        this.longitudSubject.next(longitud);
      }

      // Medición de área para círculos (o cuadrados, triángulos)
      if (geometry instanceof Circle) {
        const transformed = geometry
          .clone()
          .transform(projection, metricProjection);
        const radius = transformed.getRadius();
        area = Math.PI * Math.pow(radius, 2);
        longitud = 2 * Math.PI * radius; // Circunferencia
        this.areaSubject.next(area);
        this.longitudSubject.next(longitud);
      }

      // Aquí va tu fragmento
      let estiloConTexto: Style;
      const lineas: string[] = [];
      if (this.mostrarDistancia && longitud > 0) {
        lineas.push(this.textoLongitud);
      }

      if (this.mostrarArea && area > 0) {
        lineas.push(this.textoArea);
      }
      const texto = lineas.join('\n');
      if (texto) {
        const estiloExistente = feature.getStyle();
        console.log('texto:', texto);
        // Asegurarse de que estiloExistente sea instancia de Style
        let fill = undefined;
        let stroke = undefined;
        let image = undefined;
        if (estiloExistente instanceof Style) {
          fill = estiloExistente.getFill();
          stroke = estiloExistente.getStroke();
          image = estiloExistente.getImage();
        }
        estiloConTexto = new Style({
          fill: fill ?? undefined,
          stroke: stroke ?? undefined,
          image: image ?? undefined,
          text: new Text({
            text: texto,
            font: '14px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
            overflow: true,
          }),
        });

        feature.setStyle(estiloConTexto);
      } else {
        // Si no hay texto, guardar el estilo existente sin cambios
        estiloConTexto = feature.getStyle() as Style;
      }

      // Guardar geometría y estilo
      this.geometriaCreadas.push({
        geometry: feature,
        style: estiloConTexto, // <-- ¡Importante! Este ya incluye el texto
        area: this.textoArea || undefined,
        longitud: this.textoLongitud || undefined,
      });
    });
  }

  /**
   * Añade una interacción de dibujo al mapa basada en el tipo de geometría proporcionado.
   */
  addInteraction(type: string): void {
    const map = this.mapService.getMap();

    this.tipoGeometria = type;
    this.colorRelleno = this.fillColor;
    this.colorContorno = this.strokeColor;
    this.grosorContorno = this.strokeWidth;

    if (!map) {
      return;
    }

    // Limpiar los valores de longitud y área
    const longitud = 0;
    const area = 0;
    this.longitudSubject.next(longitud); // Emitir longitud como 0
    this.areaSubject.next(area); // Emitir área como 0

    // Eliminar interacciones previas si existen
    if (this.draw) {
      map.removeInteraction(this.draw);
    }
    if (this.snap) {
      map.removeInteraction(this.snap);
    }

    let geometryType: 'Point' | 'LineString' | 'Polygon' | 'Circle';
    let geometryFunction;
    const drawOptions: Partial<ConstructorParameters<typeof Draw>[0]> = {};
    // Determinar el tipo de geometría y función de geometría según el tipo seleccionado
    switch (type) {
      case 'Point':
        geometryType = 'Point';
        this.showMessageOnPointer(
          'Punto:,\nHaz clic una sola vez sobre el mapa para ubicar un punto.'
        );
        break;

      case 'Line':
        geometryType = 'LineString';
        drawOptions.maxPoints = 2;
        this.showMessageOnPointer(
          'Línea recta:,\n1. Haz clic en el punto de inicio.,\n2. Haz otro clic en el punto final.'
        );
        break;

      case 'LineString':
        geometryType = 'LineString';
        this.showMessageOnPointer(
          'Línea con varios segmentos:,\n1. Haz clic para cada punto de la línea.,\n2. Para finalizar haz doble clic.'
        );
        break;

      case 'LineAlzada':
        geometryType = 'LineString';
        this.showMessageOnPointer(
          'Línea a mano alzada:,\n1. Mantén presionado el clic izquierdo y dibuja libremente como si usaras un lápiz.,\n2. Suelta el clic para finalizar.'
        );
        break;

      case 'Polygon':
        geometryType = 'Polygon';
        this.showMessageOnPointer(
          'Polígono:,\n1. Haz clic para agregar cada vértice.,\n2. Haz doble clic para cerrar el polígono.'
        );
        break;

      case 'Circle':
        geometryType = 'Circle';
        this.showMessageOnPointer(
          'Círculo:,\n1. Haz clic para fijar el centro.,\n2. Mueve el mouse para ajustar el tamaño.,\n3. Haz clic de nuevo para finalizar.'
        );
        break;

      case 'Extension':
        geometryType = 'Circle';
        geometryFunction = createRegularPolygon(4);
        this.showMessageOnPointer(
          'Cuadrado:,\n1. Haz clic para el centro.,\n2. Mueve el mouse para ajustar el tamaño.,\n3. Haz clic para finalizar.'
        );
        break;

      case 'Triangle':
        geometryType = 'Circle';
        geometryFunction = createRegularPolygon(3);
        this.showMessageOnPointer(
          'Triángulo:,\n1. Haz clic para el centro.,\n2. Mueve el mouse para ajustar el tamaño.,\n3. Haz clic para finalizar.'
        );
        break;

      case 'HanddrawPolygon':
        geometryType = 'Polygon';
        this.showMessageOnPointer(
          'Polígono a mano alzada:,\n1. Mantén presionado el clic izquierdo.,\n2. Dibuja el contorno como si estuvieras usando un lápiz.,\n3. Suelta el clic para finalizar.'
        );
        break;

      default:
        geometryType = 'Point';
        this.showMessageOnPointer('Haz clic en el mapa para colocar un punto.');
    }

    // Crear el estilo con el color actualizado
    let style: Style;
    if (geometryType === 'Point') {
      style = new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: this.fillColor,
          }),
          stroke: new Stroke({
            color: this.strokeColor,
            width: this.strokeWidth,
          }),
        }),
      });
    } else {
      style = new Style({
        stroke: new Stroke({
          color: this.strokeColor,
          width: this.strokeWidth,
        }),
        fill: new Fill({
          color: this.fillColor,
        }),
      });
    }

    // Configurar la interacción Draw
    this.draw = new Draw({
      source: this.source,
      type: geometryType,
      stopClick: true,
      style: style,
      freehand: type === 'LineAlzada' || type === 'HanddrawPolygon', // Permitir 'freehand' para 'LineAlzada' y 'HanddrawPolygon'
      geometryFunction: geometryFunction, // Asignar la función de geometría para el cuadrado o triángulo
      ...drawOptions,
    });

    // Añadir la interacción de dibujo al mapa
    map.addInteraction(this.draw);

    this.draw.on('drawend', event => {
      const feature: Feature = event.feature;
      if (feature.get('tipo') === 'texto') return;
      const geometry = feature.getGeometry();

      // Asignar el estilo actualizado a la geometría
      if (geometry instanceof Point) {
        feature.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({
                color: this.fillColor,
              }),
              stroke: new Stroke({
                color: this.strokeColor,
                width: this.strokeWidth,
              }),
            }),
          })
        );
      } else {
        feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: this.strokeColor,
              width: this.strokeWidth,
            }),
            fill: new Fill({
              color: this.fillColor,
            }),
          })
        );
      }

      const projection = environment.map.projection; // 'EPSG:4326'

      //Para cálculos de distancia o área,
      //se realiza una transformación de la geometría a EPSG:3857
      //con el fin de obtener resultados precisos sobre la superficie terrestre.
      const metricProjection = 'EPSG:3857';

      let longitud = 0;
      let area = 0;

      // Medición de longitud para líneas
      if (geometry instanceof LineString) {
        const transformed = geometry
          .clone()
          .transform(projection, metricProjection);
        longitud = transformed.getLength();
        this.longitudSubject.next(longitud);
      }

      // Medición de área para polígonos
      if (geometry instanceof Polygon) {
        const transformed = geometry
          .clone()
          .transform(projection, metricProjection);
        area = transformed.getArea();

        // Calcular longitud del perímetro usando LineString
        const coordinates = transformed.getCoordinates()[0]; // anillo exterior
        const perimeterLine = new LineString(coordinates);
        longitud = getGeodesicLength(perimeterLine); // <-- uso correcto

        this.areaSubject.next(area);
        this.longitudSubject.next(longitud);
      }

      // Medición de área para círculos (o cuadrados, triángulos)
      if (geometry instanceof Circle) {
        const transformed = geometry
          .clone()
          .transform(projection, metricProjection);
        const radius = transformed.getRadius();
        area = Math.PI * Math.pow(radius, 2);
        longitud = 2 * Math.PI * radius; // Circunferencia
        this.areaSubject.next(area);
        this.longitudSubject.next(longitud);
      }

      // Aquí va tu fragmento
      let estiloConTexto: Style;
      const lineas: string[] = [];
      if (this.mostrarDistancia && longitud > 0) {
        lineas.push(this.textoLongitud);
      }

      if (this.mostrarArea && area > 0) {
        lineas.push(this.textoArea);
      }
      const texto = lineas.join('\n');
      if (texto) {
        console.log('texto:', texto);
        const estiloExistente = feature.getStyle();
        // Asegurarse de que estiloExistente sea instancia de Style
        let fill = undefined;
        let stroke = undefined;
        let image = undefined;
        if (estiloExistente instanceof Style) {
          fill = estiloExistente.getFill();
          stroke = estiloExistente.getStroke();
          image = estiloExistente.getImage();
        }
        estiloConTexto = new Style({
          fill: fill ?? undefined,
          stroke: stroke ?? undefined,
          image: image ?? undefined,
          text: new Text({
            text: texto,
            font: '14px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
            overflow: true,
          }),
        });

        feature.setStyle(estiloConTexto);
      } else {
        // Si no hay texto, guardar el estilo existente sin cambios
        estiloConTexto = feature.getStyle() as Style;
      }

      // Guardar geometría y estilo
      this.geometriaCreadas.push({
        geometry: feature,
        style: estiloConTexto, // <-- ¡Importante! Este ya incluye el texto
        area: this.textoArea || undefined,
        longitud: this.textoLongitud || undefined,
      });
    });
  }

  /**
   * Método para deshacer el último dibujo.
   */
  // Método para deshacer dibujo y redibujar las geometrías restantes
  deshacerDibujo(): void {
    if (this.geometriaCreadas.length > 0) {
      // Eliminar la última geometría de la lista de geometrías creadas
      const ultimaGeometriaConEstilo = this.geometriaCreadas.pop();

      if (ultimaGeometriaConEstilo) {
        // Eliminar la geometría del VectorSource
        this.source.removeFeature(ultimaGeometriaConEstilo.geometry);

        // Guardarlo en geometriaEliminadas para su posible recuperación
        this.geometriaEliminadas.push(ultimaGeometriaConEstilo);

        // Redibujar las geometrías restantes (si las hay)
        this.redibujarGeometrias();
      }
    }
  }

  /**
   * Limpiar todas las geometrías y redibujar las que quedan en geometriaCreadas
   */
  private redibujarGeometrias(): void {
    // Limpiar todas las geometrías del mapa
    this.source.clear();

    // Volver a agregar las geometrías restantes al VectorSource con su estilo
    this.geometriaCreadas.forEach(geometriaConEstilo => {
      const feature = geometriaConEstilo.geometry;
      feature.setStyle(geometriaConEstilo.style); // Asegurarse de que el estilo se reaplique
      this.source.addFeature(feature);
    });
  }

  /**
   * Método para recuperar el último dibujo eliminado.
   */
  recuperarDibujo(): void {
    if (this.geometriaEliminadas.length > 0) {
      // Recuperar la última geometría eliminada
      const geometriaRecuperada = this.geometriaEliminadas.pop();

      if (geometriaRecuperada) {
        // Añadir la geometría recuperada a la lista de geometrías creadas
        this.geometriaCreadas.push(geometriaRecuperada);

        // Redibujar la geometría recuperada en el mapa
        this.source.addFeature(geometriaRecuperada.geometry);

        // Redibujar las geometrías restantes
        this.redibujarGeometrias();
      }
    }
  }

  /**
   * Método para borrar los dibujos del mapa sin eliminarlos del array.
   */
  borrarDibujo(): void {
    // Mover todas las geometrías actuales a la lista de eliminadas
    this.geometriaEliminadas.push(...this.geometriaCreadas);

    // Limpiar todas las geometrías del VectorSource
    this.source.clear();

    // Limpiar la lista de geometrías creadas
    this.geometriaCreadas = [];
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
   * Elimina todas las geometrías dibujadas del mapa.
   *
   * Limpia la fuente de datos (VectorSource) asociada a la capa de dibujo.
   * Este método debe usarse solo cuando se desee eliminar explícitamente
   * todas las geometrías del mapa.
   */
  clearAllGeometries(): void {
    const source = this.vectorLayer?.getSource();
    if (source) {
      source.clear();
    }
  }

  /**
   * Muestra el mensaje "¡Hola Mundo!" en la posición del puntero del mouse.
   */
  private showMessageOnPointer(message: string): void {
    // Crear un div si no existe
    let messageDiv = document.getElementById('mouse-pointer-message');
    if (!messageDiv) {
      messageDiv = document.createElement('div');
      messageDiv.id = 'mouse-pointer-message';
      messageDiv.style.position = 'absolute';
      messageDiv.style.pointerEvents = 'none'; // Asegurar que el mensaje no interfiera con las interacciones del mapa
      messageDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      messageDiv.style.padding = '5px';
      messageDiv.style.borderRadius = '5px';
      messageDiv.style.fontSize = '14px';
      messageDiv.style.color = 'black';
      messageDiv.style.whiteSpace = 'normal'; // Permitir que el texto se divida en varias líneas
      messageDiv.style.transformOrigin = 'top left'; // Asegurar que la rotación sea desde la esquina superior izquierda
      messageDiv.style.wordWrap = 'break-word'; // Hacer que las palabras largas se dividan si es necesario
      document.body.appendChild(messageDiv);
    }

    // Dividir el mensaje en líneas usando la coma como separador
    const messageLines = message.split(','); // Aquí se divide el mensaje donde haya comas

    // Limpiar el contenido del div
    messageDiv.innerHTML = '';

    // Agregar cada línea como un nodo de texto en el div
    messageLines.forEach(line => {
      const lineElement = document.createElement('div');
      lineElement.textContent = line.trim(); // Eliminar espacios innecesarios
      messageDiv.appendChild(lineElement);
    });

    // Escuchar el movimiento del mouse para actualizar la posición del mensaje
    const map = this.mapService.getMap();
    if (map) {
      map.getViewport().addEventListener('mousemove', (event: MouseEvent) => {
        const mapCoordinates = map.getEventCoordinate(event);
        const screenCoordinates = map.getPixelFromCoordinate(mapCoordinates);

        // Posicionar el mensaje en la ubicación del puntero
        if (messageDiv) {
          messageDiv.style.left = `${screenCoordinates[0] + 10}px`; // Desplazar ligeramente hacia la derecha
          messageDiv.style.top = `${screenCoordinates[1] + 10}px`; // Desplazar ligeramente hacia abajo
        }
      });

      // Detectar cuando el mouse sale del mapa y ocultar el mensaje
      map.getViewport().addEventListener('mouseout', () => {
        if (messageDiv) {
          messageDiv.style.display = 'none'; // Ocultar el mensaje
        }
      });

      // Asegurar que el mensaje se muestre cuando el mouse entre en el mapa
      map.getViewport().addEventListener('mouseenter', () => {
        if (messageDiv) {
          messageDiv.style.display = 'block'; // Mostrar el mensaje nuevamente cuando el mouse vuelva al mapa
        }
      });
    }
  }

  /**
   * Determina si hay elementos en el historial que se pueden deshacer.
   * @returns true si existen elementos que se pueden deshacer.
   */
  puedeDeshacer(): boolean {
    return this.geometriaCreadas.length > 0;
  }

  /**
   * Determina si hay elementos eliminados que se pueden recuperar.
   * @returns true si existen elementos para recuperar.
   */
  puedeRecuperar(): boolean {
    return this.geometriaEliminadas.length > 0;
  }

  /**
   * Elimina el mensaje flotante del cursor del DOM.
   *
   * Este método busca el elemento con el ID 'mouse-pointer-message'
   * y lo elimina completamente del documento. Se utiliza para limpiar
   * el mensaje contextual que aparece al activar herramientas de dibujo.
   */
  private eliminarMensajeCursor(): void {
    const messageDiv = document.getElementById('mouse-pointer-message');
    if (messageDiv) {
      messageDiv.remove();
    }
  }

  /**
   * Reinicia la interacción de dibujo sin eliminar las geometrías existentes.
   *
   * Este método elimina las interacciones actuales del mapa (como Draw, Snap o Modify)
   * y oculta el mensaje flotante del cursor, pero mantiene las geometrías ya dibujadas.
   * Se usa típicamente al cambiar de herramienta o actualizar estilos.
   */
  public resetDibujo(): void {
    this.removeDrawingInteraction(); // Elimina Draw, Snap, Modify
    this.eliminarMensajeCursor(); // Oculta mensaje si existe
  }

  /**
   * Cierra completamente la sesión de dibujo y limpia el mapa.
   *
   * Este método elimina las interacciones de dibujo del mapa,
   * borra todas las geometrías existentes del vector source y
   * remueve el mensaje flotante del cursor. Es útil cuando el
   * usuario cierra el widget o desea reiniciar el proceso.
   */
  public CloseDibujo(): void {
    this.removeDrawingInteraction(); // Elimina Draw, Snap, Modify
    this.clearAllGeometries(); // Limpia features
    this.eliminarMensajeCursor(); // Oculta mensaje si existe
    this.tipoGeometria = '';
  }
}
