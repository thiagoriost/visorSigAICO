import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '@app/core/interfaces/auth/AuthStateInterface';
// auth.selectors.ts

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  state => state.isAuthenticated
);

export const selectUser = createSelector(selectAuthState, state => state.user);
export const selectTokenUser = createSelector(
  selectAuthState,
  state => state.authTokenData
);
export const selectUrlLogo = createSelector(
  selectAuthState,
  state => state.urlLogo
);

export const selectComunity = createSelector(
  selectAuthState,
  state => state.user?.Id_Comunidad
);
