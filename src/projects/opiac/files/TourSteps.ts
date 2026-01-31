import { GuidedTour, Orientation } from 'ngx-guided-tour';

export const tourSteps: GuidedTour = {
  tourId: 'opiac-tour',
  useOrb: false,
  steps: [
    {
      title: 'Barra lateral de trabajo',
      content:
        'Aquí puedes gestionar la información del mapa: accede a la tabla de contenido, añade archivos o servicios WMS, y busca direcciones fácilmente.',
      selector: '#sidebar-content',
      orientation: Orientation.Right,
    },
    {
      title: 'Buscar dirección',
      content: 'Permite consultar lugares ingresando la palabra clave',
      selector: '#search-address',
      orientation: Orientation.Right,
    },
    {
      title: 'Tabla de contenido',
      content: 'Lista las capas disponibles para mostrar en el visor',
      selector: '#content-table',
      orientation: Orientation.Right,
    },
    {
      title: 'Buscar capas',
      content:
        'Permite filtrar las capas que coincidan con la palabra ingresada',
      selector: '#tour-content-table-search',
      orientation: Orientation.Right,
    },
    {
      title: 'Desseleccionar todas las capas',
      content:
        'Permite desseleccionar todas las capas seleccionadas en la tabla de contenido',
      selector: '#tour-content-table-unmark-layers',
      orientation: Orientation.Right,
    },
    //mover el selector al switch
    {
      title: 'Activar capa',
      content:
        'Permite activar la capa en el mapa y cargarla al área de trabajo',
      selector: '#tour-layer-tree-item',
      orientation: Orientation.Right,
    },
    {
      title: 'Añadir WMS',
      content:
        'Permite agregar capas de tipo WMS a traves de la URL del servicio',
      selector: '#tour-add-wms',
      orientation: Orientation.Right,
    },
    {
      title: 'Añadir Archivo',
      content:
        'Permite agregar archivos con información geográfica de tipo .kml, .shp, .geojson y .gpx',
      selector: '#tour-add-file',
      orientation: Orientation.Right,
    },
    {
      title: 'Área de trabajo y Simbologia',
      content:
        'Contiene las capas seleccionadas por el usuario, así como la simbología de cada una de ellas',
      selector: '#tour-work-area-leyenda',
      orientation: Orientation.TopRight,
    },

    {
      title: 'Prender todas las capas',
      content:
        'Hace visible en el mapa todas las capas cargadas en el área de trabajo',
      selector: '#tour-turn-on-all-layers',
      orientation: Orientation.TopLeft,
    },

    {
      title: 'Apagar todas las capas',
      content:
        'Permite ocultar en el mapa todas las capas cargadas en el área de trabajo',
      selector: '#tour-turn-off-all-layers',
      orientation: Orientation.TopLeft,
    },
    {
      title: 'Panear',
      content: 'Permite desplazar el mapa arrastrando el cursor',
      selector: '#pan-button',
      orientation: Orientation.Right,
    },
    {
      title: 'Ampliar zoom',
      content:
        'Permite acercarse al mapa desde un punto central para ver más detalles de la zona',
      selector: '#zoom-in-button',
      orientation: Orientation.Right,
    },

    {
      title: 'Reducir zoom',
      content:
        'Permite alejarse del mapa desde un punto central para ver una zona más amplia',
      selector: '#zoom-out-button',
      orientation: Orientation.Right,
    },
    {
      title: 'Restablecer vista',
      content:
        'Vuelve al punto de inicio del mapa, centrando la vista en el punto incial de Colombia',
      selector: '#reset-view-button',
      orientation: Orientation.Right,
    },
    {
      title: 'Ampliar con selección',
      content:
        'Permite dibujar un rectángulo sobre el área que se quiere ampliar: el mapa hará zoom a esa zona específica.',
      selector: '#zoom-advanced-in-button',
      orientation: Orientation.Right,
    },
    {
      title: 'Reducir con selección',
      content:
        'Permite dibujar un rectángulo sobre el mapa para alejar la vista: el zoom se ajustará mostrando un área más amplia alrededor de la zona seleccionada.',
      selector: '#zoom-advanced-out-button',
      orientation: Orientation.Right,
    },
    {
      title: 'Herramientas del mapa',
      content:
        'Permite acceder a funciones del visor desde esta botonera flotante. Incluye ayuda, opciones para interactuar con el mapa (como dibujar o hacer análisis espaciales) y herramientas de consulta de la información geográfica.',
      selector: '#tour-floating-controls',
      orientation: Orientation.Left,
    },
    {
      title: 'Mapa de localización',
      content:
        'Presenta una vista general del mapa en un nivel de zoom alejado, que permite identificar la posición actual dentro de un contexto geográfico más amplio, como el país o el continente.',
      selector: '#tour-mini-map',
      orientation: Orientation.TopRight,
    },
    {
      title: 'Escala gráfica',
      content:
        'Muestra una referencia visual de distancia que permite entender las proporciones reales de los elementos en el mapa.',
      selector: '#tour-scale-options',
      orientation: Orientation.Top,
    },
    {
      title: 'Distancia de la escala',
      content: 'Muestra el nivel de la escala en el mapa',
      selector: '#scaleLineContainer',
      orientation: Orientation.Top,
    },

    {
      title: 'Coordenadas del mapa',
      content:
        'Muestra las coordenadas del mapa a través del desplazamiento del cursor',
      selector: '#tour-view-coords',
      orientation: Orientation.Top,
    },
  ],
};
