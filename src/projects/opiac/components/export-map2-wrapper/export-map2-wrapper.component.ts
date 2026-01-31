import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { selectOverlayWidgetStatus } from '@app/core/store/user-interface/user-interface.selectors';
import { ExportMap2Component } from '@app/widget/export-map2/components/export-map2/export-map2.component';

/**
 * @description Componente contenedor que renderiza el widget 'ExportarMapa2'
 * de forma condicional basado en su estado de visibilidad en el store de NgRx.
 * Se suscribe al estado de los widgets superpuestos (overlay) y muestra
 * el componente de exportación solo cuando se activa.
 * @author Juan Carlos Valderrama Gonzalez
 * @date 23/07/2024
 */
@Component({
  selector: 'app-export-map2-wrapper',
  standalone: true,
  imports: [CommonModule, ExportMap2Component],
  templateUrl: './export-map2-wrapper.component.html',
  styleUrls: ['./export-map2-wrapper.component.scss'],
})
export class ExportMap2WrapperComponent implements OnInit, OnDestroy {
  isExportMapVisible = false;
  isDialogVisible = false;

  private destroy$ = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store
      .select(selectOverlayWidgetStatus('ExportarMapa2'))
      .pipe(takeUntil(this.destroy$))
      .subscribe((isVisible: boolean | undefined) => {
        this.isExportMapVisible = !!isVisible;
        if (this.isExportMapVisible) {
          this.isDialogVisible = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
