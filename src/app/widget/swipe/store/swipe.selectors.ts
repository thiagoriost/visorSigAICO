import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SwipeState } from '../store/swipe.reducer';

export const selectSwipeState = createFeatureSelector<SwipeState>('swipe');

export const selectSwipeActivo = createSelector(
  selectSwipeState,
  state => state.activo
);

export const selectCapaSeleccionadaId = createSelector(
  selectSwipeState,
  state => state.capaSeleccionadaId
);
