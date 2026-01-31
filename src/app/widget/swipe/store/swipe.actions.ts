import { createAction, props } from '@ngrx/store';

export const intentarActivarSwipe = createAction('[Swipe] Intentar Activar');

export const activarSwipe = createAction(
  '[Swipe] Activar',
  props<{ capaId: string }>()
);

export const desactivarSwipe = createAction('[Swipe] Desactivar');

export const seleccionarCapa = createAction(
  '[Swipe] Seleccionar Capa',
  props<{ capaId: string | null }>()
);

export const mostrarAdvertencia = createAction(
  '[Swipe] Mostrar Advertencia',
  props<{ mensaje: string }>()
);
