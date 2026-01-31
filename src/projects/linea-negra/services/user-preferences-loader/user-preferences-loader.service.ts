import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppThemeService } from '../app-theme/app-theme.service';
import { ContentTableSearchService } from '../content-table-search/content-table-search.service';
import { selectUser } from '@app/core/store/auth/auth.selectors';
import { Comunidades } from '@app/core/interfaces/auth/Comunidad';
import { Directus_Roles } from '@app/core/interfaces/directus/DirectusRoles';
import { AuthState } from '@app/core/interfaces/auth/AuthStateInterface';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import {
  AbrirWidget,
  SetSingleComponentWidget,
} from '@app/core/store/user-interface/user-interface.actions';

/**
 * Servicio encargado de gestionar y cargar las preferencias del usuario cuando cambia el estado de autenticacion
 * @date 2025-12-09
 * @author Andres Fabian Simbaqueba
 */
@Injectable({
  providedIn: 'root',
})
export class UserPreferencesLoaderService {
  constructor(
    private store: Store<AuthState>,
    private appThemeService: AppThemeService,
    private contentTableSearchService: ContentTableSearchService,
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>
  ) {
    this.store.select(selectUser).subscribe(user => {
      if (user) {
        const comunidad = user.Id_Comunidad as Comunidades | string;
        const rolUsuario = user.Id_rol_visor as Directus_Roles | string;
        this.closeWindowOpened();
        if (typeof comunidad === 'object') {
          this.appThemeService.applyDynamicTheme(comunidad as Comunidades);
        }
        if (rolUsuario && typeof rolUsuario === 'object') {
          this.contentTableSearchService.searchContentTableOfARole(
            rolUsuario.id
          );
        } else if (typeof rolUsuario === 'string' && rolUsuario !== '') {
          this.contentTableSearchService.searchContentTableOfARole(rolUsuario);
        } else {
          // mostrar mensaje de que no puede acceder al SIG
          console.error('No tiene rol asociado, no se puede acceder');
        }
      } else {
        this.closeWindowOpened();
        this.appThemeService.applyDynamicTheme();
        this.contentTableSearchService.searchContentTableOfARole();
      }
    });
  }

  /**
   * Cierra la ventana de tabla de contenido para asegurar que el árbol se renderiza y toma los cambios de las nuevas capas cargadas
   */
  closeWindowOpened() {
    // dispara mutacion en el store para ocultar la tabla de contenido
    this.userInterfaceStore.dispatch(
      AbrirWidget({ nombre: 'ContentTable', estado: false })
    );
    // dispara mutacion en el store para ocultar la tabla de atributos
    this.userInterfaceStore.dispatch(
      AbrirWidget({ nombre: 'attributeTable', estado: false })
    );
    this.userInterfaceStore.dispatch(
      SetSingleComponentWidget({ nombre: undefined })
    );
  }
}
