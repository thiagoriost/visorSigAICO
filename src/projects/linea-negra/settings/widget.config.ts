import { WidgetCategoria } from '@app/core/interfaces/enums/WidgetCategoria.enum';
import { WidgetSubcategoria } from '@app/core/interfaces/enums/WidgetSubcategoria.enum';
import { IWidgetConfig } from '@app/core/config/interfaces/IWidgetConfig';

export const LINEA_NEGRA_WIDGET_CONFIG: IWidgetConfig = {
  widgetsConfig: [
    {
      nombreWidget: 'BaseMap',
      ruta: '@projects/linea-negra/components/mapa-base-linea-negra/mapa-base-linea-negra.component',
      titulo: 'Mapa base',
      subcategoria: WidgetSubcategoria.MAPA_BASE,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      icono: 'pi pi-map',
      ancho: 300,
      alto: 400,
      importarComponente: () =>
        import(
          '@projects/linea-negra/components/mapa-base-linea-negra/mapa-base-linea-negra.component'
        ).then(m => m.MapaBaseLineaNegraComponent),
    },
    {
      nombreWidget: 'ContentTable',
      ruta: '@app/widget/content-table-one-and-work-area/content-table-one-and-work-area.component',
      titulo: 'Tabla de contenido',
      subcategoria: WidgetSubcategoria.TABLA_CONTENIDO,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      icono: 'pi pi-list',
      ancho: 300,
      alto: 400,
      importarComponente: () =>
        import(
          '@app/widget/content-table-one-and-work-area/content-table-one-and-work-area.component'
        ).then(m => m.ContentTableOneAndWorkAreaComponent),
    },
    {
      nombreWidget: 'Leyenda',
      ruta: '@app/widget/leyenda/components/leyenda/leyenda.component',
      titulo: 'Leyenda',
      subcategoria: WidgetSubcategoria.LEYENDA,
      categoria: WidgetCategoria.ESTRUCTURA_VISOR,
      icono: 'pi pi-bookmark',
      ancho: 300,
      alto: 400,
      importarComponente: () =>
        import('@app/widget/leyenda/components/leyenda/leyenda.component').then(
          m => m.LeyendaComponent
        ),
    },
    {
      nombreWidget: 'Identify',
      ruta: '@projects/linea-negra/components/identify-version-two/identify-version-two.component',
      titulo: 'Identificar',
      subcategoria: WidgetSubcategoria.IDENTIFICAR,
      categoria: WidgetCategoria.CONSULTA_ANALISIS,
      altoMaximo: 300,
      anchoMaximo: 400,
      icono: 'pi pi-search',
      ancho: 350,
      alto: 400,
      importarComponente: () =>
        import(
          '@projects/linea-negra/components/identify-version-two/identify-version-two.component'
        ).then(m => m.IdentifyVersionTwoComponent),
    },
    {
      nombreWidget: 'addData',
      ruta: '../components/add-data/add-data.component',
      titulo: 'Añadir datos',
      subcategoria: WidgetSubcategoria.ADICIONAR_WMS,
      categoria: WidgetCategoria.GESTION_DATOS,
      icono: 'pi pi-table',
      ancho: 300,
      alto: 400,
      importarComponente: () =>
        import('../components/add-data/add-data.component').then(
          m => m.AddDataComponent
        ),
    },
    {
      nombreWidget: 'Dibujar',
      ruta: '@app/widget/dibujar/components/btn-dibujo/btn-dibujo.component',
      titulo: 'Dibujar',
      subcategoria: WidgetSubcategoria.DIBUJAR,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      icono: 'pi pi-pencil',
      ancho: 300,
      alto: 600,
      importarComponente: () =>
        import(
          '@app/widget/dibujar/components/btn-dibujo/btn-dibujo.component'
        ).then(m => m.BtnDibujoComponent),
    },
    {
      nombreWidget: 'medir',
      ruta: '@app/widget/medicion/components/medicion-ppal/medicion-ppal.component',
      titulo: 'Medir',
      subcategoria: WidgetSubcategoria.MEDICION,
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      icono: 'pi pi-sliders-h',
      ancho: 300,
      alto: 400,
      importarComponente: () =>
        import(
          '@app/widget/medicion/components/medicion-ppal/medicion-ppal.component'
        ).then(m => m.MedicionPpalComponent),
    },
    {
      nombreWidget: 'ConsultaSimple',
      ruta: '@app/widget/consulta-simple/components/consultaSimple/consulta-simple.component',
      ancho: 300,
      alto: 400,
      titulo: 'Consulta simple',
      subcategoria: WidgetSubcategoria.CONSULTA_SIMPLE,
      categoria: WidgetCategoria.CONSULTA_ANALISIS,
      icono: 'pi pi-filter',
      importarComponente: () =>
        import(
          '@app/widget/consultaSimple/components/consulta-simple/consulta-simple.component'
        ).then(m => m.ConsultaSimpleComponent),
    },
    {
      nombreWidget: 'ubicarCoordenada',
      ruta: '@app/widget/ubicar-mediante-coordenadas/componentes/ubicar-mediante-coordenadas/ubicar-mediante-coordenadas.component',
      titulo: 'Ubicar mediante coordenadas',
      subcategoria: WidgetSubcategoria.UBICAR_COORDENADAS,
      categoria: WidgetCategoria.NAVEGACION_LOCALIZACION,
      icono: 'pi pi-compass',
      ancho: 500,
      alto: 600,
      importarComponente: () =>
        import(
          '@app/widget/ubicar-mediante-coordenadas/componentes/ubicar-mediante-coordenadas/ubicar-mediante-coordenadas.component'
        ).then(m => m.UbicarMedianteCoordenadasComponent),
    },
    {
      nombreWidget: 'seleccionEspacial',
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
      nombreWidget: 'attributeTable',
      ruta: '@app/widget/attributeTable/components/attribute-table/attribute-table.component',
      titulo: 'Tabla de atributos',
      subcategoria: WidgetSubcategoria.TABLA_ATRIBUTOS,
      categoria: WidgetCategoria.GESTION_DATOS,
      icono: 'pi pi-table',
      ancho: 500,
      alto: 350,
      posicionX: 200,
      posicionY: 100,
      importarComponente: () =>
        import(
          '@app/widget/attributeTable/components/attribute-table/attribute-table.component'
        ).then(m => m.AttributeTableComponent),
    },
    {
      nombreWidget: 'salidaGrafica',
      ruta: '@app/widget/export-map6/components/export-map6/export-map6.component',
      titulo: 'Salida gráfica',
      ancho: 600,
      alto: 600,
      importarComponente: () =>
        import(
          '@app/widget/export-map6/components/export-map6/export-map6.component'
        ).then(m => m.ExportMap6Component),
    },
    {
      nombreWidget: 'ayuda',
      ruta: '@projects/linea-negra/components/ayuda-linea-negra/ayuda-linea-negra.component',
      titulo: 'Ayuda del visor',
      ancho: 600,
      alto: 600,
      importarComponente: () =>
        import(
          '@projects/linea-negra/components/ayuda-linea-negra/ayuda-linea-negra.component'
        ).then(m => m.AyudaLineaNegraComponent),
    },
  ],
  overlayWidgetsConfig: [],
};
