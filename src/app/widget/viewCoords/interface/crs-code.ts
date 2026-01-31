/**
 * Enumerado que contiene los sistemas de referencia para el componente de ubicar coordenadas
 * @date 06-10-2025
 * @author Heidy Paola Lopez Sanchez
 */
export enum CRSCode {
  WGS84 = 'EPSG:4326', // Coordenadas geográficas globales
  MAGNA = 'EPSG:4686', // Sistema geográfico oficial de Colombia (MAGNA-SIRGAS)
  MAGNA_BOGOTA = 'EPSG:3116', // Proyección MAGNA-SIRGAS / Colombia Bogotá
  MAGNA_OCCIDENTE = 'EPSG:9377', // Proyección MAGNA-SIRGAS / Occidente de Colombia
}
