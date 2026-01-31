import { Component, OnDestroy, OnInit } from '@angular/core';
import { ResultComponent } from '@app/widget/identify/components/result/result.component';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { Subject, takeUntil } from 'rxjs';
import * as mapsSelectors from '@app/core/store/map/map.selectors';
import { GeometryIdentified } from '../../interfaces/GeometryIdentified';
import { DividerModule } from 'primeng/divider';

/**
 * Componente encargado de obtener la geometria identificada del store y
 * mostrar el componente a través de un widget
 * @date 19-05-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-show-result',
  standalone: true,
  imports: [ResultComponent, DividerModule],
  templateUrl: './show-result.component.html',
  styleUrl: './show-result.component.scss',
})
export class ShowResultComponent implements OnInit, OnDestroy {
  result: GeometryIdentified | undefined = undefined;
  private destroy$ = new Subject<void>();

  constructor(private mapStore: Store<MapState>) {}

  /**
   * Se ejecuta al iniciar el componente
   */
  ngOnInit(): void {
    this.mapStore
      .select(mapsSelectors.selectIdentifiedGeometry)
      .pipe(takeUntil(this.destroy$))
      .subscribe(geometryIdentified => {
        this.result = geometryIdentified;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
