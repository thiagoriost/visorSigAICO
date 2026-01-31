import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
// ****** COMPONENTS ******
import { MapNavButtonsComponent } from '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component';
import { Subject, takeUntil } from 'rxjs';

/**
 * @description Componente que contiene el widget de zoom y navegación del mapa para OPIAC
 * @author Juan Carlos Valderrama Gonzalez
 */
@Component({
  selector: 'app-floating-map-controls',
  standalone: true,
  imports: [MapNavButtonsComponent, CommonModule],
  templateUrl: './floating-map-controls.component.html',
  styleUrl: './floating-map-controls.component.scss',
})
export class FloatingMapControlsComponent implements OnInit {
  isSmallScreen = false; //variable para determinar si la resolucion de pantalla es de tipo movil

  // Observador para destruccion del componente
  private destroy$ = new Subject<void>();

  /**
   *Servicio que observa la resolución de pantalla de la aplicacion
   * @param breakpointObserver
   */
  constructor(private breakpointObserver: BreakpointObserver) {}

  /**
   * Inicializa el observador de resoluciones de pantalla
   * y setea cuando la resolucion de pantalla es movil
   * hasta que se destruya el componente
   */
  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isSmallScreen = state.matches;
      });
  }
}
