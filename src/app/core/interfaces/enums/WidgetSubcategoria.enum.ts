/**
 * @description Enumerado para las subcategorías específicas de widgets construidos en el visor.
 * Representan el tipo funcional concreto de cada herramienta, sin numeración específica.
 * Por ejemplo: "Salida gráfica 1", "Salida gráfica 2" → subcategoría = "Salida gráfica".
 * @author Sergio Alonso Mariño Duque
 * @date 28/07/2025
 * @enum {string}
 */
export enum WidgetSubcategoria {
  MAPA_BASE = 'Mapa Base',
  TABLA_CONTENIDO = 'Tabla de Contenido',
  IDENTIFICAR = 'Identificar',
  MEDICION = 'Medición',
  UBICAR_COORDENADAS = 'Ubicar mediante coordenadas',
  TABLA_ATRIBUTOS = 'Tabla de atributos',
  ADICIONAR_WMS = 'Adicionar WMS',
  MINI_MAPA = 'Mini Mapa',
  SUBIR_ARCHIVO = 'Subir Archivo',
  DIBUJAR = 'Dibujar',
  BOTONERA_VERTICAL = 'Botonera Vertical',
  BUSCAR_DIRECCION = 'Buscar Direccion',
  EXPORTAR_MAPA = 'Exportar Mapa',
  LEYENDA = 'Leyenda',
  BARRA_ESCALA = 'Barra de Escala',
  COORDENADAS_CURSOR = 'Coordenadas Cursor',
  CONSULTA_SIMPLE = 'Consulta Simple',
  CONSULTA_AVANZADA = 'Consulta Avanzada',
  SELECCION_ESPACIAL = 'Selección Espacial',
  INTERSECCION = 'Intersección',
  AYUDA = 'Ayuda',
  DESCARGAR_MANUAL = 'Descargar Manual',
  SWIPE = 'Swipe',
  AREA_TRABAJO = 'Área de trabajo',
  SALIDA_GRAFICA = 'Salida gráfica',
  BUFFER = 'Buffer',
  CONTROL_NAV = 'Controles de Navegación',
  INFO_PANEL = 'Info Panel',
}
