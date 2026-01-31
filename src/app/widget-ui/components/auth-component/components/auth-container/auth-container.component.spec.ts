import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthContainerComponent } from './auth-container.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MemoizedSelector } from '@ngrx/store';
import { selectIsAuthenticated } from '@app/core/store/auth/auth.selectors';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { AuthLoginComponent } from '@app/widget-ui/components/auth-component/components/auth-login/auth-login.component';
import { AuthUserProfileComponent } from '@app/widget-ui/components/auth-component/components/auth-user-profile/auth-user-profile.component';
import { AppThemeService } from '@projects/linea-negra/services/app-theme/app-theme.service';
import { MessageService } from 'primeng/api';
import { LayersContentTableManagerService } from '@app/core/services/layers-content-table-manager/layers-content-table-manager.service';
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';

describe('AuthContainerComponent', () => {
  let component: AuthContainerComponent;
  let fixture: ComponentFixture<AuthContainerComponent>;
  let store: MockStore;
  let mockIsAuthenticatedSelector: MemoizedSelector<object, boolean>;

  const mockConfig: Partial<AuthConfigInterface> = {
    loginButtonText: 'Entrar',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthContainerComponent, NoopAnimationsModule],
      providers: [
        provideMockStore(),
        AppThemeService,
        LayersContentTableManagerService,
        MessageService,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(AuthContainerComponent);
    component = fixture.componentInstance;

    component.config = mockConfig;

    mockIsAuthenticatedSelector = store.overrideSelector(
      selectIsAuthenticated,
      false
    );
    fixture.detectChanges();
  });

  // ------------------------------------------------------
  // CREACIÓN DEL COMPONENTE
  // ------------------------------------------------------
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // ------------------------------------------------------
  // RENDER LOGIN cuando NO está autenticado
  // ------------------------------------------------------
  it('debe mostrar <app-auth-login> cuando el usuario NO está autenticado', () => {
    mockIsAuthenticatedSelector.setResult(false);
    store.refreshState();
    fixture.detectChanges();

    const login = fixture.debugElement.query(By.directive(AuthLoginComponent));
    const profile = fixture.debugElement.query(
      By.directive(AuthUserProfileComponent)
    );

    expect(login)
      .withContext('Debe existir login si NO autenticado')
      .toBeTruthy();
    expect(profile).withContext('No debe renderizar user-profile').toBeFalsy();
  });

  // ------------------------------------------------------
  // RENDER USER PROFILE cuando sí está autenticado
  // ------------------------------------------------------
  it('debe mostrar <app-auth-user-profile> cuando el usuario SÍ está autenticado', () => {
    mockIsAuthenticatedSelector.setResult(true);
    store.refreshState();
    fixture.detectChanges();

    const login = fixture.debugElement.query(By.directive(AuthLoginComponent));
    const profile = fixture.debugElement.query(
      By.directive(AuthUserProfileComponent)
    );

    expect(login).toBeFalsy();
    expect(profile).toBeTruthy();
  });

  // ------------------------------------------------------
  // MODO MÓVIL: debe renderizar el botón + popover
  // ------------------------------------------------------
  it('debe renderizar un botón y popover cuando está autenticado en modo móvil', () => {
    component.isMobileVersion = true;

    mockIsAuthenticatedSelector.setResult(true);
    store.refreshState();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('p-button'));
    const popover = fixture.debugElement.query(By.css('p-popover'));

    expect(button).toBeTruthy();
    expect(popover).toBeTruthy();
  });

  // ------------------------------------------------------
  // MODO MÓVIL: NO debe renderizar login cuando está autenticado
  // ------------------------------------------------------
  it('NO debe renderizar login cuando isMobileVersion = true y autenticado', () => {
    component.isMobileVersion = true;

    mockIsAuthenticatedSelector.setResult(true);
    store.refreshState();
    fixture.detectChanges();

    const login = fixture.debugElement.query(By.directive(AuthLoginComponent));
    expect(login).toBeFalsy();
  });

  // ------------------------------------------------------
  // ngOnDestroy: debe completar destroy$
  // ------------------------------------------------------
  it('debe completar destroy$ en ngOnDestroy', () => {
    const spy = spyOn(component['destroy$'], 'next').and.callThrough();
    const spyComplete = spyOn(
      component['destroy$'],
      'complete'
    ).and.callThrough();

    component.ngOnDestroy();

    expect(spy).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });
});
