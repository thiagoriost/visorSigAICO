import { createReducer, on } from '@ngrx/store';
import * as SwipeActions from '../store/swipe.actions';

export interface SwipeState {
  capaSeleccionadaId: string | null;
  activo: boolean;
}

export const initialState: SwipeState = {
  capaSeleccionadaId: null,
  activo: false,
};

export const swipeReducer = createReducer(
  initialState,
  on(SwipeActions.seleccionarCapa, (state, { capaId }) => ({
    ...state,
    capaSeleccionadaId: capaId,
  })),
  on(SwipeActions.activarSwipe, state => ({
    ...state,
    activo: true,
  })),
  on(SwipeActions.desactivarSwipe, state => ({
    ...state,
    activo: false,
  }))
);
