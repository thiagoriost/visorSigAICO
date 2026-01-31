import {
  Component,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthContainerComponent } from '../auth-container/auth-container.component';
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';
import { CommonModule } from '@angular/common';

/**
 * @description
 * Componente lanzador del módulo de autenticación.
 * Sirve como capa de configuración dinámica que permite modificar
 * textos, colores, estilos y plantillas del módulo de autenticación (`AuthContainerComponent`).
 *
 * Renderiza un formulario con opciones configurables, emite dichas configuraciones
 * y fuerza la recarga del componente contenedor para reflejar los cambios en tiempo real.
 *
 * @author
 * javier.munoz@igac.gov.co y Heidy Paola Lopez Sanchez
 *
 * @version
 * 1.0.0
 *
 * @since
 * 10/12/2025
 */
@Component({
  selector: 'app-auth-launcher',
  standalone: true,
  imports: [AuthContainerComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './auth-launcher.component.html',
  styleUrl: './auth-launcher.component.scss',
})
export class AuthLauncherComponent implements AfterViewInit, OnInit {
  /**
   * @description Plantilla principal que puede ser enviada al componente contenedor.
   */
  @ViewChild('mainTpl') mainTpl!: TemplateRef<unknown>;

  /**
   * @description Plantilla del pie de página para personalización del modal o contenedor.
   */
  @ViewChild('footerTpl') footerTpl!: TemplateRef<unknown>;

  /**
   * @description Evento que notifica al componente padre que la configuración ha cambiado.
   */
  @Output() configChange = new EventEmitter<AuthConfigInterface>();

  /**
   * @description Formulario que administra la configuración editable del módulo de auth.
   */
  form!: FormGroup;

  /**
   * @description Control usado para forzar el re-renderizado del AuthContainerComponent.
   * Activado/desactivado para refrescar dinámicamente la vista.
   */
  showComponent = true;

  /**
   * @description Configuración mock por defecto utilizada para pruebas, demos o standalone mode.
   */
  MOCK_AUTH_CONFIG: AuthConfigInterface = {
    textColor: 'text-gray-800',
    loginButtonText: 'Iniciar sesión',
    loginButtonColor: 'contrast',
    loginButtonBorder: 'border-rounded-md',
    loginButtonShadow: true,
    iconUser: 'pi pi-user',

    modalLogoUrl:
      'https://dev-sigansestral.igac.gov.co/cms-admin/assets/c1120eba-e78c-4d1d-8635-39a2c7aa6c0f',
    modalButtonText: 'Ingresar',
    modalButtonColor: 'contrast',
    modalButtonBorder: 'border-rounded-md',

    avatarIcon: 'pi pi-user',
    avatarIconColor: 'text-gray-800',

    templateMain: undefined,
    templateFooter: undefined,

    outputButtonText: 'Cerrar sesión',
    outputButtonColor: 'contrast',
    outputButtonBorder: 'border-rounded-md',
  };

  /**
   * @description Configuración actual utilizada por el AuthContainerComponent.
   */
  config: AuthConfigInterface = this.MOCK_AUTH_CONFIG;

  constructor(private fb: FormBuilder) {}

  /**
   * @description Inicializa el formulario y asigna valores iniciales
   * basados en la configuración mock.
   */
  ngOnInit() {
    this.form = this.fb.group({
      textColor: [this.MOCK_AUTH_CONFIG.textColor],
      loginButtonText: [this.MOCK_AUTH_CONFIG.loginButtonText],
      loginButtonColor: [this.MOCK_AUTH_CONFIG.loginButtonColor],
      loginButtonBorder: [this.MOCK_AUTH_CONFIG.loginButtonBorder],
      loginButtonShadow: [this.MOCK_AUTH_CONFIG.loginButtonShadow],
      iconUser: [this.MOCK_AUTH_CONFIG.iconUser],

      modalLogoUrl: [this.MOCK_AUTH_CONFIG.modalLogoUrl],
      modalButtonText: [this.MOCK_AUTH_CONFIG.modalButtonText],
      modalButtonColor: [this.MOCK_AUTH_CONFIG.modalButtonColor],
      modalButtonBorder: [this.MOCK_AUTH_CONFIG.modalButtonBorder],

      avatarIcon: [this.MOCK_AUTH_CONFIG.avatarIcon],
      avatarIconColor: [this.MOCK_AUTH_CONFIG.avatarIconColor],

      outputButtonText: [this.MOCK_AUTH_CONFIG.outputButtonText],
      outputButtonColor: [this.MOCK_AUTH_CONFIG.outputButtonColor],
      outputButtonBorder: [this.MOCK_AUTH_CONFIG.outputButtonBorder],
    });
  }

  /**
   * @description Se ejecuta cuando las plantillas del ViewChild ya están disponibles.
   * Actualiza la configuración inicial para integrarlas.
   */
  ngAfterViewInit() {
    this.updateConfig(); // inicial
  }

  /**
   * @description
   * Actualiza la configuración del componente con los valores del formulario,
   * agrega las plantillas dinámicas y emite el evento de actualización.
   *
   * También fuerza el re-renderizado del componente `AuthContainerComponent`
   * desactivándolo temporalmente y reactivándolo mediante un timeout.
   */
  updateConfig() {
    const values = this.form.value;

    // Construimos la nueva configuración
    this.config = {
      ...values,
      templateMain: this.mainTpl,
      templateFooter: this.footerTpl,
    };

    // Emitimos el hook de salida
    this.configChange.emit(this.config);

    // Forzamos recarga del componente contenedor
    this.showComponent = false;
    setTimeout(() => (this.showComponent = true), 0);
  }
}
