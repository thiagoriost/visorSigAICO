import { ButtonSeverity } from 'primeng/button';

/**
 * Representa la configuración de los botones de navegación del mapa,
 * incluyendo visibilidad, estilos, orden de visualización y parámetros iniciales de interacción.
 */
export interface MapNavButtonsInterface {
  /** Indica si se debe mostrar el botón de acercar (Zoom In). */
  showZoomIn: boolean;

  /** Indica si se debe mostrar el botón de alejar (Zoom Out). */
  showZoomOut: boolean;

  /** Indica si se debe mostrar el botón de acercar avanzado (Zoom Box In). */
  showAdvancedZoomIn: boolean;

  /** Indica si se debe mostrar el botón de alejar avanzado (Zoom Box Out). */
  showAdvancedZoomOut: boolean;

  /** Indica si se debe mostrar el botón para restablecer la vista inicial del mapa. */
  showResetView: boolean;

  /** Indica si se debe permitir activar/desactivar el zoom con la rueda del ratón. */
  showToggleMouseWheelZoom: boolean;

  /** Indica si se debe mostrar el botón de activación/desactivación del paneo. */
  showPan: boolean;

  /** Indica si se deben mostrar los botones de historial de navegación del mapa. */
  showHistory: boolean;

  /** Indica si el paneo debe estar habilitado al iniciar el componente. */
  isPanEnabled: boolean;

  /**
   * Coordenadas iniciales del mapa en formato [longitud, latitud].
   * Puede ser `null` si no se define.
   */
  initialCenter: number[];

  /** Nivel de zoom inicial del mapa. */
  initialZoom: number;

  /** Indica si el zoom mediante scroll está habilitado al iniciar. */
  isMouseWheelZoomEnabled: boolean;

  /** Nivel mínimo de zoom permitido en el mapa. */
  minZoom: number;

  /** Nivel máximo de zoom permitido en el mapa. */
  maxZoom: number;

  /**
   * Color del rectángulo utilizado en el modo de zoom tipo "zoomBox".
   * Valor opcional.
   */
  boxColor?: string;

  /**
   * Nivel de zoom aplicado al realizar la acción por defecto.
   * Si no se especifica, se utiliza el valor estándar del componente.
   */
  zoomLevel?: number;

  /** Orden de aparición del botón Zoom In. */
  orderZoomIn: number;

  /** Orden de aparición del botón Zoom Out. */
  orderZoomOut: number;

  /** Orden de aparición del botón Advanced Zoom In. */
  orderAdvancedZoomIn: number;

  /** Orden de aparición del botón Advanced Zoom Out. */
  orderAdvancedZoomOut: number;

  /** Orden de aparición del botón Reset View. */
  orderResetView: number;

  /** Orden de aparición del botón Toggle Mouse Wheel Zoom. */
  orderToggleMouseWheelZoom: number;

  /** Orden de aparición del botón Pan. */
  orderPan: number;

  /**
   * Espacio (en píxeles) entre los botones visibles.
   * Por defecto se recomienda un valor de 2.
   */
  gapButtons: number;

  /**
   * Estilos personalizados aplicados a los íconos de los botones.
   * Define íconos alternativos mediante la interfaz StyleMapNavButtonsInterface.
   */
  customIconStyles?: StyleMapNavButtonsInterface;

  /**
   * Severidad o estilo visual aplicado al botón (propiedad de PrimeNG).
   * Ejemplo: "primary", "secondary", "danger", etc.
   */
  buttomSeverity?: ButtonSeverity;

  /**
   * Indica si los botones deben tener un estilo redondeado.
   * Valor opcional.
   */
  rounded?: boolean;

  /**
   * Variante visual del botón (PrimeNG), permitiendo estilos como "outlined" o "text".
   */
  variant?: 'outlined' | 'text';

  /**
   * Tamaño del botón según las opciones del componente.
   * Puede ser "small", "large" o undefined.
   */
  size?: 'small' | 'large' | undefined;

  /** Orden de aparición del botón de navegación hacia atrás en el historial. */
  orderHistoryBack: number;

  /** Orden de aparición del botón de navegación hacia adelante en el historial. */
  orderHistoryNext: number;
}

/**
 * Representa los estilos personalizados e íconos que pueden aplicarse a los botones de navegación del mapa.
 */
export interface StyleMapNavButtonsInterface {
  /** Ícono del botón Zoom In. */
  iconZoomIn?: string;

  /** Ícono del botón Zoom Out. */
  iconZoomOut?: string;

  /** Ícono del botón Advanced Zoom In. */
  iconAdvancedZoomIn?: string;

  /** Ícono del botón Advanced Zoom Out. */
  iconAdvancedZoomOut?: string;

  /** Ícono del botón Reset View. */
  iconResetView?: string;

  /** Ícono del botón Toggle Mouse Wheel Zoom cuando está habilitado. */
  iconToggleMouseWheelZoomEnabled?: string;

  /** Ícono del botón Toggle Mouse Wheel Zoom cuando está deshabilitado. */
  iconToggleMouseWheelZoomDisabled?: string;

  /** Ícono del botón Pan cuando está habilitado. */
  iconPanEnabled?: string;

  /** Ícono del botón Pan cuando está deshabilitado. */
  iconPanDisabled?: string;

  /** Ícono del botón Advanced Zoom cuando está inactivo. */
  iconInactiveAdvancedZoom?: string;

  /** Ícono del botón para navegar hacia atrás en el historial. */
  iconBack?: string;

  /** Ícono del botón para navegar hacia adelante en el historial. */
  iconNext?: string;
}
