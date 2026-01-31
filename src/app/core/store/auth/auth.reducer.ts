import { Action, createReducer, on } from '@ngrx/store';
import {
  AuthState,
  initialAuthState,
} from '@app/core/interfaces/auth/AuthStateInterface';
import * as AuthActions from './auth.actions';

/**
 * Reducer para manejar el estado de autenticación
 * Este reducer será persistido automáticamente en localStorage
 * gracias al meta-reducer configurado
 */

export const authReducer = createReducer(
  initialAuthState,

  // Acción para iniciar sesión
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    isAuthenticated: true,
    user,
  })),

  // Acción para autenticar el usuario
  on(AuthActions.tokenLoginSuccess, (state, { authTokenData }) => ({
    ...state,
    authTokenData,
  })),

  // Acción para cerrar sesión
  on(AuthActions.logout, () => initialAuthState)
);

export function reducer(
  state: AuthState | undefined,
  action: Action
): AuthState {
  return authReducer(state, action);
}
