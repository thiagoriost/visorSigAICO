export interface OpenStreetMapResult {
  /**
   * Latitud de la ubicación, representada como una cadena de texto.
   * Ejemplo: "51.5074"
   */
  lat: string;

  /**
   * Longitud de la ubicación, representada como una cadena de texto.
   * Ejemplo: "-0.1278"
   */
  lon: string;

  /**
   * Nombre o descripción completa de la dirección.
   * Este campo es útil para mostrar la dirección de forma legible para el usuario.
   * Ejemplo: "London, England"
   */
  display_name: string;

  /**
   * Identificador único para la ubicación dentro de OpenStreetMap.
   * Este campo puede ser utilizado para realizar más consultas o obtener detalles adicionales de la ubicación.
   * Ejemplo: "12345678"
   */
  place_id: string;
}
