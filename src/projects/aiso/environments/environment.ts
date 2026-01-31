export const environment = {
  map: {
    center: [-75.2286, 2.61], // [longitud, latitud]
    minZoom: 3, // Zoom minimo
    maxZoom: 18, // Zoom maximo
    projection: 'EPSG:4326', // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
    zoom: 8, // Zoom inicial
    proxy: 'https://dev-sigansestral.igac.gov.co/proxy?', // url del proxy
    baseLayer: 'esri_standard', // Mapa base
  },
  ayuda: {
    urlManual: 'projects/aiso/assets/SIG_AISO_MUW_Visor_V_3.0_10112025.pdf', //URL  para el pdf de Ayuda
    nombreManual: 'manual_usuario.pdf',
    urlSolicitudPost: 'https://envio-correo-demo.free.beeceptor.com', //URL para el envio de correo
  },
  tablaContenido: {
    baseURL: 'https://dev-visorindigenas.igac.gov.co/',
    layerAPIURL:
      'ADMINSERV/AdminGeoApplication/AdminGeoWebServices/getTablaContenidoExt/aiso',
  },
  exportMap: {
    title: 'SIG AISO',
    author: 'Usuario SIG AISO',
    showGrid: true,
    includeLegend: true,
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    logoUrl: 'projects/aiso/assets/images/logo_aiso.png',
  },
  mapNavButtons: {
    iconPanEnabled: 'pi icon-aiso-cerrar',
    iconPanDisabled: 'pi icon-aiso-panear',
    iconZoomIn: 'pi pi-plus',
    iconZoomOut: 'pi pi-minus',
    iconInactiveAdvancedZoom: 'pi pi-cloud',
    iconResetView: 'pi icon-aiso-vista_total',
    iconToggleMouseWheelZoomEnabled: 'pi pi-circle-off',
    iconToggleMouseWheelZoomDisabled: 'pi pi-circle-on',
    iconAdvancedZoomIn: 'pi pi-stop-circle',
    iconAdvancedZoomOut: 'pi pi-stop-circle',
  },
};
