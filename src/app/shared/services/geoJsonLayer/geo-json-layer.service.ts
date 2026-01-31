import { Injectable } from '@angular/core';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';

/**
 * Servicio encargado de crear capas vectoriales de OpenLayers (OL) a partir de datos en formato GeoJSON.
 *
 * Características principales:
 * - Convierte objetos GeoJSON en capas `VectorLayer` de OpenLayers.
 * - Asigna estilos visuales aleatorios según el tipo de geometría (punto, línea o polígono).
 * - Permite definir propiedades adicionales para cada capa generada.
 *
 * Este servicio es útil para renderizar resultados dinámicos como capas de análisis o resultados temporales.
 * @date 2025-07-25
 * @author Heidy Paola Lopez Sanchez
 */

@Injectable({
  providedIn: 'root',
})
export class GeoJsonLayerService {
  /**
   * Crea una capa vectorial (`VectorLayer`) a partir de un objeto GeoJSON.
   * Aplica un estilo único basado en el tipo de geometría detectado en la primera feature.
   *
   * @param geojsonData Datos en formato GeoJSON (puede ser objeto o string).
   * @param properties Propiedades adicionales a asociar a la capa (opcional).
   * @returns Una capa de tipo `VectorLayer` lista para añadirse al mapa.
   */
  crearLayerDesdeGeoJSON(geojsonData: object | string, properties?: object) {
    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonData),
    });

    // Se toma la primera feature como muestra para determinar el tipo de geometría
    const sampleFeature = source.getFeatures()[0];
    const geometryType = sampleFeature?.getGeometry()?.getType() ?? 'Polygon';

    // Genera un estilo único con color aleatorio según el tipo de geometría
    const estiloUnico = this.generateRandomStyleForGeometry(geometryType);

    // Crea y retorna la capa vectorial configurada
    return new VectorLayer({
      source,
      style: estiloUnico, // Estilo fijo para todas las geometrías en esta capa
      properties: properties || {},
    });
  }

  /**
   * Genera un color aleatorio en formato `rgba()`, útil para estilos visuales.
   *
   * @param alpha Nivel de opacidad del color (valor entre 0 y 1). Por defecto: 1 (opaco).
   * @returns Un string con formato `rgba(r, g, b, alpha)`.
   */
  getRandomColor(alpha = 1) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Genera un estilo de OpenLayers basado en el tipo de geometría recibido.
   * Se aplica un color aleatorio (con opacidad) y se ajusta según el tipo:
   * - Puntos → Círculos con relleno y borde.
   * - Líneas → Trazos simples.
   * - Polígonos → Relleno semitransparente y borde.
   *
   * @param geometryType Tipo de geometría (Point, LineString, Polygon, etc.)
   * @returns Un objeto `Style` de OpenLayers configurado para dicha geometría.
   */
  generateRandomStyleForGeometry(geometryType: string): Style {
    switch (geometryType) {
      case 'Point':
      case 'MultiPoint':
        return new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: this.getRandomColor(0.6) }),
            stroke: new Stroke({ color: this.getRandomColor(), width: 2 }),
          }),
        });

      case 'LineString':
      case 'MultiLineString':
        return new Style({
          stroke: new Stroke({
            color: this.getRandomColor(),
            width: 2,
          }),
        });

      case 'Polygon':
      case 'MultiPolygon':
        return new Style({
          stroke: new Stroke({
            color: this.getRandomColor(),
            width: 2,
          }),
          fill: new Fill({
            color: this.getRandomColor(0.3),
          }),
        });

      // Estilo por defecto si el tipo de geometría no es reconocido
      default:
        return new Style({
          stroke: new Stroke({
            color: this.getRandomColor(),
            width: 2,
          }),
          fill: new Fill({
            color: this.getRandomColor(0.4),
          }),
        });
    }
  }
}
