export const environment = {
  map: {
    center: [-74.08175, 4.60971], // Latitud y longitud
    minZoom: 3, // Zoom minimo
    maxZoom: 18, // Zoom maximo
    projection: 'EPSG:4326', // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
    zoom: 5, // Zoom inicial
    proxy: '/igac-geoserver/', // url del proxy local de Angular
    baseLayer: 'esri_topo', // Mapa base
  },
  ayuda: {
    urlManual: '/branding/SIG_Indígena_MUW_VISOR_V.4.0.pdf', //URL  para el pdf de Ayuda
    nombreManual: 'manual_usuario.pdf',
    urlSolicitudPost: 'https://envio-correo-demo.free.beeceptor.com', //URL para el envio de correo
  },
  opcionDibujo: ['Point', 'Polygon', 'LineString', 'Circle'] as (
    | 'Point'
    | 'Polygon'
    | 'LineString'
    | 'Circle'
  )[],
  tablaContenido: {
    // Usar proxy local para evitar problemas de CORS y DNS
    baseURL: '/igac-geoserver/',
    layerAPIURL:
      'ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoExt/aico',
  },
  production: false,
  apiProxyPrefix: '/mparcgis',
  intersect: {
    // url: 'https://dev-visor.igac.gov.co/spatial/intersect',
    url: 'http://localhost:9080/geo-clip/spatial/intersect',
  },
  buffer: {
    url: '/geo-clip/spatial/buffer',
    // Configuraciones adicionales para el microservicio local geo-clip
    timeout: 60000, // 60 segundos
    maxRetries: 1,
    retryDelay: 2000, // 2 segundos entre reintentos
    // URLs alternativas si la principal falla (usando proxy)
    fallbackUrls: [
      '/geo-clip/spatial/buffer',
      'http://localhost:9080/geo-clip/spatial/buffer', // Fallback directo
    ],
    // Configuración específica del microservicio geo-clip
    defaultParams: {
      outputFormat: 'application/json',
      srid: 4326, // Sistema de coordenadas por defecto
    },
  },
  exportMap: {
    title: 'SIG AICO',
    author: 'Instituto Geográfico Agustín Codazzi',
    showGrid: true,
    includeLegend: true,
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    logoUrl: 'assets/images/LogoTest.png',
  },
  mapNavButtons: {
    iconPanEnabled: 'pi pi-ban',
    iconPanDisabled: 'pi pi-asterisk',
    iconZoomIn: 'pi pi-search-plus',
    iconZoomOut: 'pi pi-search-minus',
    iconInactiveAdvancedZoom: 'pi pi-cloud',
    iconResetView: 'pi pi-refresh',
    iconToggleMouseWheelZoomEnabled: 'pi pi-circle-off',
    iconToggleMouseWheelZoomDisabled: 'pi pi-circle-on',
    iconAdvancedZoomIn: 'pi pi-stop-circle',
    iconAdvancedZoomOut: 'pi pi-stop-circle',
  },
  actosAdministrativos: {
    urlConsultaCodigoDane:
      'https://simosofws.cntindigena.org/api/consulta_codigo_dane/?id_dane=',
  },
};
