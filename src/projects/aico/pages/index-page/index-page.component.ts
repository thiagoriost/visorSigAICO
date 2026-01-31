import { Component, inject, Type, OnDestroy, OnInit } from '@angular/core';

import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { MapState } from '@app/core/interfaces/store/map.model';
import { selectWidgetStatus } from '@app/core/store/user-interface/user-interface.selectors';

import { BarraEscalaComponent } from '@app/widget/barraEscala/components/barra-escala/barra-escala.component';

import { WidgetManagerService } from '../../services/widget-manager/widget-manager.service';
import { DeviceService } from '../../services/device/device.service';

import { LayoutDComponent } from '@app/widget-ui/layouts/layout-d/layout-d.component';

import { MapComponent } from '@app/core/components/map/map.component';

import { ViewCoordsComponent } from '@app/widget/viewCoords/components/view-coords/view-coords.component';

import { GeoJSONData } from '@app/widget/attributeTable/interfaces/geojsonInterface';
import {
  CurrentWidget,
  GeoFunction,
  SubOpcionesInterface,
} from '@projects/aico/interfaces/interfaces';
import { SharedModalService } from '@projects/aico/services/SharedModal/SharedModal.service';

// Importar explícitamente todos los componentes de widget

/**
 * Componente principal de la página de índice del proyecto AICO.
 *
 * Este componente actúa como el contenedor principal de la aplicación, gestionando:
 * - La visualización del mapa y sus controles flotantes
 * - La gestión dinámica de widgets a través del WidgetManagerService
 * - La visualización de la tabla de atributos
 * - La configuración de opciones y funcionalidades geográficas
 * - La adaptación de la interfaz para dispositivos móviles
 *
 * Proporciona una interfaz completa para interactuar con herramientas de aplicación,
 * consultas espaciales, y funcionalidades específicas del Sistema de Información Geográfico AICO.
 *
 * @author IGAC - Instituto Geográfico Agustín Codazzi
 * @version 1.0.0
 * @since 2025
 */
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MapComponent,

    BarraEscalaComponent,
    LayoutDComponent,
    ViewCoordsComponent,
  ],
  templateUrl: './index-page.component.html',
  styleUrls: ['./index-page.component.scss'],
})
export class indexPageComponent implements OnInit, OnDestroy {
  /**
   * Observable que indica si el dispositivo es móvil.
   * Se utiliza para adaptar la interfaz según el tipo de dispositivo.
   */
  isMobile$: Observable<boolean>;

  /**
   * Servicio inyectado para gestionar el estado y ciclo de vida de los widgets.
   */
  private widgetManager = inject(WidgetManagerService);

  /**
   * Mapeo de nombres de widgets a sus componentes correspondientes.
   * Define la relación entre los identificadores de widgets y sus implementaciones.
   */
  readonly WIDGET_MAPPING: Record<string, Type<unknown>> = {};

  /**
   * Array con los nombres de todos los widgets disponibles.
   * Se genera automáticamente a partir de las claves del WIDGET_MAPPING.
   */
  widgetNames = Object.keys(this.WIDGET_MAPPING);

