export const environment = {
  production: true,
  map: {
    center: [-73.72, 10.86], // Latitud y longitud
    minZoom: 3, // Zoom minimo
    maxZoom: 18, // Zoom maximo
    projection: 'EPSG:4326', // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
    zoom: 6, // Zoom inicial
    proxy: 'https://dev-sigansestral.igac.gov.co/proxy?', // url del proxy
    baseLayer: 'google_satellite', // Mapa base
  },
  ayuda: {
    urlManual: 'assets/SIG_LINEA_NEGRA_MUW_Visor_V_3.0_12122025.pdf',
    nombreManual: 'Manual_Usuario_SIG_LINEA_NEGRA.pdf',
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
      'ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoExt/ancestral',
  },
  intersect: {
    url: '/spatial/intersect',
  },
  buffer: {
    url: '/spatial/buffer',
  },
  exportMap: {
    title: 'SIG ANCESTRAL DE LA LINEA NEGRA',
    author: 'Usuario SIG ANCESTRAL LINEA NEGRA',
    showGrid: true,
    includeLegend: true,
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    logoUrl: 'assets/images/logo_sig_ancestral.png',
  },
  mapNavButtons: {
    iconPanEnabled: 'icon-ln-panear',
    iconPanDisabled: 'icon-ln-panear',
    iconZoomIn: 'icon-ln-add-circle',
    iconZoomOut: 'icon-ln-remove',
    iconInactiveAdvancedZoom: 'pi pi-cloud',
    iconResetView: 'icon-ln-earth',
    iconToggleMouseWheelZoomEnabled: 'pi pi-circle-off',
    iconToggleMouseWheelZoomDisabled: 'pi pi-circle-on',
    iconAdvancedZoomIn: 'pi pi-stop-circle',
    iconAdvancedZoomOut: 'pi pi-stop-circle',
  },
  auth: {
    url: 'https://dev-sigansestral.igac.gov.co/cms-admin',
    urlLogo: 'projects/linea-negra/assets/images/logo_sig_ancestral_auth.png',
    publicRoleID: '2a9de29f-cbf2-4c7b-a3e5-77aa615ae45e',
  },
};
