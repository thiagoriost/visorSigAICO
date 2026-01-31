export const environment = {
  production: false,
  map: {
    center: [-74.08175, 4.60971], // Latitud y longitud
    minZoom: 3, // Zoom minimo
    maxZoom: 18, // Zoom maximo
    projection: 'EPSG:4326', // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
    zoom: 6, // Zoom inicial
    proxy: 'https://dev-sigansestral.igac.gov.co/proxy?', // url del proxy
    baseLayer: 'osm_standard', // Mapa base
  },
  ayuda: {
    urlManual: 'assets/SIG_GM_MUW_VISOR_V_1.0_31102025.pdf',
    nombreManual: 'SIG_GM_MUW_VISOR_V_1.0_31102025.pdf',
    urlSolicitudPost: 'https://envio-correo-demo.free.beeceptor.com',
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
      'ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoExt/gobierno_mayor',
  },
  intersect: {
    url: 'https://dev-visoropiac.igac.gov.co/spatial/intersect',
  },
  buffer: {
    url: 'https://dev-visoropiac.igac.gov.co/spatial/buffer',
  },
  exportMap: {
    title: 'Visor Geográfico',
    author: 'Gobierno Mayor',
    showGrid: true,
    includeLegend: true,
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    logoUrl: 'assets/images/SIG gobierno mayor_Logo.png',
  },
  branding: {
    logoUrl: 'assets/images/SIG gobierno mayor_Logo.png',
    railPatternUrl: 'assets/images/SIG_gobierno_mayor_Trama.png',
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
};