  /**
   * Configuración de todas las opciones y funcionalidades geográficas disponibles.
   * Estructura las funciones principales y sus sub-opciones con sus respectivos
   * iconos, labels y componentes asociados.
   */
  readonly opciones: GeoFunction[] = [
    this.createMainOption('Ayuda', 'AyudaN1', [
      this.createSubOption(
        false,
        'ManualUsuario',
        'documentosInd',
        'Manual de usuario'
      ),
      this.createSubOption(
        false,
        'EnviarCorreoAdministrador',
        'correoInd',
        'Enviar Correo Administrador'
      ),
    ]),
    this.createMainOption('Herramientas de aplicación', 'SwipeIcnAnt', [
      this.createSubOption(true, 'Medir', 'medirInd', 'Medir'),
      this.createSubOption(
        true,
        'BuscarDirecciones',
        'consultaInd',
        'BuscarDirecciones'
      ),
      this.createSubOption(
        true,
        'UbicarMedianteCoordenadas',
        'ubicarCoordenadasInd',
        'Ubicar mediante coordenadas'
      ),
      this.createSubOption(true, 'Dibujar', 'dibujarInd', 'Dibujar'),
      this.createSubOption(
        false,
        'AdicionarWMS',
        'AdicionarWMS',
        'Adicionar WMS'
      ),
      this.createSubOption(
        false,
        'SalidaGrafica',
        'salidaGraficaInd',
        'Salida gráfica'
      ),
      this.createSubOption(
        false,
        'AdicionarInformacion',
        'adicionarInfoInd',
        'Adicionar información'
      ),
      this.createSubOption(
        false,
        'EstablecerRuta',
        'establecer_ruta',
        'Establecer ruta'
      ),
      this.createSubOption(
        false,
        'CambiarMapaBase',
        'cambiarMapaBaseInd',
        'Cambiar mapa base'
      ),
      this.createSubOption(false, 'Swipe', 'SwipeIcn_over', 'Swipe'),

      this.createSubOption(
        false,
        'RepositorioDocumental',
        'Repositorio_documental_icon',
        'Repositorio documental'
      ),
    ]),
    this.createMainOption('Consultas', 'consultaInd', [
      this.createSubOption(
        true,
        'SeleccionEspacial',
        'seleccionEspacialInd',
        'Selección Espacial'
      ),
      this.createSubOption(true, 'Identificar', 'identificarI', 'Identificar'),
      this.createSubOption(
        true,
        'ConsultaSimple',
        'consultaSimpleInd',
        'Consulta simple'
      ),
      this.createSubOption(
        false,
        'ConsultaAvanzada',
        'consultaAvanzadaInd',
        'Consulta avanzada'
      ),
      this.createSubOption(
        false,
        'ConsultaInterseccion',
        'icon_Consulta_Interseccion',
        'Consulta Intersección'
      ),
      this.createSubOption(
        false,
        'AreaInfluenciaBuffer',
        'areaInfluenciaInd',
        'Área de influencia (Buffer)'
      ),

      this.createSubOption(
        true,
        'ConsultaCatastral',
        'consultaSimpleInd',
        'Consulta catastral'
      ),

      this.createSubOption(
        false,
        'MapasTematicos',
        'mapaTematicoInd_over',
        'Mapas temáticos'
      ),
    ]),
    this.createSubOption(true, 'Indicadores', 'indicadores1', 'Indicadores'),
  ];

  /**
   * Datos GeoJSON para mostrar en la tabla de datos.
   * Puede ser null cuando no hay datos para mostrar.
   */
  tableData: GeoJSONData | null = null;

  /**
   * Controla la visibilidad de la tabla de datos.
   */
  showDataTable = false;

  /**
   * Estado de apertura del modal.
   */
  modalIsOpen = false;

  /**
   * Subject para gestionar la destrucción de suscripciones.
   * Evita fugas de memoria al destruir el componente.
   */
  private destroy$ = new Subject<void>();

  /**
   * Identifica si existen datos en el storage correspondientes con la tabla de atributos.
   * Controla la visibilidad de la tabla de atributos en la interfaz.
   */
  showAttributeTable = false;

  /**
   * URL personalizada del manual de usuario.
   * Ruta del archivo PDF del manual de usuario del sistema AICO.
   */
  manualUsuarioUrl?: string =
    'projects/aico/assets/pdfs/SIG_AICO_2025_MUP_V.1.1_12112025.pdf';

  /**
   * Nombre personalizado del archivo del manual de usuario.
   * Se muestra en la interfaz como título del manual.
   */
  manualUsuarioNombre?: string = 'Manual Usuario AICO';

  /**
   * URL del logo para el componente de exportación de mapas.
   * Se utiliza para agregar branding a los mapas exportados.
   */
  readonly logoUrlExportMap = 'projects/aico/assets/images/bannerIndigena.png';

  /**
   * Suscripción al estado del widget de tabla de atributos.
   * Se gestiona manualmente para garantizar su correcta limpieza.
   */
  private subscription!: Subscription;

