/** Una opción dentro del menú desplegable */
export interface OpcionMenuModel {
  /** Identificador único de la opción */
  id: string;
  /** Clase o ruta del ícono (p.ej. "pi pi-search") */
  icono: string;
  /** Texto que se muestra junto al ícono */
  texto: string;
}

/** Configuración de un botón principal y sus opciones */
export interface BotonConfigModel {
  /** Identificador único del botón */
  id: string;
  /** Ícono principal del botón (clase PrimeNG o URL) */
  icono: string;
  /** Texto del botón principal */
  texto: string;
  /** Lista de opciones que despliega al hacer click */
  opciones?: OpcionMenuModel[];
}
