import { WidgetCategoria } from '@app/core/interfaces/enums/WidgetCategoria.enum';
import { WidgetSubcategoria } from '@app/core/interfaces/enums/WidgetSubcategoria.enum';
import { IWidgetConfig } from '@app/core/config/interfaces/IWidgetConfig';

export const DEFAULT_WIDGET_CONFIG: IWidgetConfig = {
  widgetsConfig: [
    {
      nombreWidget: 'BaseMap',
      ruta: '@app/widget/baseMap/Components/launcher-mapa-base/launcher-mapa-base.component',
      titulo: 'Mapa Base',
      subcategoria: WidgetSubcategoria.MAPA_BASE,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      readme: 'app/widget/baseMap/README.md',
      icono: 'pi pi-map',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/baseMap/Components/launcher-mapa-base/launcher-mapa-base.component'
        ).then(m => m.LauncherMapaBaseComponent),
    },
    {
      nombreWidget: 'Autenticacion',
      ruta: '@app/widget-ui/components/auth-component/components/auth-launcher/auth-launcher.component.ts',
      titulo: 'Autenticación',
      subcategoria: WidgetSubcategoria.AREA_TRABAJO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      readme: 'app/widget/baseMap/README.md',
      icono: 'pi pi-map',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget-ui/components/auth-component/components/auth-launcher/auth-launcher.component'
        ).then(m => m.AuthLauncherComponent),
    },
    {
      nombreWidget: 'ContentTable',
      ruta: '@app/widget/content-table/components/content-table/content-table.component.ts',
      titulo: 'Tabla de Contenido',
      subcategoria: WidgetSubcategoria.TABLA_CONTENIDO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      icono: 'pi pi-list',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/content-table/components/content-table/content-table.component'
        ).then(m => m.ContentTableComponent),
    },
    {
      nombreWidget: 'Identify',
      ruta: '@app/widget/identify/components/identify/identify.component',
      titulo: 'Identificar',
      subcategoria: WidgetSubcategoria.IDENTIFICAR,
      categoria: WidgetCategoria.CONSULTA_ANALISIS,
      altoMaximo: 400,
      anchoMaximo: 450,
      icono: 'pi pi-search',
      ancho: 450,
      alto: 400,
      importarComponente: () =>
        import(
          '@app/widget/identify/components/identify/identify.component'
        ).then(m => m.IdentifyComponent),
    },
    {
      nombreWidget: 'Medicion',
      ruta: '@app/widget/medicion/components/medicion-ppal/medicion-ppal.component',
      titulo: 'Medición',
      subcategoria: WidgetSubcategoria.MEDICION,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      icono: 'pi pi-sliders-h',
      ancho: 300,
      alto: 250,
      importarComponente: () =>
        import(
          '@app/widget/medicion/components/medicion-ppal/medicion-ppal.component'
        ).then(m => m.MedicionPpalComponent),
    },
    {
      nombreWidget: 'UbicarMedianteCoordenadas',
      ruta: '@app/widget/ubicar-mediante-coordenadas/componentes/ubicar-mediante-coordenadas/ubicar-mediante-coordenadas.component',
      titulo: 'Ubicar mediante coordenadas',
      subcategoria: WidgetSubcategoria.UBICAR_COORDENADAS,
      categoria: WidgetCategoria.NAVEGACION_LOCALIZACION,
      icono: 'pi pi-compass',
      ancho: 300,
      alto: 250,
      importarComponente: () =>
        import(
          '@app/widget/ubicar-mediante-coordenadas/componentes/ubicar-mediante-coordenadas/ubicar-mediante-coordenadas.component'
        ).then(m => m.UbicarMedianteCoordenadasComponent),
    },
    {
      nombreWidget: 'attributeTable',
      ruta: '@app/widget/attributeTable/components/attribute-table/attribute-table.component',
      titulo: 'Tabla de atributos',
      subcategoria: WidgetSubcategoria.TABLA_ATRIBUTOS,
      categoria: WidgetCategoria.GESTION_DATOS,
      readme: 'app/widget/attributeTable/README.md',
      icono: 'pi pi-table',
      ancho: 500,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/attributeTable/components/attribute-table/attribute-table.component'
        ).then(m => m.AttributeTableComponent),
    },
    {
      nombreWidget: 'AddWMS',
      ruta: '@app/widget/add-wms/components/add-wms/add-wms.component',
      titulo: 'Adicionar WMS',
      subcategoria: WidgetSubcategoria.ADICIONAR_WMS,
      categoria: WidgetCategoria.GESTION_DATOS,
      icono: 'pi pi-cloud-upload',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import('@app/widget/add-wms/components/add-wms/add-wms.component').then(
          m => m.AddWmsComponent
        ),
    },
    {
      nombreWidget: 'useTable',
      ruta: '@app/widget/attributeTable/components/formData/form-data/form-data.component',
      titulo: 'Usar tabla de atributos',
      subcategoria: WidgetSubcategoria.TABLA_ATRIBUTOS,
      categoria: WidgetCategoria.GESTION_DATOS,
      icono: 'pi pi-table',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/attributeTable/components/formData/form-data/form-data.component'
        ).then(m => m.FormDataComponent),
    },
    {
      nombreWidget: 'MiniMap',
      ruta: '@app/widget/miniMap/components/mini-map-launcher/mini-map-launcher.component',
      titulo: 'Mini Mapa',
      readme: 'app/widget/miniMap/README.md',
      subcategoria: WidgetSubcategoria.MINI_MAPA,
      categoria: WidgetCategoria.INTERACCION_VISUAL,
      icono: 'pi pi-window-minimize',
      ancho: 500,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/miniMap/components/mini-map-launcher/mini-map-launcher.component'
        ).then(m => m.MiniMapLauncherComponent),
    },
    {
      nombreWidget: 'SubirArchivo',
      ruta: '@app/widget/addDataFile/components/add-data-file/add-data-file.component',
      titulo: 'Subir Archivo',
      subcategoria: WidgetSubcategoria.SUBIR_ARCHIVO,
      categoria: WidgetCategoria.GESTION_DATOS,
      icono: 'pi pi-upload',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/addDataFile/components/add-data-file/add-data-file.component'
        ).then(m => m.AddDataFileComponent),
    },
    {
      nombreWidget: 'Dibujar',
      ruta: '@app/widget/dibujar/components/btn-dibujo/btn-dibujo.component',
      titulo: 'Dibujar',
      subcategoria: WidgetSubcategoria.DIBUJAR,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      icono: 'pi pi-pencil',
      ancho: 400,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/dibujar/components/btn-dibujo/btn-dibujo.component'
        ).then(m => m.BtnDibujoComponent),
    },
    {
      nombreWidget: 'BuscarDireccion',
      ruta: '@app/widget/buscarDireccion/components/buscar-direccion/buscar-direccion.component',
      titulo: 'Buscar Direccion',
      subcategoria: WidgetSubcategoria.BUSCAR_DIRECCION,
      categoria: WidgetCategoria.NAVEGACION_LOCALIZACION,
      icono: 'pi pi-map-marker',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/buscarDireccion/components/buscar-direccion/buscar-direccion.component'
        ).then(m => m.BuscarDireccionComponent),
    },
    {
      nombreWidget: 'Leyenda',
      ruta: '@app/widget/leyenda/components/leyenda/leyenda.component',
      titulo: 'Leyenda',
      subcategoria: WidgetSubcategoria.LEYENDA,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      icono: 'pi pi-bookmark',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import('@app/widget/leyenda/components/leyenda/leyenda.component').then(
          m => m.LeyendaComponent
        ),
    },
    {
      nombreWidget: 'BarraEscala',
      ruta: '@app/widget/barraEscala/components/barra-escala/barra-escala.component',
      titulo: 'Barra de Escala',
      subcategoria: WidgetSubcategoria.BARRA_ESCALA,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      readme: 'app/widget/barraEscala/README.md',
      icono: 'pi pi-arrows-alt-v',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/barraEscala/components/barra-escala/barra-escala.component'
        ).then(m => m.BarraEscalaComponent),
    },
    {
      nombreWidget: 'ResultadoIdentificar',
      ruta: '@app/widget/identify/components/show-result/show-result.component',
      titulo: 'Resultado Identificar',
      subcategoria: WidgetSubcategoria.IDENTIFICAR,
      categoria: WidgetCategoria.CONSULTA_ANALISIS,
      icono: 'pi pi-info-circle',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/identify/components/show-result/show-result.component'
        ).then(m => m.ShowResultComponent),
    },
    {
      nombreWidget: 'Coordenadas Cursor',
      ruta: '@app/widget/viewCoords/components/launcher-view-coords/launcher-view-coords.component',
      titulo: 'Coordenadas Cursor',
      subcategoria: WidgetSubcategoria.COORDENADAS_CURSOR,
      categoria: WidgetCategoria.NAVEGACION_LOCALIZACION,
      readme: 'app/widget/viewCoords/README.md',
      icono: 'pi pi-directions',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/viewCoords/components/launcher-view-coords/launcher-view-coords.component'
        ).then(m => m.LauncherViewCoordsComponent),
    },
    {
      nombreWidget: 'ConsultaSimple',
      ruta: '@app/widget/consulta-simple/components/consultaSimple/consulta-simple.component',
      ancho: 350,
      alto: 350,
      titulo: 'Consulta Simple',
      subcategoria: WidgetSubcategoria.CONSULTA_SIMPLE,
      categoria: WidgetCategoria.CONSULTA_ANALISIS,
      icono: 'pi pi-filter',
      importarComponente: () =>
        import(
          '@app/widget/consultaSimple/components/consulta-simple/consulta-simple.component'
        ).then(m => m.ConsultaSimpleComponent),
    },
    {
      nombreWidget: 'ConsultaAvanzada',
      ruta: '@app/widget/consultaAvanzada/components/consulta-avanzada/consulta-avanzada.component',
      subcategoria: WidgetSubcategoria.CONSULTA_AVANZADA,
      categoria: WidgetCategoria.CONSULTA_ANALISIS,
      icono: 'pi pi-sliders-v',
      ancho: 350,
      alto: 350,
      titulo: 'Consulta Avanzada',
      importarComponente: () =>
        import(
          '@app/widget/consultaAvanzada/components/consulta-avanzada/consulta-avanzada.component'
        ).then(m => m.ConsultaAvanzadaComponent),
    },
    {
      nombreWidget: 'SeleccionEspacial',
      ruta: '@app/widget/seleccion-espacial/components/home-seleccion-espacial/home-seleccion-espacial.component',
      titulo: 'Selección Espacial',
      subcategoria: WidgetSubcategoria.SELECCION_ESPACIAL,
      categoria: WidgetCategoria.CONSULTA_ANALISIS,
      icono: 'pi pi-check-square',
      ancho: 350,
      alto: 300,
      importarComponente: () =>
        import(
          '@app/widget/seleccion-espacial/components/home-seleccion-espacial/home-seleccion-espacial.component'
        ).then(m => m.HomeSeleccionEspacialComponent),
    },
    {
      nombreWidget: 'Intersección',
      ruta: '@app/widget/interseccion/components/interseccion/interseccion.component',
      titulo: 'Intersección',
      subcategoria: WidgetSubcategoria.INTERSECCION,
      categoria: WidgetCategoria.CONSULTA_ANALISIS,
      icono: 'pi pi-share-alt',
      ancho: 450,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/interseccion/components/interseccion/interseccion.component'
        ).then(m => m.InterseccionComponent),
    },
    {
      nombreWidget: 'Ayuda',
      ruta: '@app/widget/ayuda/components/ayuda/ayuda.component',
      titulo: 'Ayuda',
      subcategoria: WidgetSubcategoria.AYUDA,
      categoria: WidgetCategoria.APOYO_DOCUMENTACION,
      icono: 'pi pi-question-circle',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import('@app/widget/ayuda/components/ayuda/ayuda.component').then(
          m => m.AyudaComponent
        ),
    },
    {
      nombreWidget: 'Swipe',
      ruta: '@app/widget/swipe/components/swipe/swipe.component.ts',
      titulo: 'Swipe',
      subcategoria: WidgetSubcategoria.SWIPE,
      categoria: WidgetCategoria.INTERACCION_VISUAL,
      icono: 'pi pi-clone',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import('@app/widget/swipe/components/swipe/swipe.component').then(
          m => m.SwipeComponent
        ),
    },
    {
      nombreWidget: 'Area de trabajo 2',
      ruta: '@app/widget/work-area-v2/components/work-area-v2/work-area-v2.component',
      titulo: 'Area de trabajo 2',
      subcategoria: WidgetSubcategoria.AREA_TRABAJO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      icono: 'pi pi-th-large',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/work-area-v2/components/work-area-v2/work-area-v2.component'
        ).then(m => m.WorkAreaV2Component),
    },
    {
      nombreWidget: 'Tabla de contenido 2',
      ruta: '@app/widget/content-table-with-toggle-switch/components/content-table-toggle-switch/content-table-toggle-switch.component',
      titulo: 'Tabla de contenido 2',
      readme: 'app/widget/content-table-with-toggle-switch/README.md',
      subcategoria: WidgetSubcategoria.TABLA_CONTENIDO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      icono: 'pi pi-list',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/content-table-with-toggle-switch/components/content-table-toggle-switch/content-table-toggle-switch.component'
        ).then(m => m.ContentTableToggleSwitchComponent),
    },
    {
      nombreWidget: 'Botonera Vertical',
      ruta: '@app/widget-ui/components/botoneraVertical/components/generator.component',
      titulo: 'Botonera Vertical',
      subcategoria: WidgetSubcategoria.BOTONERA_VERTICAL,
      categoria: WidgetCategoria.INTERACCION_VISUAL,
      icono: 'pi pi-bars',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget-ui/components/botoneraVertical/components/generator/generator.component'
        ).then(m => m.GeneratorComponent),
    },
    {
      nombreWidget: 'Buffer',
      ruta: '@app/widget/bufferArea/components/buffer-area-ppal/buffer-area-ppal.component',
      titulo: 'Área de influencia (Buffer)',
      subcategoria: WidgetSubcategoria.BUFFER,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      icono: 'pi pi-circle',
      ancho: 350,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/bufferArea/components/buffer-area-ppal/buffer-area-ppal.component'
        ).then(m => m.BufferAreaPpalComponent),
    },
    {
      nombreWidget: 'MapNavButtons',
      ruta: '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component',
      titulo: 'Controles de Navegación',
      subcategoria: WidgetSubcategoria.CONTROL_NAV,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      readme: 'app/widget/map-nav-buttons/README.md',
      icono: 'pi pi-arrows-alt',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component'
        ).then(m => m.MapNavButtonsComponent),
    },
    {
      nombreWidget: 'DescargarManual',
      ruta: '@projects/opiac/components/ayuda-opiac/ayuda-opiac.component',
      titulo: 'Ayuda',
      subcategoria: WidgetSubcategoria.DESCARGAR_MANUAL,
      categoria: WidgetCategoria.APOYO_DOCUMENTACION,
      icono: 'pi pi-download',
      ancho: 300,
      alto: 350,
      importarComponente: () =>
        import(
          '@projects/opiac/components/ayuda-opiac/ayuda-opiac.component'
        ).then(m => m.AyudaOpiacComponent),
    },
    {
      nombreWidget: 'Tabla de contenido 3',
      ruta: '@app/widget/content-table-version-3/components/content-table-v3/content-table-v3.component',
      titulo: 'Tabla de contenido 3',
      readme: 'app/widget/content-table-version-3/README.md',
      subcategoria: WidgetSubcategoria.TABLA_CONTENIDO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      ancho: 350,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/content-table-version-3/components/content-table-v3/content-table-v3.component'
        ).then(m => m.ContentTableV3Component),
    },
    {
      nombreWidget: 'Leyenda V2',
      ruta: '@app/widget/legend-v2/components/legend-second-version/legend-second-version.component',
      titulo: 'Leyenda V2',
      subcategoria: WidgetSubcategoria.LEYENDA,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      ancho: 350,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/legend-v2/components/legend-second-version/legend-second-version.component'
        ).then(m => m.LegendSecondVersionComponent),
    },
    {
      nombreWidget: 'Tabla de contenido 4',
      ruta: '@app/widget/content-table-v4/components/content-table-v4/content-table-v4.component',
      titulo: 'Tabla de Contenido 4',
      readme: 'app/widget/content-table-v4/README.md',
      subcategoria: WidgetSubcategoria.TABLA_CONTENIDO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      ancho: 700,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/content-table-v4/components/content-table-v4/content-table-v4.component'
        ).then(m => m.ContentTableV4Component),
    },
    {
      nombreWidget: 'launcher tour',
      ruta: '@app/shared/components/launcher-tour/launcher-tour/launcher-tour.component',
      titulo: 'Launcher Tour',
      subcategoria: WidgetSubcategoria.AYUDA,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      readme: 'app/shared/services/tour/README.md',
      importarComponente: () =>
        import(
          '@app/shared/components/launcher-tour/launcher-tour/launcher-tour.component'
        ).then(m => m.LauncherTourComponent),
    },
    {
      nombreWidget: 'Tabla de contenido 5',
      ruta: '@app/widget/content-table-v5/components/content-table-and-work-area/content-table-and-work-area.component',
      titulo: 'Tabla de Contenido 5',
      subcategoria: WidgetSubcategoria.TABLA_CONTENIDO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      readme: 'app/widget/content-table-v5/README.md',
      ancho: 700,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/content-table-v5/components/content-table-and-work-area/content-table-and-work-area.component'
        ).then(m => m.ContentTableAndWorkAreaComponent),
    },
    {
      nombreWidget: 'InfoPanel',
      ruta: '@app/widget/InfoPanel/components/info-panel-launcher/info-panel-launcher.component',
      titulo: 'InfoPanel',
      subcategoria: WidgetSubcategoria.INFO_PANEL,
      categoria: WidgetCategoria.NAVEGACION_LOCALIZACION,
      icono: 'pi pi-download',
      ancho: 300,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/InfoPanel/components/info-panel-launcher/info-panel-launcher.component'
        ).then(m => m.InfoPanelLauncherComponent),
    },
    {
      nombreWidget: 'ExportarMapa2',
      ruta: '@app/widget/export-map2/components/export-map-launcher/export-map-launcher.component',
      titulo: 'Exportar Mapa 2',
      subcategoria: WidgetSubcategoria.SALIDA_GRAFICA,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      icono: 'pi pi-print',
      readme: 'app/widget/export-map2/README.md',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/export-map2/components/export-map-launcher/export-map-launcher.component'
        ).then(m => m.ExportMapLauncherComponent),
    },
    {
      nombreWidget: 'ExportarMapa3',
      ruta: '@app/widget/export-map3/components/export-map3/export-map3.component',
      titulo: 'Exportar Mapa 3',
      subcategoria: WidgetSubcategoria.SALIDA_GRAFICA,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      icono: 'pi pi-print',
      readme: 'app/widget/export-map3/README.md',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/export-map3/components/export-map3/export-map3.component'
        ).then(m => m.ExportMap3Component),
    },
    {
      nombreWidget: 'ExportarMapa4',
      ruta: '@app/widget/export-map4/components/export-map4/export-map4.component',
      titulo: 'Exportar Mapa 4',
      subcategoria: WidgetSubcategoria.SALIDA_GRAFICA,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      readme: 'app/widget/export-map4/README.md',
      icono: 'pi pi-print',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/export-map4/components/export-map4/export-map4.component'
        ).then(m => m.ExportMap4Component),
    },
    {
      nombreWidget: 'ExportarMapa5',
      ruta: '@app/widget/export-map5/components/export-map-launcher/export-map-launcher.component',
      titulo: 'Exportar Mapa 5',
      subcategoria: WidgetSubcategoria.SALIDA_GRAFICA,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      readme: 'assets/widget-readme/export-map4/README.md',
      icono: 'pi pi-print',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/export-map5/components/export-map-launcher/export-map-launcher.component'
        ).then(m => m.ExportMapLauncherComponent),
    },
    {
      nombreWidget: 'ExportarMapa6',
      ruta: '@app/widget/export-map6/components/export-map6/export-map6.component',
      titulo: 'Exportar Mapa 6',
      subcategoria: WidgetSubcategoria.SALIDA_GRAFICA,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      readme: 'app/widget/export-map4/README.md',
      icono: 'pi pi-print',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/export-map6/components/export-map6/export-map6.component'
        ).then(m => m.ExportMap6Component),
    },
    {
      nombreWidget: 'MiniMap2',
      ruta: '@app/widget/miniMap_v2/components/mini-map-launcher/mini-map-launcher.component',
      titulo: 'Mini Mapa Version 2',
      subcategoria: WidgetSubcategoria.MINI_MAPA,
      categoria: WidgetCategoria.INTERACCION_VISUAL,
      readme: 'app/widget/miniMap_v2/README.md',
      icono: 'pi pi-window-minimize',
      ancho: 500,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/miniMap_v2/components/mini-map-launcher/mini-map-launcher.component'
        ).then(m => m.MiniMapLauncherComponent),
    },
    {
      nombreWidget: 'InicioSesionLineaNegra',
      ruta: '@app/widget-ui/components/auth-component/components/auth-container/auth-container.component',
      titulo: 'Inicio Sesión Línea Negra',
      subcategoria: WidgetSubcategoria.INFO_PANEL,
      categoria: WidgetCategoria.GESTION_DATOS,
      readme: 'app/widget-ui/components/auth-component/README.md',
      icono: 'pi pi-window-minimize',
      ancho: 500,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget-ui/components/auth-component/components/auth-container/auth-container.component'
        ).then(m => m.AuthContainerComponent),
    },
  ],
  overlayWidgetsConfig: [
    {
      nombreWidget: 'ExportarMapa2',
      ruta: '@app/widget/export-map2/components/export-map2/export-map2.component',
      titulo: 'Exportar Mapa',
      ancho: 600,
      alto: 600,
      importarComponente: () =>
        import(
          '@app/widget/export-map2/components/export-map2/export-map2.component'
        ).then(m => m.ExportMap2Component),
    },
    {
      nombreWidget: 'ExportarMapa5',
      ruta: '@app/widget/export-map5/components/export-map5/export-map5.component',
      titulo: 'Exportar Mapa',
      ancho: 600,
      alto: 600,
      importarComponente: () =>
        import(
          '@app/widget/export-map5/components/export-map5/export-map5.component'
        ).then(m => m.ExportMap5Component),
    },
  ],
};
