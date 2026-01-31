import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardUserProfileComponent } from './card-user-profile.component';
import { AuthUserInterface } from '@app/core/interfaces/auth/UserModel';
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';
import { By } from '@angular/platform-browser';
import { DebugElement, TemplateRef, ViewChild, Component } from '@angular/core';

/**
 * 1. Definición estricta de Mocks y Types
 */

// Datos de usuario simulado
const mockUser: AuthUserInterface = {
  id: '1',
  first_name: 'Juan',
  last_name: 'Pérez',
  email: 'juan.perez@test.com',
  // ... resto de campos por completitud (Aseguramos que todos los campos requeridos existen)
  password: '',
  location: null,
  title: null,
  description: null,
  tags: null,
  avatar: null,
  language: 'es',
  tfa_secret: null,
  status: 'active',
  role: 'rol-123',
  token: null,
  last_page: '/home',
  provider: 'default',
  external_identifier: null,
  auth_data: null,
  appearance: null,
  email_notifications: true,
  theme_light_overrides: null,
  theme_dark_overrides: null,
  theme_dark: null,
  theme_light: null,
  Id_Comunidad: 'com-1',
  Id_rol_visor: '',
};

// Configuración de prueba estándar
const mockConfig: AuthConfigInterface = {
  textColor: 'text-primary',
  avatarIcon: 'pi pi-id-card',
  avatarIconColor: 'text-orange-500',
  outputButtonText: 'SALIR AHORA',
  outputButtonColor: 'danger',
  outputButtonBorder: 'border-round-xl',
};

/**
 * 2. Host Component para Probar Proyección de Contenido
 * Usamos TemplateRef<unknown> para evitar 'any' sin saber el contexto exacto.
 */
@Component({
  template: `
    <app-card-user-profile
      [user]="user"
      [config]="hostConfig"
      (logoutEvent)="onHostLogout()">
    </app-card-user-profile>

    <ng-template #mainContent>
      <div id="projected-main-content">Contenido Principal Proyectado</div>
    </ng-template>

    <ng-template #footerContent>
      <div id="projected-footer-content">Pie de Página Proyectado</div>
    </ng-template>
  `,
  standalone: true,
  imports: [CardUserProfileComponent],
})
class TestHostComponent {
  user: AuthUserInterface = mockUser;
  hostConfig: AuthConfigInterface = { ...mockConfig };

  // Referencias a los templates en el host, tipadas con 'unknown'
  @ViewChild('mainContent', { static: true })
  mainTemplateRef!: TemplateRef<unknown>;
  @ViewChild('footerContent', { static: true })
  footerTemplateRef!: TemplateRef<unknown>;

  logoutCalled = false;
  onHostLogout(): void {
    this.logoutCalled = true;
  }
}

describe('CardUserProfileComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: CardUserProfileComponent;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardUserProfileComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;

    // Obtener la instancia del componente bajo prueba (el hijo de TestHostComponent)
    const cardEl: DebugElement = fixture.debugElement.query(
      By.directive(CardUserProfileComponent)
    );
    // Usamos la aserción de tipo para asegurar que 'component' sea CardUserProfileComponent
    component = cardEl.componentInstance as CardUserProfileComponent;

    // Asignar config y user antes de la primera detección
    component.user = mockUser;
    component.config = hostComponent.hostConfig;

    fixture.detectChanges();
  });

  // ----------- PRUEBAS BÁSICAS -----------

  it('debería crear el componente CardUserProfileComponent', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el nombre y apellido del usuario', () => {
    // Tipamos el elemento HTML
    const nameEl: HTMLElement = fixture.debugElement.query(
      By.css('span.font-bold')
    ).nativeElement;

    // El 'textContent' puede ser null, por eso usamos el operador ?.
    expect(nameEl.textContent?.trim()).toBe('Juan Pérez');
  });

  it('debería actualizarse el nombre al cambiar el input user dinámicamente', () => {
    hostComponent.user = {
      ...mockUser,
      first_name: 'Pedro',
      last_name: 'López',
    };
    fixture.detectChanges();

    const nameEl: HTMLElement = fixture.debugElement.query(
      By.css('span.font-bold')
    ).nativeElement;
    expect(nameEl.textContent?.trim()).toBe('Pedro López');
  });

  // ----------- PRUEBAS DE EVENTOS -----------

  it('cerrarSesion() debería llamar al output logoutEvent.emit()', () => {
    // Espiamos el output
    spyOn(component.logoutEvent, 'emit');
    component.cerrarSesion();
    expect(component.logoutEvent.emit).toHaveBeenCalled();
  });

  it('debería emitir el evento logoutEvent cuando se presione el botón de cerrar sesión', () => {
    const buttonEl: DebugElement = fixture.debugElement.query(
      By.css('p-button')
    );

    // Simular el evento onClick del componente P-Button
    // Nota: 'onClick' es el nombre del Output de PrimeNG Button, no el evento nativo.
    buttonEl.triggerEventHandler('onClick', new Event('click'));

    // Verificamos que el método del host fue llamado (indicando que el evento se propagó)
    expect(hostComponent.logoutCalled).toBeTrue();
  });

  // ----------- PRUEBAS DE PROYECCIÓN DE CONTENIDO (NG-TEMPLATE) -----------

  it('debería renderizar templateMain cuando se provee', () => {
    // 1. Asignar el template al config del host
    hostComponent.hostConfig.templateMain = hostComponent.mainTemplateRef;
    fixture.detectChanges();

    // 2. Buscar el contenido proyectado
    const projectedEl: DebugElement = fixture.debugElement.query(
      By.css('#projected-main-content')
    );

    expect(projectedEl).toBeTruthy();
    expect(projectedEl.nativeElement.textContent).toBe(
      'Contenido Principal Proyectado'
    );
  });

  it('no debería renderizar templateMain si no se provee', () => {
    // Aseguramos que el template no está asignado
    hostComponent.hostConfig.templateMain = undefined;
    fixture.detectChanges();

    const projectedEl: DebugElement = fixture.debugElement.query(
      By.css('#projected-main-content')
    );

    // El elemento no debería encontrarse
    expect(projectedEl).toBeNull();
  });

  it('debería renderizar templateFooter cuando se provee', () => {
    // 1. Asignar el template al config del host
    hostComponent.hostConfig.templateFooter = hostComponent.footerTemplateRef;
    fixture.detectChanges();

    // 2. Buscar el contenido proyectado
    const projectedEl: DebugElement = fixture.debugElement.query(
      By.css('#projected-footer-content')
    );

    expect(projectedEl).toBeTruthy();
    expect(projectedEl.nativeElement.textContent).toBe(
      'Pie de Página Proyectado'
    );
  });
});
