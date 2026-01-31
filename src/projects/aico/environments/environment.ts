export const environment = {
  map: {
    center: [-74.08175, 4.60971], // Latitud y longitud
    minZoom: 3, // Zoom minimo
    maxZoom: 18, // Zoom maximo
    projection: 'EPSG:4326', // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
    zoom: 5, // Zoom inicial
    proxy: '/igac-geoserver/', // url del proxy local de Angular
    baseLayer: 'opentopomap', // Mapa base
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
    baseURL: 'https://dev-visor.igac.gov.co/',
    layerAPIURL:
      'ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoExt/aico',
    layerAPIURL_AICO:
      'ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoExt/aico',
  },
  production: true,
  apiProxyPrefix: '/mparcgis', // O la URL base de tu API en producción
  intersect: {
    url: 'https://dev-visor.igac.gov.co/spatial/intersect',
  },
  buffer: {
    url: 'https://dev-visor.igac.gov.co/spatial/buffer',
  },
  exportMap: {
    title: 'SIG AICO',
    author: 'Instituto Geográfico Agustín Codazzi',
    showGrid: true,
    includeLegend: true,
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    logoUrl: 'assets/images/LogoTest.png',
  },
  actosAdministrativos: {
    urlConsultaCodigoDane:
      'https://simosofws.cntindigena.org/api/consulta_codigo_dane/?id_dane=',
  },
};
