export const environment = {
  production: false,
  map: {
    center: [-74.08175, 4.60971], // Latitud y longitud
    minZoom: 3, // Zoom minimo
    maxZoom: 18, // Zoom maximo
    projection: 'EPSG:4326', // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
    zoom: 6, // Zoom inicial
    proxy: 'https://dev-sigansestral.igac.gov.co/proxy?', // url del proxy
    baseLayer: 'opentopomap', // Mapa base
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
    baseURL: 'https://dev-visorindigenas.igac.gov.co/',
    layerAPIURL:
      'ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoExt/admin_admingeo',
  },
  intersect: {
    url: 'https://dev-visorindigenas.igac.gov.co/spatial/intersect',
  },
  buffer: {
    url: 'https://dev-visorindigenas.igac.gov.co/spatial/buffer',
  },
  exportMap: {
    title: 'Visor Geográfico',
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
  auth: {
    url: 'https://dev-sigansestral.igac.gov.co/cms-admin',
    urlLogo: 'projects/linea-negra/assets/images/logo_sig_ancestral_auth.png',
    publicRoleID: '2a9de29f-cbf2-4c7b-a3e5-77aa615ae45e',
  },
};
