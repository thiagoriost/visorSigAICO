import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
// ****** SERVICES ******
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';

/**
 * @description Componente para renderizar un widget
 * @author Juan Carlos Valderrama Gonzalez
 */
@Component({
  selector: 'app-widget-render',
  standalone: true,
  imports: [],
  templateUrl: './widget-render.component.html',
  styleUrl: './widget-render.component.scss',
})
export class WidgetRenderComponent implements AfterViewInit, OnChanges {
  /** Nombre unico del widget que se desea renderizar */
  @Input({ required: true }) widgetName!: string;
  /** Contenedor donde se cargará dinámicamente el componente especificado en `widgetDefinition`.*/
  @ViewChild('containerWidget', { read: ViewContainerRef })
  container!: ViewContainerRef;

  constructor(private userInterfaceService: UserInterfaceService) {}

  /**
   * @description
   * Metodo de ciclo de vida de Angular que se invoca cuando cambia el valor de una
   * propiedad de entrada de datos.
   *
   * Si el `widgetName` cambia, el contenedor se limpia y se renderiza el nuevo widget.
   *
   * @param changes - Objeto que contiene las propiedades de entrada que han cambiado.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['widgetName'] && !changes['widgetName'].firstChange) {
      this.abrirWidget(this.widgetName);
    }
  }

  /**
   * @description
   * Metodo de ciclo de vida de Angular que se ejecuta justo despues de que se haya
   * cargado el contenido del componente en el DOM.
   *
   * Si el usuario proporciona el nombre del widget a abrir a traves de la propiedad
   * `widgetName`, se llama al metodo `abrirWidget` para renderizar el widget en el
   * contenedor `container`.
   *
   * Si `widgetName` no esta definido, se lanza un error.
   */
  ngAfterViewInit(): void {
    if (!this.widgetName) {
      throw new Error('widgetName no proporcionado');
    }
    this.abrirWidget(this.widgetName);
  }

  /**
   * Abre un widget en el contenedor `container` y lo renderiza dinámicamente.
   * @param widgetName Nombre del widget a abrir.
   * @returns void
   */
  async abrirWidget(widgetName: string) {
    if (!this.container) {
      console.warn('ViewContainerRef no está inicializado.');
      return;
    }
    // Limpia el contenedor antes de renderizar un nuevo widget
    this.container.clear();

    // Cargar componente en memoria
    const widget = await this.userInterfaceService.getComponente(widgetName);
    if (widget) {
      // Carga el componente dinámicamente
      this.container.createComponent(widget);
    } else {
      console.warn(`No se encontró el componente: ${widgetName}`);
    }
  }
}
