import { ElementRef, Injectable } from '@angular/core';
import { Map } from 'ol';
import { Escala } from '../interface/escala';
import proj4 from 'proj4';
import { MapService } from '@app/core/services/map-service/map.service';
import ScaleLine from 'ol/control/ScaleLine';
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio para gestionar y calcular escalas cartográficas en mapas OpenLayers.
 *
 * Proporciona una lista de escalas predefinidas, métodos para obtener la resolución
 * y escala actual del mapa, convertir unidades de proyección a metros, y generar
 * representaciones gráficas de la escala para la interfaz de usuario.
 *
 * Utiliza la librería proj4 para transformar coordenadas entre sistemas de referencia
 * y calcular distancias reales basadas en la proyección del mapa.
 * @author Heidy Paola Lopez Sanchez
 */
@Injectable({
  providedIn: 'root',
})
export class EscalaService {
  /** Control de barra de escala de OpenLayers */
  scaleLineControl!: ScaleLine;
  /** Referencia al objeto mapa OpenLayers */
  private map: Map | null = null;

  // Lista fija de escalas predefinidas con su nombre y valor numérico
  readonly escalas: Escala[] = [
    { id: 1, nombre: '1:1.000', valor: 1000 },
    { id: 2, nombre: '1:2.500', valor: 2500 },
    { id: 3, nombre: '1:5.000', valor: 5000 },
    { id: 4, nombre: '1:10.000', valor: 10000 },
    { id: 5, nombre: '1:25.000', valor: 25000 },
    { id: 6, nombre: '1:50.000', valor: 50000 },
    { id: 7, nombre: '1:100.000', valor: 100000 },
    { id: 8, nombre: '1:200.000', valor: 200000 },
    { id: 9, nombre: '1:500.000', valor: 500000 },
    { id: 10, nombre: '1:1.000.000', valor: 1000000 },
    { id: 11, nombre: '1:2.000.000', valor: 2000000 },
    { id: 12, nombre: '1:3.000.000', valor: 3000000 },
    { id: 13, nombre: '1:4.000.000', valor: 4000000 },
    { id: 14, nombre: '1:5.000.000', valor: 5000000 },
    { id: 15, nombre: '1:6.000.000', valor: 6000000 },
    { id: 16, nombre: '1:7.000.000', valor: 7000000 },
    { id: 17, nombre: '1:8.000.000', valor: 8000000 },
    { id: 18, nombre: '1:9.000.000', valor: 9000000 },
    { id: 19, nombre: '1:10.000.000', valor: 10000000 },
  ];
  /** Escala actualmente seleccionada en el dropdown */
  private escalaSelectedSubject = new BehaviorSubject<Escala>(this.escalas[0]);
  escalaSelected$ = this.escalaSelectedSubject.asObservable();
  constructor(private mapService: MapService) {
    this.map = this.mapService.getMap();

    if (!this.map) {
      console.error('Mapa no disponible');
      return;
    }
    // Escuchar cambios en la resolución del mapa para refrescar escala
    this.map.getView().on('change:resolution', () => this.updateEscala());
  }

  /**
   * Intenta inicializar la escala del mapa de forma repetida.
   * Esto es útil cuando el mapa aún no está disponible al momento de crear el componente.
   * Hace múltiples intentos (limitados por el parámetro `intentos`) con intervalos de espera entre cada intento.
   * Si el mapa está disponible, se actualiza la escala. Si no, se espera y reintenta.
   *
   * @param intentos - Número máximo de intentos para inicializar la escala.
   * @param intervalo - Tiempo (en milisegundos) que se espera entre cada intento.
   */
  inicializarEscala(intentos: number, intervalo: number): void {
    // Define la función de intento que se llamará a sí misma recursivamente si el mapa aún no está disponible
    const intento = () => {
      const mapa = this.map; // Intenta obtener el objeto mapa actual

      if (mapa) {
        this.updateEscala(); // Si el mapa está disponible, actualiza la escala
      } else if (intentos > 0) {
        // Si aún no hay mapa y quedan intentos disponibles...
        setTimeout(() => {
          this.inicializarEscala(intentos - 1, intervalo); // Espera y vuelve a intentar con un intento menos
        }, intervalo);
      }
    };

    intento(); // Ejecuta el primer intento inmediatamente
  }
  /**
   * Calcula la resolución del mapa (unidades/mapa por píxel) a partir de una escala numérica.
   * Fórmula usada: resolución = escala / (metrosPorUnidad * pulgadasPorMetro * dpi)
   * @param scale Escala numérica seleccionada (ej: 25000)
   * @returns Resolución calculada para aplicar en el mapa
   */
  getResolutionFromScale(scale: number): number {
    if (!this.map) return 1;

    const projectionCode = this.map.getView().getProjection().getCode();
    const metersPerUnit = this.getMetersPerUnit(projectionCode);
    const dpi = 96; // Densidad estándar de pantalla en puntos por pulgada
    const inchesPerMeter = 39.37; // Pulgadas en un metro

    return scale / (metersPerUnit * inchesPerMeter * dpi);
  }

  /**
   * Actualiza la escala numérica seleccionada en la UI
   * basado en la resolución actual del mapa.
   * Busca la escala predefinida más cercana y actualiza la selección si cambió.
   */
  updateEscala(): void {
    if (!this.map) return;

    // Obtiene la escala numérica actual según la resolución del mapa
    const escalaActual = this.getCurrentScale(this.map);

    // Busca la escala predefinida más cercana a la actual
    const escalaCercana = this.getEscalaMasCercana(escalaActual);

    // Actualiza la selección solo si la escala más cercana cambió
    const actual = this.escalaSelectedSubject.value;
    if (actual?.id !== escalaCercana.id) {
      this.escalaSelectedSubject.next(escalaCercana);
    }
  }

