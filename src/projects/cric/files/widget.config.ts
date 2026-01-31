import { WidgetCategoria } from '@app/core/interfaces/enums/WidgetCategoria.enum';
import { WidgetSubcategoria } from '@app/core/interfaces/enums/WidgetSubcategoria.enum';
import { IWidgetConfig } from '@app/core/config/interfaces/IWidgetConfig';

export const CRIC_WIDGET_CONFIG: IWidgetConfig = {
  widgetsConfig: [
    {
      nombreWidget: 'Identify',
      ruta: '@app/widget/identify/components/identify/identify.component',
      titulo: 'Identificar',
      subcategoria: WidgetSubcategoria.IDENTIFICAR,
      categoria: WidgetCategoria.CONSULTA_ANALISIS,
      altoMaximo: 900,
      anchoMaximo: 900,
      icono: 'pi pi-search',
      ancho: 350,
      alto: 300,
      importarComponente: () =>
        import(
          '@app/widget/identify/components/identify/identify.component'
        ).then(m => m.IdentifyComponent),
    },
    {
      nombreWidget: 'attributeTable',
      ruta: '@app/widget/attributeTable/components/attribute-table/attribute-table.component',
      titulo: 'Tabla de atributos',
      subcategoria: WidgetSubcategoria.TABLA_ATRIBUTOS,
      categoria: WidgetCategoria.GESTION_DATOS,
      icono: 'pi pi-table',
      ancho: 500,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/attributeTable/components/attribute-table/attribute-table.component'
        ).then(m => m.AttributeTableComponent),
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
      nombreWidget: 'BarraEscala',
      ruta: '@app/widget/barraEscala/components/barra-escala/barra-escala.component',
      titulo: 'Barra de Escala',
      subcategoria: WidgetSubcategoria.BARRA_ESCALA,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
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
      ruta: '@app/widget/viewCoords/components/view-coords/view-coords.component',
      titulo: 'Coordenadas Cursor',
      subcategoria: WidgetSubcategoria.COORDENADAS_CURSOR,
      categoria: WidgetCategoria.NAVEGACION_LOCALIZACION,
      icono: 'pi pi-directions',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/viewCoords/components/view-coords/view-coords.component'
        ).then(m => m.ViewCoordsComponent),
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
      nombreWidget: 'MapNavButtons',
      ruta: '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component',
      titulo: 'Controles de Navegación',
      subcategoria: WidgetSubcategoria.CONTROL_NAV,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      icono: 'pi pi-arrows-alt',
      ancho: 455,
      alto: 300,
      importarComponente: () =>
        import(
          '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component'
        ).then(m => m.MapNavButtonsComponent),
    },
    {
      nombreWidget: 'Tabla de contenido 3',
      ruta: '@app/widget/content-table-with-legend-and-buttons/components/content-table-v3/content-table-v3.component',
      titulo: 'Tabla de contenido 3',
      subcategoria: WidgetSubcategoria.TABLA_CONTENIDO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      ancho: 350,
      alto: 300,
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
      alto: 300,
      importarComponente: () =>
        import(
          '@app/widget/legend-v2/components/legend-second-version/legend-second-version.component'
        ).then(m => m.LegendSecondVersionComponent),
    },
    {
      nombreWidget: 'ExportarMapa3',
      ruta: '@app/widget/export-map3/components/export-map3/export-map3.component',
      titulo: 'Exportar Mapa 3',
      subcategoria: WidgetSubcategoria.SALIDA_GRAFICA,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      icono: 'pi pi-print',
      readme: 'assets/widget-readme/export-map3/README.md',
      ancho: 350,
      alto: 300,
      anchoMaximo: 1000,
      altoMaximo: 900,
      importarComponente: () =>
        import(
          '@app/widget/export-map3/components/export-map3/export-map3.component'
        ).then(m => m.ExportMap3Component),
    },
    {
      nombreWidget: 'MiniMap2',
      ruta: '@app/widget/miniMap_v2/components/mini-map-launcher/mini-map-launcher.component',
      titulo: 'Mini Mapa Version 2',
      subcategoria: WidgetSubcategoria.MINI_MAPA,
      categoria: WidgetCategoria.INTERACCION_VISUAL,
      icono: 'pi pi-window-minimize',
      ancho: 400,
      alto: 300,
      importarComponente: () =>
        import(
          '@app/widget/miniMap_v2/components/mini-map-launcher/mini-map-launcher.component'
        ).then(m => m.MiniMapLauncherComponent),
    },
    {
      nombreWidget: 'DescargarManualCric',
      ruta: '@projects/cric/components/ayuda-cric/ayuda-cric.component',
      titulo: 'Ayuda',
      subcategoria: WidgetSubcategoria.DESCARGAR_MANUAL,
      categoria: WidgetCategoria.APOYO_DOCUMENTACION,
      icono: 'pi pi-download',
      ancho: 300,
      alto: 350,
      importarComponente: () =>
        import(
          '@projects/cric/components/ayuda-cric/ayuda-cric.component'
        ).then(m => m.AyudaCricComponent),
    },
  ],
  overlayWidgetsConfig: [],
};
