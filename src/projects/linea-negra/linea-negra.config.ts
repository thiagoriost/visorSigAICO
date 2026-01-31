import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore, MetaReducer } from '@ngrx/store';
import { mapReducer } from '@app/core/store/map/map.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { userInterfaceReducer } from '@app/core/store/user-interface/user-interface.reducer';
import { providePrimeNG } from 'primeng/config';
import { BasePreset } from '@projects/linea-negra/assets/preset';
import { swipeReducer } from '@app/widget/swipe/store/swipe.reducer';
import { routes } from './linea-negra.routes';
import { authReducer } from '@app/core/store/auth/auth.reducer';
import { localStorageSync } from 'ngrx-store-localstorage';

const metaReducers: MetaReducer[] = [
  localStorageSync({
    keys: ['auth'], // nombre del slice
    rehydrate: true,
    storageKeySerializer: (key: string) => `vge_${key}`,
    storage: window.localStorage,
    restoreDates: false,
    syncCondition: () => true,
  }),
];
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(),
    provideStore(
      {
        swipe: swipeReducer,
        map: mapReducer,
        userInterface: userInterfaceReducer,
        auth: authReducer,
      },
      { metaReducers }
    ),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: BasePreset,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
