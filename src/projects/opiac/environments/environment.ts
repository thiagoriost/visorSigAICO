export const environment = {
  production: true,
  map: {
    center: [-73.034409, 0.062827], // Latitud y longitud
    minZoom: 3, // Zoom minimo
    maxZoom: 18, // Zoom maximo
    projection: 'EPSG:4326', // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
    zoom: 6, // Zoom inicial
    proxy: 'https://dev-sigansestral.igac.gov.co/proxy?', // url del proxy
    baseLayer: 'osm_standard', // Mapa base
  },
  ayuda: {
    urlManual: '/opiac-branding/SIG_OPIAC_MUW_VISOR_V_1.0_04082025_slim.pdf', //URL  para el pdf de Ayuda
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
    baseURL: '/',
    layerAPIURL:
      'ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoExt/public',
  },
  intersect: {
    url: '/spatial/intersect',
  },
  buffer: {
    url: '/spatial/buffer',
  },
  exportMap: {
    title: 'SIG OPIAC',
    author: 'Usuario SIG OPIAC',
    showGrid: true,
    includeLegend: true,
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    logoUrl: 'assets/images/leopardo-amazonico-opiac.png',
  },
  mapNavButtons: {
    iconPanEnabled: 'pi ICON-VISOR-OPIAC_mano-cerrada',
    iconPanDisabled: 'pi ICON-VISOR-OPIAC_mano-abierta',
    iconZoomIn: 'pi ICON-VISOR-OPIAC_ACERCAR',
    iconZoomOut: 'pi ICON-VISOR-OPIAC_ALEJAR',
    iconAdvancedZoomIn: 'pi ICON-VISOR-OPIAC_zoom-aumentar',
    iconAdvancedZoomOut: 'pi ICON-VISOR-OPIAC_zoom-alejar',
    iconInactiveAdvancedZoom: 'pi pi-stop-circle',
    iconResetView: 'pi ICON-VISOR-OPIAC_COLOMBIA',
    iconToggleMouseWheelZoomEnabled: 'pi pi-lock',
    iconToggleMouseWheelZoomDisabled: 'pi pi-unlock',
  },
};
