import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { mergeMap, withLatestFrom, tap } from 'rxjs/operators';
import * as SwipeActions from '../store/swipe.actions';
import { selectVisibleLayers } from '@app/core/store/map/map.selectors';
import { AlertService } from '@app/widget/swipe/services/alert.service';
import { selectCapaSeleccionadaId } from '../store/swipe.selectors';
import { SwipeMapService } from '@app/widget/swipe/services/swipe-map.service';

@Injectable()
export class SwipeEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private alert = inject(AlertService);
  private swipeMapService = inject(SwipeMapService);

  activarSwipe$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SwipeActions.activarSwipe),
        tap(({ capaId }) => {
          this.swipeMapService.activarSwipe(capaId);
        })
      ),
    { dispatch: false }
  );
  desactivarSwipe$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SwipeActions.desactivarSwipe),
        tap(() => {
          this.swipeMapService.desactivarSwipe();
        })
      ),
    { dispatch: false }
  );

  validarSwipe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SwipeActions.intentarActivarSwipe),
      withLatestFrom(
        this.store.select(selectVisibleLayers),
        this.store.select(selectCapaSeleccionadaId)
      ),
      mergeMap(([, capas, capaSeleccionadaId]) => {
        const sinCapas = !capas || capas.length === 0;
        const sinSeleccion = !capaSeleccionadaId;

        if (sinCapas && sinSeleccion) {
          return of(
            SwipeActions.mostrarAdvertencia({
              mensaje:
                'Debe agregar y seleccionar una capa antes de activar el swipe.',
            })
          );
        }

        if (sinCapas) {
          return of(
            SwipeActions.mostrarAdvertencia({
              mensaje: 'Debe agregar capas al mapa antes de activar el swipe.',
            })
          );
        }

        if (sinSeleccion) {
          return of(
            SwipeActions.mostrarAdvertencia({
              mensaje: 'Debe seleccionar una capa antes de activar el swipe.',
            })
          );
        }

        return of(SwipeActions.activarSwipe({ capaId: capaSeleccionadaId }));
      })
    )
  );

  toastAdvertencia$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SwipeActions.mostrarAdvertencia),
        tap(({ mensaje }) => {
          this.alert.warn('Advertencia...', mensaje);
        })
      ),
    { dispatch: false }
  );

  // método auxiliar (debes reemplazarlo con selector si el ID viene del store)
  private obtenerCapaSeleccionada(): string | null {
    return localStorage.getItem('swipe-capa-seleccionada'); // temporal
  }
}
