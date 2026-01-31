import { TourGuideStep } from '@sjmc11/tourguidejs/src/types/TourGuideStep';

export const launcherTourSteps: TourGuideStep[] = [
  {
    content: 'Opciones disponibles para manipular el mapa',
    title: 'Botones de navegación',
    target: '[data-tour="navButtons"]',
  },
  {
    title: 'Panear',
    content: 'Permite desplazar el mapa arrastrando el cursor',
    target: '#pan-button',
  },
  {
    title: 'Restablecer vista',
    content:
      'Vuelve al punto de inicio del mapa, centrando la vista en el punto incial de Colombia',
    target: '#reset-view-button',
  },
  {
    title: 'Ampliar con selección',
    content:
      'Permite dibujar un rectángulo sobre el área que se quiere ampliar: el mapa hará zoom a esa zona específica.',
    target: '#zoom-advanced-in-button',
  },
  {
    title: 'Reducir con selección',
    content:
      'Permite dibujar un rectángulo sobre el mapa para alejar la vista: el zoom se ajustará mostrando un área más amplia alrededor de la zona seleccionada.',
    target: '#zoom-advanced-out-button',
  },
  {
    title: 'Mapa de localización',
    content:
      'Presenta una vista general del mapa en un nivel de zoom alejado, que permite identificar la posición actual dentro de un contexto geográfico más amplio, como el país o el continente.',
    target: '[data-tour="locationMap"]',
  },
  {
    title: 'Coordenadas del mapa',
    content:
      'Muestra las coordenadas del mapa a través del desplazamiento del cursor',
    target: '[data-tour="coordinates"]',
  },
  {
    title: 'Distancia de la escala',
    content: 'Muestra el nivel de la escala en el mapa',
    target: '#tour-scale-options',
  },
  {
    title: ' Escala gráfica',
    content:
      'Muestra una referencia visual de distancia que permite entender las proporciones reales de los elementos en el mapa.',
    target: '#scaleLineContainer',
  },
  {
    title: 'Modulo de autenticación',
    content:
      'Permite autenticarse en el SIG para consultar las capas asociadas a la comunidad',
    target: '[data-tour="auth"]',
  },
  {
    title: 'Herramientas del mapa',
    content:
      'Permite acceder a funciones del visor desde esta botonera flotante. Incluye ayuda, opciones para interactuar con el mapa (como dibujar o hacer análisis espaciales) y herramientas de consulta de la información geográfica.',
    target: '[data-tour="floatingMenu"]',
  },
];
