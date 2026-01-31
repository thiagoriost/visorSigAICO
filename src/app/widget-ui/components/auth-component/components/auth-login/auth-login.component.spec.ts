import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthLoginComponent } from './auth-login.component';
import { AuthLoginModalComponent } from '@app/widget-ui/components/auth-component/components/auth-login-modal/auth-login-modal.component';
import { ButtonModule } from 'primeng/button';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';
import { StoreModule } from '@ngrx/store';
import { MessageService } from 'primeng/api';

describe('AuthLoginComponent', () => {
  let component: AuthLoginComponent;
  let fixture: ComponentFixture<AuthLoginComponent>;

  const mockConfig: AuthConfigInterface = {
    loginButtonText: 'INICIAR SESIÓN',
    loginButtonColor: 'primary',
    loginButtonBorder: 'rounded-lg',
    loginButtonShadow: true,
    iconUser: 'pi pi-user',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AuthLoginComponent,
        AuthLoginModalComponent,
        ButtonModule,
        NoopAnimationsModule,
        StoreModule.forRoot({}),
      ],
      providers: [
        {
          provide: MessageService,
          useValue: jasmine.createSpyObj('MessageService', ['add']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLoginComponent);
    component = fixture.componentInstance;

    // Asignación de Input requerido
    component.config = mockConfig;

    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe establecer showModal en true al ejecutar showDialog()', () => {
    component.showDialog();
    expect(component.showModal).toBeTrue();
  });

  it('debe establecer showModal en false al ejecutar onAuthenticated()', () => {
    component.showModal = true;
    component.onAuthenticated();
    expect(component.showModal).toBeFalse();
  });

  it('debe mostrar <app-auth-login-modal> cuando showModal = true', () => {
    component.showModal = true;
    fixture.detectChanges();

    const modal = fixture.debugElement.query(
      By.directive(AuthLoginModalComponent)
    );

    expect(modal).toBeTruthy();
  });

  it('no debe mostrar <app-auth-login-modal> cuando showModal = false', () => {
    component.showModal = false;
    fixture.detectChanges();

    const modal = fixture.debugElement.query(
      By.directive(AuthLoginModalComponent)
    );

    expect(modal).toBeNull();
  });

  it('debe enviar el texto del botón cuando no es móvil', () => {
    component.isMobileVersion = false;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.textContent.trim()).toBe('INICIAR SESIÓN');
  });

  it('no debe mostrar texto cuando es versión móvil', () => {
    component.isMobileVersion = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.textContent.trim()).toBe('');
  });
});
