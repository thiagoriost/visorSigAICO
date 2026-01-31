import { WidgetCategoria } from '@app/core/interfaces/enums/WidgetCategoria.enum';
import { WidgetSubcategoria } from '@app/core/interfaces/enums/WidgetSubcategoria.enum';
import { IWidgetConfig } from '@app/core/config/interfaces/IWidgetConfig';

export const AISO_WIDGET_CONFIG: IWidgetConfig = {
  widgetsConfig: [
    {
      nombreWidget: 'BaseMap',
      ruta: '@projects/aiso/components/baseMapAiso/base-map-aiso/base-map-aiso.component',
      titulo: 'Mapa Base',
      subcategoria: WidgetSubcategoria.MAPA_BASE,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      icono: 'pi pi-map',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@projects/aiso/components/baseMapAiso/base-map-aiso/base-map-aiso.component'
        ).then(m => m.BaseMapAisoComponent),
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
      nombreWidget: 'MiniMap',
      ruta: '@app/widget/miniMap/components/mini-map/mini-map.component',
      titulo: 'Mini Mapa',
      subcategoria: WidgetSubcategoria.MINI_MAPA,
      categoria: WidgetCategoria.INTERACCION_VISUAL,
      icono: 'pi pi-window-minimize',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/miniMap/components/mini-map/mini-map.component'
        ).then(m => m.MiniMapComponent),
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
      nombreWidget: 'Ayuda',
      ruta: '@app/widget/ayuda/components/descarga-manual/descarga-manual',
      titulo: 'Ayuda',
      subcategoria: WidgetSubcategoria.AYUDA,
      categoria: WidgetCategoria.APOYO_DOCUMENTACION,
      icono: 'pi pi-question-circle',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/ayuda/components/descarga-manual/descarga-manual.component'
        ).then(m => m.DescargaManualComponent),
    },
    {
      nombreWidget: 'MapNavButtons',
      ruta: '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component',
      titulo: 'Controles de Navegación',
      subcategoria: WidgetSubcategoria.CONTROL_NAV,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      icono: 'pi pi-arrows-alt',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component'
        ).then(m => m.MapNavButtonsComponent),
    },
    {
      nombreWidget: 'Tabla de contenido 5',
      ruta: '@app/widget/content-table-v5/components/content-table-and-work-area/content-table-and-work-area.component',
      titulo: 'Tabla de Contenido 5',
      subcategoria: WidgetSubcategoria.TABLA_CONTENIDO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      ancho: 700,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/content-table-v5/components/content-table-and-work-area/content-table-and-work-area.component'
        ).then(m => m.ContentTableAndWorkAreaComponent),
    },
    {
      nombreWidget: 'Tabladecontenidoaiso',
      ruta: '@projects/aiso/components/content-table-aiso/content-table-aiso.component',
      titulo: 'Tabla de Contenido aiso',
      subcategoria: WidgetSubcategoria.TABLA_CONTENIDO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      ancho: 700,
      alto: 350,
      importarComponente: () =>
        import(
          '@projects/aiso/components/content-table-aiso/content-table-aiso.component'
        ).then(m => m.ContentTableAisoComponent),
    },
    {
      nombreWidget: 'ExportarMapa4',
      ruta: '@app/widget/export-map4/components/export-map4/export-map4.component',
      titulo: 'Exportar Mapa 4',
      subcategoria: WidgetSubcategoria.SALIDA_GRAFICA,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      readme: 'assets/widget-readme/export-map4/README.md',
      icono: 'pi pi-print',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/export-map4/components/export-map4/export-map4.component'
        ).then(m => m.ExportMap4Component),
    },
  ],
  overlayWidgetsConfig: [],
};
