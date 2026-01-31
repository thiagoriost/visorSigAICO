import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideEffects } from '@ngrx/effects';
import { SwipeEffects } from '@app/widget/swipe/store/swipe.effects';
import { MessageService } from 'primeng/api';
import { AppConfigService } from '@app/core/services/app-config/app-config.service';

import { appConfig } from './aiso.config';
import { IndexPageComponent } from './pages/index-page/index-page.component';
import { WIDGET_CONFIG } from '@app/core/config/interfaces/IWidgetConfig';
import { AISO_WIDGET_CONFIG } from './files/widget.config';

/**
 * @description Función principal que inicializa la aplicación Angular.
 * Carga la configuración de la aplicación desde `config.json` antes de arrancar el módulo raíz.
 * @returns {Promise<void>} Una promesa que se resuelve cuando la aplicación ha sido inicializada.
 */
async function main() {
  // 1. Crear instancia de AppConfigService
  const configService = new AppConfigService();
  // 2. Esperar a que cargue config.json
  await configService.load();
  // 3. Bootstrap con la instancia cargada
  return bootstrapApplication(IndexPageComponent, {
    ...appConfig,
    providers: [
      provideHttpClient(),
      ...(appConfig.providers || []),
      provideEffects(),
      provideEffects(SwipeEffects),
      MessageService,
      { provide: AppConfigService, useValue: configService },
      { provide: WIDGET_CONFIG, useValue: AISO_WIDGET_CONFIG },
    ],
  });
}

main().catch(err => console.error(err));
