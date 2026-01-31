import { GeoJSONGeometrias } from '../../interfaces/geojsonInterface';
import { Injectable } from '@angular/core';
import * as shpwrite from '@mapbox/shp-write';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Este servicio permite exportar las geometrias seleccionadas en tipo excel y shape
 * @author Heidy Paola Lopez Sanchez
 */
@Injectable({
  providedIn: 'root',
})
export class ExportDataService {
  /**
   * Exporta un arreglo de geometrías en formato GeoJSON a un archivo Shapefile comprimido en ZIP.
   * @param features - Arreglo de objetos tipo GeoJSONGeometrias
   */
  async exportToShapefile(
    features: GeoJSONGeometrias[],
    titulo: string
  ): Promise<void> {
    // Validamos si el arreglo de features no existe o está vacío
    if (!features?.length) {
      return;
    }

    // Convertimos cada objeto GeoJSONGeometrias a un objeto GeoJSON Feature
    const geoJsonFeatures: GeoJSON.Feature[] = features.map((f, i) => ({
      type: 'Feature',
      geometry: f.geometry as GeoJSON.Geometry,
      properties: f.properties,
      id: i, // Asignamos un ID numérico incremental
    }));

    // Construimos el FeatureCollection con todos los features anteriores
    const featureCollection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: geoJsonFeatures,
    };
    const timestamp = Math.floor(Date.now() / 1000); // Tiempo en segundos
    const shapeFileName = `${titulo}_${timestamp}.xlsx`;
    // Definimos las opciones para la exportación del shapefile
    const options = {
      folder: 'shapefiles', // Carpeta dentro del ZIP
      filename: shapeFileName, // Nombre del archivo ZIP resultante
      outputType: 'blob' as const, // Tipo de salida
      compression: 'STORE' as const, // Compresión sin pérdida
      // Proyección WGS84 en formato .prj
      prj:
        'GEOGCS["WGS 84",DATUM["WGS_1984",' +
        'SPHEROID["WGS 84",6378137,298.257223563]],' +
        'PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]',
    };

    try {
      // Generamos el shapefile comprimido en ZIP usando shp-write
      const result = await shpwrite.zip(featureCollection, options);

      // Validamos si el resultado es un Blob antes de descargar
      if (result instanceof Blob) {
        saveAs(result, `${options.filename}.zip`); // Iniciamos descarga con FileSaver.js
      } else {
        console.error(
          '[ExportToShapefile] El resultado no es un Blob. Tipo:',
          typeof result
        );
      }
    } catch (error) {
      // Capturamos y mostramos cualquier error ocurrido durante la exportación
      console.error(
        '[ExportToShapefile] Error durante la exportación del shapefile:',
        error
      );
    }
  }
  /**
   * Exporta un arreglo de geometrías a un archivo Excel (.xlsx)
   * @param data - Arreglo de objetos tipo GeoJSONGeometrias
   */
  exportToExcelFile(data: GeoJSONGeometrias[], titulo: string): void {
    const MAX_CELL_LENGTH = 32767;

    // Transformamos los datos a una estructura plana adecuada para una hoja de Excel
    const flatData = data.map(item => {
      const geometryCoords = JSON.stringify(item.geometry.coordinates);
      return {
        ...item.properties, // Incluimos todas las propiedades del feature
        geometryType: item.geometry.type, // Tipo de geometría
        geometryCoords:
          geometryCoords.length > MAX_CELL_LENGTH
            ? geometryCoords.slice(0, MAX_CELL_LENGTH - 3) + '...' // Truncamos si excede el límite
            : geometryCoords,
      };
    });

    // Creamos la hoja de cálculo a partir del JSON plano
    const worksheet = XLSX.utils.json_to_sheet(flatData);

    // Creamos el libro de trabajo (workbook)
    const workbook = XLSX.utils.book_new();

    // Añadimos la hoja al workbook con el nombre 'Geometrias'
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Geometrias');

    // Escribimos el contenido del workbook a un buffer de tipo array
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const timestamp = Math.floor(Date.now() / 1000); // Tiempo en segundos
    const excelFileName = `${titulo}_${timestamp}.xlsx`;

    // Creamos un Blob del buffer y disparamos la descarga con FileSaver.js
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, excelFileName);
  }
}