  /**
   * Constructor del componente IndexPage.
   *
   * Inicializa los servicios necesarios y configura las suscripciones al estado del modal.
   * Determina si el dispositivo es móvil e inicializa los widgets disponibles.
   *
   * @param deviceService - Servicio para detectar el tipo de dispositivo
   * @param modalService - Servicio compartido para gestión de modales
   * @param store - Store de NgRx para gestión del estado de la aplicación
   */
  constructor(
    private deviceService: DeviceService,
    public modalService: SharedModalService,
    private store: Store<MapState>
  ) {
    this.isMobile$ = this.deviceService.isMobile$;
    this.initializeWidgets();

    this.modalService.modalState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.modalIsOpen = state.isOpen;
        this.tableData = state.data;
      });
  }

  /**
   * Hook de ciclo de vida que se ejecuta al inicializar el componente.
   *
   * Realiza la suscripción al Store de NgRx, escuchando cambios en la propiedad
   * visible de la tabla de atributos. La suscripción se guarda en una variable
   * para garantizar su correcta cancelación en ngOnDestroy y así prevenir fugas de memoria.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.subscription = this.store
      .select(selectWidgetStatus('attributeTable'))
      .pipe(takeUntil(this.destroy$))
      .subscribe(visible => {
        this.showAttributeTable = visible !== undefined ? visible : false;
        if (!this.showAttributeTable) {
          this.modalIsOpen = this.showAttributeTable;
        }
      });
  }

  /**
   * Widget actualmente activo/seleccionado.
   * Contiene la configuración del widget que se está mostrando.
   */
  currentWidget: CurrentWidget = {
    renderizado: false,
    name: '',
    position: { x: 100, y: 100 },
    title: '',
    size: { w: 350, h: 250 },
    // widget: WidgetYoutubeComponent,
  };

  /**
   * Configuración inicial de todos los widgets disponibles en la aplicación.
   * Define la posición, tamaño, título y estado de renderizado de cada widget.
   * Se utiliza como fuente de verdad para la gestión de widgets.
   */
  initWidget = [
    {
      renderizado: false,
      name: 'Medir',
      position: { x: 40, y: 30 },
      size: { w: 250, h: 300 },
      title: 'Medir',
      // widget: MedicionPpalComponent,
    },
    {
      renderizado: false,
      name: 'BuscarDirecciones',
      position: { x: 60, y: 30 },
      size: { w: 250, h: 120 },
      title: 'Buscar direcciones',
      // widget: MedicionPpalComponent,
    },
    {
      renderizado: false,
      name: 'UbicarMedianteCoordenadas',
      position: { x: 18, y: 10 },
      size: { w: 450, h: 550 },
      title: 'Ubicar mediante coordenadas',
      // widget: UbicarMedianteCoordenadasComponent,
    },
    {
      renderizado: false,
      name: 'Dibujar',
      position: { x: 26, y: 10 },
      size: { w: 350, h: 650 },
      title: 'Dibujar',
      // widget: BtnDibujoComponent,
    },
    {
      renderizado: false,
      name: 'AdicionarWMS',
      position: { x: 34, y: 10 },
      size: { w: 350, h: 490 },
      title: 'Adicionar WMS',
    },
    {
      renderizado: false,
      name: 'SalidaGrafica',
      position: { x: 10, y: 26 },
      size: { w: 350, h: 550 },
      title: 'Salida gráfica',
    },
    {
      renderizado: false,
      name: 'AdicionarInformacion',
      position: { x: 10, y: 20 },
      size: { w: 350, h: 380 },
      title: 'Adicionar información',
    },
    {
      renderizado: false,
      name: 'EstablecerRuta',
      position: { x: 60, y: 20 },
      size: { w: 460, h: 270 },
      title: 'Establecer ruta',
    },
    {
      renderizado: false,
      name: 'CambiarMapaBase',
      position: { x: 30, y: 20 },
      size: { w: 350, h: 450 },
      title: 'Cambiar mapa base',
      // widget: BaseMapComponent,
    },

    {
      renderizado: false,
      name: 'Swipe',
      position: { x: 40, y: 60 },
      size: { w: 350, h: 250 },
      title: 'Swipe',
      // widget: SwipeComponent,
    },
    {
      renderizado: false,
      name: 'ManualUsuario',
      position: { x: 0, y: 0 },
      size: { w: 200, h: 200 },
      title: 'Manual de usuario',
      // widget: SwipeComponent,
    },
    {
      renderizado: false,
      name: 'RepositorioDocumental',
      position: { x: 40, y: 20 },
      size: { w: 550, h: 420 },
      title: 'Repositorio Documental',
      // widget: SwipeComponent,
    },
    {
      renderizado: false,
      name: 'SeleccionEspacial',
      position: { x: 40, y: 60 },
      size: { w: 350, h: 350 },
      title: 'Selección Espacial',
      // widget: HomeSeleccionEspacialComponent,
    },

    {
      renderizado: false,
      name: 'Identificar',
      position: { x: 40, y: 40 },
      size: { w: 400, h: 600 },
      title: 'Identificar',
      // widget: IdentifyComponent,
    },
    {
      renderizado: false,
      name: 'ConsultaSimple',
      position: { x: 0, y: 0 },
      size: { w: 430, h: 593 },
      title: 'Consulta simple',
      // widget: ConsultaSimpleComponent,
      // widget: ConsultaSimpleComponent,
    },
    {
      renderizado: false,
      name: 'ConsultaAvanzada',
      position: { x: 10, y: 10 },
      size: { w: 350, h: 600 },
      title: 'Consulta avanzada',
      // widget: ConsultaAvanzadaComponent,
    },
    {
      renderizado: false,
      name: 'ConsultaInterseccion',
      position: { x: 40, y: 50 },
      size: { w: 350, h: 650 },
      title: 'Consulta Intersección',
      // widget: InterseccionComponent,
    },
    {
      renderizado: false,
      name: 'AreaInfluenciaBuffer',
      position: { x: 40, y: 40 },
      size: { w: 470, h: 650 },
      title: 'Área de influencia (Buffer)',
    },
    {
      renderizado: false,
      name: 'LimpiarSeleccionEspacial',
      position: { x: 44, y: 6 },
      size: { w: 350, h: 250 },
      title: 'Limpiar selección espacial',
      // widget: HomeSeleccionEspacialComponent,
    },
    {
      renderizado: false,
      name: 'BuscarPorPalabraClave',
      position: { x: 40, y: 40 },
      size: { w: 350, h: 250 },
      title: 'Buscar por palabra clave',
    },
    {
      renderizado: false,
      name: 'ConsultaCatastral',
      position: { x: 40, y: 40 },
      size: { w: 400, h: 400 },
      title: 'Consulta catastral',
    },
    {
      renderizado: false,
      name: 'MapasTematicos',
      position: { x: 40, y: 0 },
      size: { w: 400, h: 680 },
      title: 'Mapas temáticos',
    },
    {
      renderizado: false,
      name: 'CatastralPorUbicacion',
      position: { x: 40, y: 40 },
      size: { w: 350, h: 250 },
      title: 'Catastral por ubicación',
    },
    {
      renderizado: false,
      name: 'NuevaSolicitud',
      position: { x: 10, y: 20 },
      size: { w: 350, h: 250 },
      title: 'Nueva solicitud',
    },
    {
      renderizado: false,
      name: 'BuscarEstadoDeSolicitud',
      position: { x: 26, y: 10 },
      size: { w: 350, h: 250 },
      title: 'Buscar estado de solicitud',
    },
    {
      renderizado: false,
      name: 'GenerarCroquis',
      position: { x: 34, y: 22 },
      size: { w: 350, h: 250 },
      title: 'Generar croquis',
    },
    {
      renderizado: false,
      name: 'MapasDeConsulta',
      position: { x: 34, y: 22 },
      size: { w: 350, h: 250 },
      title: 'Mapas de consulta',
    },
    {
      renderizado: false,
      name: 'Indicadores',
      position: { x: 34, y: 22 },
      size: { w: 400, h: 550 },
      title: 'Indicadores',
    },
    {
      renderizado: false,
      name: 'ManualDeUsuario',
      position: { x: 34, y: 22 },
      size: { w: 350, h: 250 },
      title: 'Manual de Usuario',
    },
    {
      renderizado: false,
      name: 'EnviarCorreoAdministrador',
      position: { x: 34, y: 22 },
      size: { w: 380, h: 570 },
      title: 'Enviar Correo Administrador',
    },
  ];

  /**
   * Inicializa todos los widgets con su configuración predeterminada.
   *
   * Llama al servicio WidgetManagerService para registrar todos los widgets
   * definidos en initWidget.
   *
   * @private
   * @returns {void}
   */
  private initializeWidgets(): void {
    this.widgetManager.initializeWidgets(this.initWidget);
  }

  /**
   * Crea una opción principal del menú de funciones geográficas.
   *
   * @private
   * @param label - Etiqueta descriptiva de la opción
   * @param iconName - Nombre del icono a mostrar
   * @param subOpciones - Array de sub-opciones asociadas a esta opción principal
   * @param funcionAejecutar - Función opcional a ejecutar al seleccionar la opción
   * @returns {GeoFunction} Objeto con la configuración de la opción principal
   */
  private createMainOption(
    label: string,
    iconName: string,
    subOpciones: SubOpcionesInterface[],
    funcionAejecutar?: (e: string) => void
  ): GeoFunction {
    return {
      renderOnMovil: true,
      iconName,
      label,
      showWidget: false,
      subOpciones,
      funcionAejecutar,
    };
  }

  /**
   * Crea una sub-opción para el menú de funciones geográficas.
   *
   * @private
   * @param renderOnMovil - Indica si se debe renderizar en dispositivos móviles
   * @param name - Nombre único del widget asociado
   * @param iconName - Nombre del icono a mostrar
   * @param label - Etiqueta descriptiva de la sub-opción
   * @returns {SubOpcionesInterface} Objeto con la configuración de la sub-opción
   */
  private createSubOption(
    renderOnMovil: boolean,
    name: string,
    iconName: string,
    label: string
  ): SubOpcionesInterface {
    return {
      renderOnMovil,
      iconName,
      label,
      showWidget: false,
      funcionAejecutar: () => {
        return this.toggleWidget(name);
      },
      widget: {
        component: this.WIDGET_MAPPING[name],
        data: [],
        title: label,
        position: this.widgetManager.getWidgetPosition(name),
      },
    };
  }

  /**
   * Alterna la visibilidad de un widget específico.
   *
   * Busca el widget en la configuración inicial y cambia su estado de renderizado.
   * Actualiza el currentWidget con la configuración del widget encontrado.
   *
   * @param widgetName - Nombre del widget a alternar
   * @returns {void}
   */
  toggleWidget(widgetName: string): void {
    const foundWidget = this.initWidget.find(e => e.name == widgetName);
    if (foundWidget) {
      foundWidget.renderizado = !foundWidget.renderizado;
      this.currentWidget = foundWidget as CurrentWidget;
    } else {
      this.currentWidget = {
        renderizado: false,
        name: '',
        position: { x: 100, y: 100 },
        size: { w: 350, h: 250 },
        title: '',
      };
    }
  }

  /**
   * Verifica si un widget específico está visible.
   *
   * @param widgetName - Nombre del widget a verificar
   * @returns {boolean} True si el widget está visible, false en caso contrario
   */
  isWidgetVisible(widgetName: string): boolean {
    return this.widgetManager.isWidgetVisible(widgetName);
  }

  /**
   * Posición por defecto para widgets cuando no se encuentra su configuración.
   */
  private readonly DEFAULT_POSITION = { x: 100, y: 100 };

  /**
   * Obtiene la posición de un widget específico.
   *
   * Busca la configuración del widget en initWidget y retorna su posición.
   * Si no se encuentra, retorna la posición por defecto.
   *
   * @param widgetName - Nombre del widget
   * @returns {{ x: number; y: number }} Objeto con las coordenadas x, y del widget
   */
  getWidgetPosition(widgetName: string): { x: number; y: number } {
    // Verificar si initWidget está definido
    if (!this.initWidget) {
      console.warn(
        'initWidget no está inicializado, usando posición por defecto'
      );
      return this.DEFAULT_POSITION;
    }

    // Buscar el widget
    const widgetConfig = this.initWidget.find(e => e.name === widgetName);

    // Verificar si se encontró el widget
    if (!widgetConfig) {
      console.warn(`Configuración para widget ${widgetName} no encontrada`);
      return this.DEFAULT_POSITION;
    }

    ////console.log(widgetConfig.position, widgetConfig);
    return widgetConfig.position;
  }

  /**
   * Obtiene el título de un widget específico.
   *
   * Delega la búsqueda al WidgetManagerService.
   *
   * @param widgetName - Nombre del widget
   * @returns {string} Título del widget
   */
  getWidgetTitle(widgetName: string): string {
    return this.widgetManager.getWidgetTitle(widgetName);
  }

  /**
   * Maneja la ejecución de funciones específicas.
   *
   * @param funcName - Nombre de la función a ejecutar
   * @returns {void}
   */
  handleFunction(funcName: string): void {
    // Lógica para manejar la función seleccionada
    console.log({ funcName });
  }

  /**
   * Obtiene los inputs específicos para cada widget.
   *
   * Proporciona configuraciones personalizadas según el tipo de widget,
   * como URLs de manuales, logos, etc.
   *
   * @param widgetName - Nombre del widget
   * @returns {Record<string, unknown>} Objeto con los inputs/configuraciones para el widget
   */
  getWidgetInputs(widgetName: string): Record<string, unknown> {
    switch (widgetName) {
      case 'ManualUsuario':
        return {
          urlManual: this.manualUsuarioUrl,
          nombreManual: this.manualUsuarioNombre,
        };
      case 'SalidaGrafica':
        return {
          logoUrl: this.logoUrlExportMap,
        };
      // Aquí se pueden agregar más cases para otros widgets que necesiten inputs
      default:
        return {};
    }
  }

  /**
   * Cierra la tabla de datos y limpia los datos asociados.
   *
   * @returns {void}
   */
  closeDataTable() {
    this.showDataTable = false;
    this.tableData = null;
  }

  /**
   * Hook de ciclo de vida que se ejecuta al destruir el componente.
   *
   * Completa el Subject destroy$ para cancelar todas las suscripciones activas
   * y prevenir fugas de memoria.
   *
   * @returns {void}
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
