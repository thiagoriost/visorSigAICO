import { Injectable, OnDestroy } from '@angular/core';
import { MapService } from '@app/core/services/map-service/map.service';
import { Subscription, Subject } from 'rxjs';
import { Direccion } from '../interfaces/direccion.interface';
import { OpenStreetMapResult } from '@app/widget/buscarDireccion/interfaces/OpenStreetMapResult.interface';

/**
 * Servicio encargado de la búsqueda de direcciones y la gestión de la interacción con el mapa.
 * Utiliza el servicio `MapService` para interactuar con el mapa de la aplicación.
 * Proporciona sugerencias de direcciones mientras el usuario escribe y permite centrar y hacer zoom en el mapa
 * cuando se selecciona una dirección.
 * @author Carlos Alberto Aristizabal Vargas
 * @date 02-04-2025
 * @version 1.0.1
 */

@Injectable()
export class BuscarDireccionService implements OnDestroy {
  // Suscripción activa para las búsquedas
  private searchSubscription: Subscription = new Subscription();

  // Subject para emitir las sugerencias de direcciones
  public direccionSugerida: Subject<Direccion[]> = new Subject<Direccion[]>();

  /**
   * Constructor del servicio, inyecta el servicio `MapService` para acceder al mapa de la aplicación.
   *
   * @param mapService Instancia de `MapService` para interactuar con el mapa.
   */
  constructor(private mapService: MapService) {}

  /**
   * Método que permite buscar una dirección en función del texto ingresado por el usuario.
   * Realiza una solicitud HTTP a la API de OpenStreetMap para obtener posibles coincidencias.
   * Si se encuentran resultados, se emiten las sugerencias a través del `Subject` `direccionSugerida`.
   *
   * @param direccion Dirección que el usuario desea buscar (texto ingresado).
   */
  async buscarDireccionPorTexto(direccion: string): Promise<void> {
    const url = `https://nominatim.openstreetmap.org/search?q=${direccion}&format=json&addressdetails=1&limit=5`;

    try {
      const response = await fetch(url);
      const results: OpenStreetMapResult[] = await response.json();

      if (results && results.length > 0) {
        const filteredResults = results
          .filter(item => item.lat && item.lon && item.display_name)
          .map(item => ({
            label: item.display_name,
            placeId: item.place_id,
            lat: item.lat,
            lon: item.lon,
          }));

        this.direccionSugerida.next(filteredResults);
      } else {
        this.direccionSugerida.next([]);
      }
    } catch (error) {
      console.error('Error al buscar la dirección:', error);
      // Opcionalmente puedes emitir el error también a un Subject si lo necesitas
    }
  }

  /**
   * Método que se ejecuta cuando el usuario selecciona una dirección de las sugerencias.
   * Realiza una animación con dos fases: un zoom-out seguido de un zoom-in hacia la dirección seleccionada.
   *
   * @param direccion Dirección seleccionada que contiene la latitud y longitud.
   */
  buscarDireccionSeleccionada(direccion: Direccion): void {
    const map = this.mapService.getMap();

    if (!map || !direccion) {
      return;
    }

    const lat = parseFloat(direccion.lat);
    const lon = parseFloat(direccion.lon);

    // Función de animación fly-to para realizar zoom-out y luego zoom-in
    function zoomOutAndIn(
      location: [number, number],
      zoomOutLevel: number,
      zoomInLevel: number,
      done: (complete: boolean) => void
    ): void {
      const duration = 2000; // Duración de la animación en milisegundos

      // Realizar el zoom-out (alejamiento) primero
      map?.getView().animate(
        {
          center: location,
          duration: duration,
          zoom: zoomOutLevel, // Primer zoom (alejamiento)
        },
        () => {
          // Después de hacer zoom-out, realizar el zoom-in hacia la dirección seleccionada
          map?.getView().animate(
            {
              center: location,
              duration: duration,
              zoom: zoomInLevel, // Segundo zoom (acercamiento)
            },
            () => {
              done(true); // Marca como completo
            }
          );
        }
      );
    }

    // Usar la animación con zoom-out primero y luego zoom-in
    if (map) {
      zoomOutAndIn([lon, lat], 8, 15, () => {
        // Esta función está vacía porque no necesitamos hacer nada después de la animación.
      });
    }
  }

  /**
   * Método que se ejecuta cuando el servicio es destruido. Libera los recursos de las suscripciones activas.
   */
  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe(); // Cancelar la suscripción activa
    }
  }
}
