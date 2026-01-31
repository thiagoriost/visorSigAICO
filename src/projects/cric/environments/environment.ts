export const environment = {
  production: false,
  map: {
    center: [-76.983333, 2.405278], // Latitud y longitud
    minZoom: 3, // Zoom minimo
    maxZoom: 18, // Zoom maximo
    projection: 'EPSG:4326', // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
    zoom: 9, // Zoom inicial
    proxy: 'https://dev-sigansestral.igac.gov.co/proxy?', // url del proxy
    baseLayer: 'esri_satellite', // Mapa base
  },
  ayuda: {
    urlManual: 'assets/SIG_CRIC_MUW_Visor_V_1.1_05112025.pdf', //URL  para el pdf de Ayuda
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
    baseURL: 'https://dev-visorindigenas.igac.gov.co/',
    layerAPIURL:
      'ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoExt/cric',
  },
  intersect: {
    url: 'https://dev-visorindigenas.igac.gov.co/spatial/intersect',
  },
  buffer: {
    url: 'https://dev-visorindigenas.igac.gov.co/spatial/buffer',
  },
  exportMap: {
    title: 'SIG CRIC',
    author: 'Usuario SIG CRIC',
    showGrid: true,
    includeLegend: true,
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    logoUrl: 'assets/images/Logo_SIG_CRIC-02.png',
  },
  mapNavButtons: {
    iconPanEnabled: 'pi pi-ban',
    iconPanDisabled: 'pi cric-mano',
    iconZoomIn: 'pi cric-zoom_in',
    iconZoomOut: 'pi cric-zoom_out',
    iconInactiveAdvancedZoom: 'pi pi-cloud',
    iconResetView: 'pi cric-Iconos_Vista-total',
    iconToggleMouseWheelZoomEnabled: 'pi pi-circle-off',
    iconToggleMouseWheelZoomDisabled: 'pi pi-circle-on',
    iconAdvancedZoomIn: 'pi cric-zoom_in',
    iconAdvancedZoomOut: 'pi cric-zoom_out',
  },
};
