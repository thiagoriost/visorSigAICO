import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from 'environments/environment';
import { FeatureCollection } from 'geojson';

/**
 * Servicio responsable de enviar datos geoespaciales a un microservicio REST para realizar operaciones de intersección entre capas.
 *
 * Este servicio actúa como cliente HTTP utilizando `axios`, y se comunica con un microservicio cuya URL completa
 * debe estar definida en las variables de entorno (`environment.intersect.url`), ya que no se garantiza una estructura fija de endpoint.
 *
 * Funcionalidades:
 * - Configura una instancia `AxiosInstance` con timeout personalizado.
 * - Expone el método `intersect`, que toma dos `FeatureCollection` (GeoJSON) y retorna la colección resultante del proceso de intersección.
 *
 * @date 2025-07-25
 * @author Sergio Alonso Mariño Duque y Heidy Paola Lopez Sanchez
 */

@Injectable({
  providedIn: 'root',
})
export class IntersectionRestService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 60000,
    });
  }

  /**
   * Envía dos colecciones GeoJSON al microservicio de intersección y retorna la capa resultante.
   *
   * @param geojson1 Colección GeoJSON correspondiente a la capa base
   * @param geojson2 Colección GeoJSON correspondiente a la capa destino
   * @returns Promesa que resuelve con el `FeatureCollection` resultante de la intersección
   */
  intersect(
    geojson1: FeatureCollection,
    geojson2: FeatureCollection
  ): Promise<FeatureCollection> {
    return this.client
      .post<FeatureCollection>(environment.intersect.url, {
        geojson1,
        geojson2,
      })
      .then(response => response.data);
  }
}
