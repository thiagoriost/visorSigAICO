import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
// ***** PRIMENG ***** */
import { DividerModule } from 'primeng/divider';
import { Subject, takeUntil } from 'rxjs';

/**
 * @description Header de layout OPIAC - Contiene logos y comportamiento responsivo
 * @author Juan Carlos Valderrama González
 */
@Component({
  selector: 'app-opiac-header',
  standalone: true,
  imports: [DividerModule],
  templateUrl: './opiac-header.component.html',
  styleUrl: './opiac-header.component.scss',
})
export class OpiacHeaderComponent implements OnInit, OnDestroy {
  // Indicador de resolucion de pantalla
  isMobile = false;
  // Subject para indicar hasta cuando se ejecutan los observables
  private destroy$ = new Subject<void>();

  constructor(private breakpointObserver: BreakpointObserver) {}

  /**
   * Suscribe al observador de resoluciones de pantalla para detectar si
   * la pantalla es movil  y guarda el resultado
   * en la variable `isMobile`.
   */
  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  /**
   * ngOnDestroy - Limpia las suscripciones al observador de pantalla
   * cuando el componente es destruido.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
