import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthState } from '@app/core/interfaces/auth/AuthStateInterface';
import { Comunidades } from '@app/core/interfaces/auth/Comunidad';
import { selectComunity } from '@app/core/store/auth/auth.selectors';
import { Store } from '@ngrx/store';
import { HeaderLineaNegraComponent } from '../header-linea-negra/header-linea-negra.component';
import { DirectusFilesService } from '@app/widget-ui/components/auth-component/services/directus-files/directus-files.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * Componente que envuelve el header para linea negra, captura los datos del store para obtener el titulo y la url del logo
 * @date 2025-11-14
 * @author Andrés Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-linea-negra-header-linea-negra-store',
  imports: [HeaderLineaNegraComponent],
  templateUrl: './header-linea-negra-store.component.html',
  styleUrl: './header-linea-negra-store.component.scss',
})
export class HeaderLineaNegraStoreComponent implements OnInit, OnDestroy {
  isAuthenticated = false; //indica si hay un usuario autenticado
  titleHeader: string | null = null; //indica el nombre de la comunidad
  urlImagenLogo = 'assets/images/linea-negra-icon.svg'; //indica la URL del logo de la comunidad (en construcción)
  initialURLLogo = 'assets/images/linea-negra-icon.svg';
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AuthState>,
    private directusFilesservice: DirectusFilesService
  ) {}

  /**
   * Se suscribe al store para obtener la comunidad del usuario
   */
  ngOnInit(): void {
    this.store
      .select(selectComunity)
      .pipe(takeUntil(this.destroy$))
      .subscribe(community => {
        const comunidad = community as Comunidades;
        if (comunidad) {
          this.isAuthenticated = true;
          this.titleHeader = comunidad.Nombre_Comunidad.toUpperCase();
          if (comunidad.Logo) {
            this.urlImagenLogo = this.directusFilesservice.getURLFile(
              comunidad.Logo
            );
          }
        } else {
          this.isAuthenticated = false;
          this.titleHeader = null;
          this.urlImagenLogo = this.initialURLLogo;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
