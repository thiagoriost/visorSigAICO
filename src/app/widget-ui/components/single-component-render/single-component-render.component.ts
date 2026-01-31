import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { selectWidgetOpenedSingleRender } from '@app/core/store/user-interface/user-interface.selectors';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

/**
 * @description Renderiza dinamicamente cualquier componente, solo hay uno a la vez, si exite un compoente cargado, destruye el componente actual y renderiza el nuevo
 * @author
 *
 **/

@Component({
  selector: 'app-single-component-render',
  standalone: true,
  imports: [],
  templateUrl: './single-component-render.component.html',
  styleUrl: './single-component-render.component.scss',
})
export class SingleComponentRenderComponent
  implements AfterViewInit, OnDestroy
{
  // Subject para manejar la destrucción del componente
  private destroy$ = new Subject<void>();

  widgetActual: string | undefined;

  /**
   * Contenedor donde se cargará dinámicamente el componente especificado en `widgetDefinition`.
   */
  @ViewChild('containerWidget', { read: ViewContainerRef })
  container!: ViewContainerRef;

  constructor(
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>,
    private userInterfaceService: UserInterfaceService
  ) {}

  ngAfterViewInit(): void {
    this.userInterfaceStore
      .select(selectWidgetOpenedSingleRender)
      .pipe(takeUntil(this.destroy$))
      .subscribe(currentWidgetName => {
        // Verificar si actualmente hay un widget cargado
        if (this.widgetActual) {
          // Si hay un widget cargado, destruirlo o realizar la lógica necesaria
          this.container.clear();
        }
        this.widgetActual = currentWidgetName;
        // Abrir el nuevo widget
        if (currentWidgetName) {
          this.abrirWidget(currentWidgetName);
        }
      });
  }

  ngOnDestroy(): void {
    // Emitir valor para completar las suscripciones
    this.destroy$.next();
    // Completar el subject
    this.destroy$.complete();
  }

  async abrirWidget(widgetName: string) {
    if (!this.container) {
      console.warn('ViewContainerRef no está inicializado.');
      return;
    }
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
