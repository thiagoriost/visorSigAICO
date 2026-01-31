import { environment } from 'environments/environment';
import { AuthTokenData, AuthUserInterface } from './UserModel';

export interface AuthState {
  isAuthenticated: boolean;
  user?: AuthUserInterface;
  authTokenData?: AuthTokenData;
  urlLogo: string;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  urlLogo: environment.auth.urlLogo,
};

export interface AuthDirectusSchema {
  users: {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    provider: string | null;
    avatar: string | null;
  };
  [collection: string]: Record<string, unknown> | undefined;
}
