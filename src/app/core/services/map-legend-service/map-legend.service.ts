import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MapService } from '@app/core/services/map-service/map.service';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import * as mapsSelectors from '@app/core/store/map/map.selectors';
import ImageLayer from 'ol/layer/Image';
import { ImageWMS } from 'ol/source';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

@Injectable({
  providedIn: 'root',
})
export class MapLegendService {
  constructor(
    private store: Store<MapState>, // Accede al estado global del mapa (NGRX)
    private mapService: MapService // Servicio que permite interactuar con las capas en el mapa
  ) {}

  /**
   * Obtiene las capas del mapa que pertenecen al área de trabajo,
   * junto con las URLs de leyenda WMS si están disponibles.
   *
   * @returns Observable con un objeto que contiene:
   *  - capas: lista de capas con URL de leyenda (si aplica).
   *  - mensajeError: string de error si algo falla, o null.
   */
  obtenerCapasConLeyendas(): Observable<{
    capas: (LayerStore & { leyendaUrl?: string })[];
    mensajeError: string | null;
  }> {
    return this.store.select(mapsSelectors.selectWorkAreaLayerList).pipe(
      switchMap(layers => {
        const result: (LayerStore & { leyendaUrl?: string })[] = [];
        let mensajeError: string | null = null;

        for (const layer of layers) {
          // Se intenta obtener la capa en el mapa correspondiente a la definición
          const capaMapa = this.mapService.getLayerByDefinition(
            layer.layerDefinition,
            LayerLevel.INTERMEDIATE
          ) as ImageLayer<ImageWMS> | null;

          if (!capaMapa) {
            // Si no se encuentra la capa en el mapa, se anota el error y se omite la leyenda
            mensajeError = `No se encontró la capa "${layer.layerDefinition.titulo}" en el mapa.`;
            result.push({ ...layer, leyendaUrl: undefined });
            continue;
          }

          try {
            // Se intenta obtener la URL de leyenda WMS
            const leyendaUrl = this.obtenerLeyendaDesdeCapa(capaMapa);
            result.push({ ...layer, leyendaUrl });
          } catch (error) {
            // Si ocurre un error al obtener la leyenda, se transforma en mensaje legible
            mensajeError = this.getErrorMessage(
              error as Error,
              layer.layerDefinition.titulo
            );
            result.push({ ...layer, leyendaUrl: undefined });
          }
        }

        return of({ capas: result, mensajeError });
      }),
      // En caso de error inesperado al procesar todas las capas
      catchError(() =>
        of({
          capas: [],
          mensajeError:
            'Error inesperado al obtener las leyendas de las capas.',
        })
      )
    );
  }

  /**
   * Obtiene la URL de la imagen de la leyenda WMS para una capa específica.
   *
   * @param layer - Capa de tipo ImageLayer con fuente WMS.
   * @returns Cadena con la URL de la leyenda WMS.
   * @throws Error si no es posible obtener la URL.
   */
  public obtenerLeyendaDesdeCapa(layer: ImageLayer<ImageWMS>): string {
    if (!layer) {
      throw new Error('La capa proporcionada es nula o indefinida.');
    }

    const source = layer.getSource();
    if (!source) {
      throw new Error('La capa no tiene una fuente WMS válida.');
    }

    // Resolución arbitraria (puede ajustarse si se requiere)
    const resolution = 1;
    const legendUrl = source.getLegendUrl(resolution);

    if (!legendUrl) {
      throw new Error(
        'No se pudo obtener la URL de la leyenda desde la fuente WMS.'
      );
    }
    return legendUrl;
  }

  /**
   * Devuelve un mensaje de error legible basado en el tipo de error ocurrido.
   *
   * @param error - Objeto de error capturado.
   * @param nombreCapa - Nombre de la capa asociada al error.
   * @returns Mensaje personalizado para mostrar al usuario.
   */
  private getErrorMessage(error: Error, nombreCapa: string): string {
    const mensaje = error.message || '';
    if (
      mensaje.includes('Failed to fetch') ||
      mensaje.includes('NetworkError')
    ) {
      return `No se pudo conectar con el servidor para obtener la leyenda de la capa "${nombreCapa}".`;
    }
    if (mensaje.includes('404')) {
      return `La leyenda de la capa "${nombreCapa}" no se encuentra disponible.`;
    }
    if (mensaje.includes('403')) {
      return `No tienes permisos para acceder a la leyenda de la capa "${nombreCapa}".`;
    }
    if (mensaje.includes('400')) {
      return `La solicitud de leyenda para la capa "${nombreCapa}" es inválida.`;
    }
    if (mensaje.includes('500')) {
      return `El servidor encontró un error al intentar cargar la leyenda de la capa "${nombreCapa}".`;
    }
    return `Ocurrió un error al obtener la leyenda de la capa "${nombreCapa}".`;
  }

  /**
   * Metodo para obtener la URL de leyenda de una capa
   * @param layer Capa del Store que contiene la definicion de la capa
   */
  obtenerURLLeyendaDeCapa(layer: LayerStore): string | null {
    // Se intenta obtener la capa en el mapa correspondiente a la definición
    const capaMapa = this.mapService.getLayerByDefinition(
      layer.layerDefinition,
      layer.layerLevel
    ) as ImageLayer<ImageWMS> | null;
    if (!capaMapa) return null;
    // Se intenta obtener la URL de leyenda WMS
    return this.obtenerLeyendaDesdeCapa(capaMapa);
  }
}
