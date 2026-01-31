import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ItemWidgetState } from '@app/core/interfaces/store/user-interface.model';
// ****** COMPONENTES ******
import { WidgetRenderComponent } from '@app/widget-ui/components/widget-render/widget-render.component';
import { FloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/floating-window/floating-window.component';
import { FloatingWindowConfig } from '../floating-window/interfaces/floating-window-config';
// ***** STORE ********
import {
  selectInitialFloatingWindowConfig,
  selectWidgetConfig,
} from '@app/core/store/user-interface/user-interface.selectors';
import { Store } from '@ngrx/store';
import { forkJoin, take } from 'rxjs';

/**
 * @description renderiza un componente dentro de una ventana flotante
 * @author Juan Carlos Valderrama Gonzalez
 */
@Component({
  selector: 'app-window-component-render',
  standalone: true,
  imports: [WidgetRenderComponent, FloatingWindowComponent],
  templateUrl: './window-component-render.component.html',
  styleUrl: './window-component-render.component.scss',
})
export class WindowComponentRenderComponent implements AfterViewInit {
  // TODO: Adicionar un prop de entrada que indique si se centra la ventana y desarrollar un metodo que haga el calculo respecto al nodo con id main-content
  // Nombre unico del widget que se desea renderizar
  @Input({ required: true }) widgetName!: string;
  // Evento para informar que se ha cerrado la ventana
  @Output() windowClosed = new EventEmitter<void>();
  // Configuracion inicial de la ventana
  initialFloatingWindowConfig: FloatingWindowConfig | undefined;
  // Configuracion la ventana para el widget
  widgetFloatingWindowConfig: FloatingWindowConfig | undefined;
  // Configuración del widget cargado
  widgetConfig: ItemWidgetState | undefined = undefined;

  constructor(
    private store: Store,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * ngAfterViewInit
   *
   * Metodo de ciclo de vida de Angular que se ejecuta justo despues de que se haya
   * cargado el contenido del componente en el DOM.
   *
   * Verifica que el widgetName haya sido proporcionado, de lo contrario lanza un error.
   * Luego, obtiene la configuración inicial de la ventana y la configuración del widget
   * a través de selectores de NgRx Store y los suscribe. Cuando ambos estén definidos,
   * llama al método `buildWindowConfig` para construir la configuración de la ventana.
   */
  ngAfterViewInit(): void {
    // Verificar que el widgetName haya sido proporcionado
    if (!this.widgetName) {
      throw new Error('widgetName no proporcionado');
    }

    // Obtener la configuración inicial de la ventana y la configuración del widget
    forkJoin({
      initialConfig: this.store
        .select(selectInitialFloatingWindowConfig)
        .pipe(take(1)),
      widgetConfig: this.store
        .select(selectWidgetConfig(this.widgetName))
        .pipe(take(1)),
    }).subscribe(({ initialConfig, widgetConfig }) => {
      this.initialFloatingWindowConfig = initialConfig;
      this.widgetConfig = widgetConfig;

      if (this.initialFloatingWindowConfig && this.widgetConfig) {
        this.buildWindowConfig();
        this.cdRef.detectChanges();
      }
    });
    this.checkIfWidgetWasLoaded();
  }

  /**
   * @description Devuelve el título del widget o '...' si no esta definido
   * @returns {string} El título del widget o '...' si no esta definido
   */
  get tituloWidget() {
    return this.widgetConfig?.titulo || '...';
  }

  /**
   * @description Combina configuración inicial y configuración del widget   *
   */
  buildWindowConfig() {
    if (!this.initialFloatingWindowConfig || !this.widgetConfig) return;
    this.widgetFloatingWindowConfig = {
      ...this.initialFloatingWindowConfig, // Copia todas las propiedades iniciales
      width: this.widgetConfig.ancho ?? this.initialFloatingWindowConfig.width,
      height: this.widgetConfig.alto ?? this.initialFloatingWindowConfig.height,
      maxWidth:
        this.widgetConfig.anchoMaximo ??
        this.initialFloatingWindowConfig.maxWidth,
      maxHeight:
        this.widgetConfig.altoMaximo ??
        this.initialFloatingWindowConfig.maxHeight,
    };
  }

  /**
   * @description Handles the close event by clearing the floating window configuration.
   */
  onClose() {
    this.widgetFloatingWindowConfig = undefined;
    this.windowClosed.emit();
  }

  /**
   * @description Verifica si pasado un 3s  la información fue cargada .Si no hay informacion se lanza un error
   */
  checkIfWidgetWasLoaded() {
    setTimeout(() => {
      if (!this.widgetConfig) {
        throw new Error('widget no encontrado en configuracion general');
      } else {
        console.info('widget ' + this.widgetName + ' cargado');
      }
    }, 3000);
  }
}
