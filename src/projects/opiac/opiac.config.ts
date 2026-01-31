import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore, provideState } from '@ngrx/store';
import { mapReducer } from '@app/core/store/map/map.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { userInterfaceReducer } from '@app/core/store/user-interface/user-interface.reducer';
import { providePrimeNG } from 'primeng/config';
import { Preset } from '@projects/opiac/assets/preset';
import { swipeReducer } from '@app/widget/swipe/store/swipe.reducer';
import { routes } from './opiac.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(),
    provideStore({ swipe: swipeReducer }),
    provideState({ name: 'map', reducer: mapReducer }),
    provideState({ name: 'userInterface', reducer: userInterfaceReducer }),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Preset,
      },
    }),
  ],
};
