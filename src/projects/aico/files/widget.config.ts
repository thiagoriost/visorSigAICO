import { WidgetCategoria } from '@app/core/interfaces/enums/WidgetCategoria.enum';
import { WidgetSubcategoria } from '@app/core/interfaces/enums/WidgetSubcategoria.enum';
import { IWidgetConfig } from '@app/core/config/interfaces/IWidgetConfig';

export const AICO_WIDGET_CONFIG: IWidgetConfig = {
  widgetsConfig: [
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
      icono: 'pi pi-arrows-alt-v',
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/barraEscala/components/barra-escala/barra-escala.component'
        ).then(m => m.BarraEscalaComponent),
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
      ancho: 255,
      alto: 255,
      importarComponente: () =>
        import(
          '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component'
        ).then(m => m.MapNavButtonsComponent),
    },
    {
      nombreWidget: 'DescargarManual',
      ruta: '@app/widget/ayuda/components/descarga-manual/descarga-manual.component',
      titulo: 'Ayuda',
      subcategoria: WidgetSubcategoria.DESCARGAR_MANUAL,
      categoria: WidgetCategoria.APOYO_DOCUMENTACION,
      icono: 'pi pi-download',
      ancho: 300,
      alto: 350,
      importarComponente: () =>
        import(
          '@app/widget/ayuda/components/descarga-manual/descarga-manual.component'
        ).then(m => m.DescargaManualComponent),
    },
    {
      nombreWidget: 'Tabla de contenido 4',
      ruta: '@app/widget/content-table-v4/components/content-table-v4/content-table-v4.component',
      titulo: 'Tabla de Contenido 4',
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
  ],
  overlayWidgetsConfig: [
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
