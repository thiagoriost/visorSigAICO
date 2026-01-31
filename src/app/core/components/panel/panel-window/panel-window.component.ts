import {
  Component,
  ElementRef,
  Input,
  AfterViewInit,
  Renderer2,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemWidgetState } from '@app/core/interfaces/store/user-interface.model';
import { CardModule } from 'primeng/card';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';

/**
 *
 * @description Este componente es responsable de cargar y posicionar dinámicamente otros componentes
 * en la ventana, basándose en la configuración proporcionada a través de la propiedad
 * `widgetDefinition`.
 * @author Carlos Javier Muñoz Fernández
 * @date 05/12/2024
 * @class PanelWindowComponent
 */
@Component({
  selector: 'app-panel-window',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './panel-window.component.html',
  styleUrls: ['./panel-window.component.scss'],
})
export class PanelWindowComponent implements AfterViewInit {
  /**
   * Definición del widget que se va a cargar y posicionar.
   * Esta propiedad es requerida y debe ser proporcionada por el componente padre.
   */
  @Input({ required: true }) widgetDefinition: ItemWidgetState | undefined;

  /**
   * Contenedor donde se cargará dinámicamente el componente especificado en `widgetDefinition`.
   */
  @ViewChild('dynamicContainer', { read: ViewContainerRef })
  container!: ViewContainerRef;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private userInterfaceService: UserInterfaceService
  ) {}

  /**
   * Método de ciclo de vida de Angular que se ejecuta al inicializar el componente.
   * Si `widgetDefinition` está definido, aplica la posición y carga el widget.
   */
  ngAfterViewInit(): void {
    if (this.widgetDefinition) {
      this.crearWidget();
    }
  }

  /**
   * Carga dinámicamente el componente especificado en `widgetDefinition`.
   */
  async crearWidget() {
    if (!this.container) {
      console.warn('ViewContainerRef no está inicializado.');
      return;
    }

    if (this.widgetDefinition) {
      const component = await this.userInterfaceService.getComponente(
        this.widgetDefinition.nombreWidget
      );
      if (component) {
        console.log(
          `Cargando componente: ${this.widgetDefinition.nombreWidget}`
        );
        // Carga el componente dinámicamente
        this.container.createComponent(component);
      } else {
        console.warn(
          `No se encontró el componente: ${this.widgetDefinition.nombreWidget}`
        );
      }
    }
  }

  /**
   * Aplica la posición al componente basado en la propiedad `posicion` de `widgetDefinition`.
   * La posición debe estar en el formato "top,left" (por ejemplo, "100,200").
   */
  applyPosition() {
    if (this.widgetDefinition) {
      if (this.widgetDefinition.ancho || this.widgetDefinition.alto) {
        const top = this.widgetDefinition.alto ?? 250;
        const left = this.widgetDefinition.ancho ?? 250;
        this.renderer.setStyle(this.el.nativeElement, 'position', 'absolute');
        this.renderer.setStyle(this.el.nativeElement, 'top', `${top}px`);
        this.renderer.setStyle(this.el.nativeElement, 'left', `${left}px`);
      }
    }
  }
}
