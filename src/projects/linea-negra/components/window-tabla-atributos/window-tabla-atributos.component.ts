import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { WindowComponentRenderComponent } from '@app/widget-ui/components/window-component-render/window-component-render.component';
// ***** STORE ********
import { selectWidgetStatus } from '@app/core/store/user-interface/user-interface.selectors';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-window-tabla-atributos',
  standalone: true,
  imports: [WindowComponentRenderComponent],
  templateUrl: './window-tabla-atributos.component.html',
  styleUrl: './window-tabla-atributos.component.scss',
})
export class WindowTablaAtributosComponent implements AfterViewInit, OnDestroy {
  // Indica si la ventana es visible
  isVisible = false;
  // observador para destruir las suscripciones
  private destroy$ = new Subject<void>();

  constructor(private store: Store) {}

  ngAfterViewInit(): void {
    // Suscribirse al observable de la visibilidad de la ventana hasta que se destruya el componente
    this.store
      .select(selectWidgetStatus('attributeTable'))
      .pipe(takeUntil(this.destroy$))
      .subscribe(visible => {
        this.isVisible = visible !== undefined ? visible : false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
