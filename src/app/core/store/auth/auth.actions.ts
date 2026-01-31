import { createAction, props } from '@ngrx/store';
import {
  AuthTokenData,
  AuthUserInterface,
} from '@app/core/interfaces/auth/UserModel';

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: AuthUserInterface }>()
);

export const tokenLoginSuccess = createAction(
  '[Auth] Token Success',
  props<{ authTokenData: AuthTokenData }>()
);

export const logout = createAction('[Auth] Logout');
