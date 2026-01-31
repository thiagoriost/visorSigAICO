export interface Direccion {
  /**
   * Nombre o etiqueta de la dirección.
   * Este campo puede ser utilizado para mostrar la dirección de manera comprensible para el usuario.
   * Ejemplo: "Calle Mayor, Madrid"
   */
  label: string;

  /**
   * Identificador único de la dirección.
   * Puede ser el `place_id` de OpenStreetMap o un identificador propio, según la implementación.
   * Ejemplo: "12345678"
   */
  placeId: string;

  /**
   * Latitud de la ubicación de la dirección, representada como una cadena de texto.
   * Ejemplo: "40.4168"
   */
  lat: string;

  /**
   * Longitud de la ubicación de la dirección, representada como una cadena de texto.
   * Ejemplo: "-3.7038"
   */
  lon: string;
}