  /**
   * Inicializa el control de barra de escala de OpenLayers, lo agrega al mapa
   * y lo inserta manualmente dentro del contenedor personalizado del componente.
   */
  initScaleLineControl(
    container: ElementRef<HTMLDivElement>,
    type: 'scaleline' | 'scalebar' = 'scaleline'
  ): void {
    if (!this.map) {
      this.map = this.mapService.getMap();
      if (!this.map) {
        console.error('Mapa no disponible');
        return;
      }
      this.map.getView().on('change:resolution', () => this.updateEscala());
    }

    // Si ya hay control, lo quitamos antes
    if (this.scaleLineControl) {
      this.map.removeControl(this.scaleLineControl);
    }

    this.scaleLineControl = new ScaleLine({
      target: container.nativeElement,
      units: 'metric',
      ...(type === 'scalebar'
        ? {
            bar: true,
            steps: 4,
            text: true,
            minWidth: 140,
          }
        : {}),
    });

    this.map.addControl(this.scaleLineControl);
  }

  /**
   * Método invocado cuando el usuario cambia la escala seleccionada en el dropdown.
   * Calcula la resolución correspondiente a la escala seleccionada y la aplica
   * en la vista del mapa para ajustar el zoom.
   */
  onChangeEscala(escalaSelected: Escala): void {
    this.escalaSelectedSubject.next(escalaSelected);
    const resolution = this.getResolutionFromScale(escalaSelected.valor);
    if (this.map) {
      this.map.getView().setResolution(resolution);
    }
  }
  /**
   * Devuelve la lista de escalas disponibles.
   */
  getEscalas(): Escala[] {
    return this.escalas;
  }

  /**
   * Obtiene la resolución actual del mapa.
   * La resolución es la cantidad de unidades del mapa por píxel en pantalla.
   * @param map instancia del mapa OpenLayers
   * @returns resolución actual o 1 si no está definida
   */
  getCurrentResolution(map: Map): number {
    return map.getView().getResolution() ?? 1;
  }

  /**
   * Calcula cuántos metros representa una unidad de la proyección.
   * Usa proj4 para transformar 0 y 1 unidad en la proyección a grados geográficos,
   * y multiplica por la aproximación de metros por grado (~111319.9 m).
   * @param projectionCode código EPSG de la proyección del mapa (ej. 'EPSG:3857')
   * @returns metros por unidad de la proyección
   */
  getMetersPerUnit(projectionCode: string): number {
    // Convierte coordenadas de la proyección a EPSG:4326 (lat/lon)
    const p1 = proj4(projectionCode, 'EPSG:4326', [0, 0]);
    const p2 = proj4(projectionCode, 'EPSG:4326', [1, 0]);
    const dx = p2[0] - p1[0];
    // Retorna la distancia en metros para 1 unidad de la proyección
    // Si dx es 0, asume 1 metro (caso proyección métrica)
    return Math.abs(dx) > 0 ? 111319.9 * Math.abs(dx) : 1;
  }

  /**
   * Calcula la escala actual del mapa según su resolución y metros por unidad.
   * Fórmula: escala = resolución * metrosPorUnidad * pulgadasPorMetro * DPI
   * Donde:
   * - resolución es unidades del mapa por píxel
   * - metrosPorUnidad convierte unidades del mapa a metros reales
   * - pulgadasPorMetro y DPI convierten de metros a pulgadas en pantalla
   * @param map instancia del mapa OpenLayers
   * @returns escala actual aproximada (ej. 10000 para 1:10000)
   */
  getCurrentScale(map: Map): number {
    const resolution = this.getCurrentResolution(map);
    const projectionCode = map.getView().getProjection().getCode();
    const metersPerUnit = this.getMetersPerUnit(projectionCode);
    const dpi = 96; // puntos por pulgada estándar pantalla
    const inchesPerMeter = 39.37; // pulgadas en un metro

    return resolution * metersPerUnit * inchesPerMeter * dpi;
  }

  /**
   * Genera una escala gráfica para mostrar en la UI,
   * indicando una distancia en metros o kilómetros para un tamaño fijo en píxeles.
   * @param map instancia del mapa OpenLayers
   * @param lengthPx longitud en píxeles para la escala gráfica (por defecto 100 px)
   * @returns cadena con valor y unidad (ej. "500 m" o "1.2 km")
   */
  getEscalaGrafica(map: Map, lengthPx = 100): string {
    const resolution = this.getCurrentResolution(map);
    const projectionCode = map.getView().getProjection().getCode();
    const metersPerUnit = this.getMetersPerUnit(projectionCode);
    const lengthMeters = resolution * lengthPx * metersPerUnit;

    if (lengthMeters >= 1000) {
      // Si es mayor o igual a 1000 metros, lo muestra en kilómetros con 1 decimal
      return `${(lengthMeters / 1000).toFixed(1)} km`;
    }
    // Si es menor, muestra en metros sin decimales
    return `${Math.round(lengthMeters)} m`;
  }

  /**
   * Busca en la lista de escalas predefinidas la que está más cercana
   * al valor numérico dado.
   * @param valor escala numérica a comparar
   * @returns escala predefinida más próxima
   */
  getEscalaMasCercana(valor: number): Escala {
    return this.escalas.reduce((prev, curr) =>
      Math.abs(curr.valor - valor) < Math.abs(prev.valor - valor) ? curr : prev
    );
  }
}
