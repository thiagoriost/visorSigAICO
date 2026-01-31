import {
  Component,
  Input,
  TemplateRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { AuthContainerComponent } from '@app/widget-ui/components/auth-component/components/auth-container/auth-container.component';
import { AuthConfigInterface } from '@app/widget-ui/components/auth-component/interfaces/authConfigInterface';
import { LogosComunidadesComponent } from '../logos-comunidades/logos-comunidades.component';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthUserInterface } from '@app/core/interfaces/auth/UserModel';
import { selectUrlLogo, selectUser } from '@app/core/store/auth/auth.selectors';
import { CommonModule } from '@angular/common';
import { DirectusFilesService } from '@app/widget-ui/components/auth-component/services/directus-files/directus-files.service';
import { environment } from 'environments/environment';

/**
 * Componente para el modulo de autenticacion de usuario en el visor
 * @date 22-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-autenticacion-linea-negra',
  imports: [AuthContainerComponent, LogosComunidadesComponent, CommonModule],
  templateUrl: './autenticacion-linea-negra.component.html',
  styleUrl: './autenticacion-linea-negra.component.scss',
})
export class AutenticacionLineaNegraComponent implements AfterViewInit {
  @Input() isMobile = false; //indica si la resolución es de un dispositivo movil
  @Input() userIcon = 'pi pi-user'; //clase para el icono de usuario (cuando esta en resolucion movil)
  @ViewChild('mainTpl') mainTpl!: TemplateRef<unknown>;
  @ViewChild('footerTpl') footerTpl!: TemplateRef<unknown>;
  user$: Observable<AuthUserInterface | undefined>;
  urlLogo$: Observable<string>;
  urlLogo = '';
  config: AuthConfigInterface = {
    textColor: 'text-gray-800',
    // === AUTH LOGIN BUTTON ===
    loginButtonText: 'INICIAR SESIÓN',
    loginButtonColor: 'contrast',
    loginButtonBorder: 'border-round-xl',
    loginButtonShadow: true,
    iconUser: 'pi pi-user',

    // === AUTH LOGIN MODAL ===
    modalLogoUrl: environment.auth.urlLogo,
    modalButtonText: 'INGRESAR',
    modalButtonColor: 'contrast',
    modalButtonBorder: 'border-round-xl',

    // === AUTH USER PROFILE ===
    avatarIcon: 'pi pi-user',
    avatarIconColor: 'text-gray-800',

    // === CARD USER PROFILE ===
    templateMain: undefined,
    templateFooter: undefined,
    outputButtonText: 'Cerrar sesión',
    outputButtonColor: 'contrast',
    outputButtonBorder: 'border-round-xl',
  };

  constructor(
    private store: Store,
    private directusFiles: DirectusFilesService
  ) {
    console.log('Environment: ', environment);
    this.user$ = this.store.select(selectUser);
    this.urlLogo$ = this.store.select(selectUrlLogo);
  }
  ngAfterViewInit() {
    this.config = {
      ...this.config,
      templateMain: this.mainTpl,
      templateFooter: this.footerTpl,
    };
  }
  obtenerNombreComunidad(user: AuthUserInterface): string {
    const comunidad = user.Id_Comunidad;
    if (typeof comunidad === 'string') {
      return comunidad;
    }
    if (comunidad.Logo)
      this.urlLogo = this.directusFiles.getURLFile(comunidad.Logo);
    return comunidad.Nombre_Comunidad ?? '';
  }
}
