import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from '@angular/core/testing';
import { AuthLauncherComponent } from './auth-launcher.component';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Component, Input, DebugElement } from '@angular/core';

// Interfaces
import { AuthConfigInterface } from '../../interfaces/authConfigInterface';
import { AuthContainerComponent } from '../auth-container/auth-container.component';

/**
 * STUB: Componente MOCK para aislar AuthLauncherComponent
 * Previene el error 'isAuthenticated' al no inicializar las dependencias reales de NgRx.
 */
@Component({
  selector: 'app-auth-container',
  standalone: true,
  template: '<div>Auth Container Mock</div>',
})
class AuthContainerStubComponent {
  // Aseguramos que el Input requerido esté presente y tipado correctamente
  @Input({ required: true }) config!: AuthConfigInterface;
}

describe('AuthLauncherComponent', () => {
  let component: AuthLauncherComponent;
  let fixture: ComponentFixture<AuthLauncherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 1. Usamos el Stub en lugar del componente real.
      imports: [
        AuthLauncherComponent,
        ReactiveFormsModule,
        AuthContainerStubComponent,
      ],
      // 2. Quitamos StoreModule.forRoot({}) ya que el Stub lo aísla
    })
      // 3. Sobrescribimos el componente real con el stub para el testing
      .overrideComponent(AuthLauncherComponent, {
        remove: { imports: [AuthContainerComponent] }, // Quitamos la importación del real
        add: { imports: [AuthContainerStubComponent] }, // Añadimos el stub
      })
      .compileComponents();

    fixture = TestBed.createComponent(AuthLauncherComponent);
    component = fixture.componentInstance;

    // El formulario se inicializa en ngOnInit y ngAfterViewInit llama a updateConfig,
    // por lo que detectChanges debe ser llamado.
    fixture.detectChanges();
  });

  // -----------------------------------------------------
  // 1. El componente se crea
  // -----------------------------------------------------
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // -----------------------------------------------------
  // 2. ngOnInit inicializa el form correctamente
  // -----------------------------------------------------
  it('debe inicializar el formulario con los valores por defecto de MOCK_AUTH_CONFIG', () => {
    expect(component.form).toBeTruthy();
    expect(component.form.get('loginButtonText')?.value).toBe(
      component.MOCK_AUTH_CONFIG.loginButtonText
    );
  });

  // -----------------------------------------------------
  // 3. ngAfterViewInit debe llamar updateConfig()
  // -----------------------------------------------------
  it('debe llamar updateConfig en ngAfterViewInit', () => {
    // Creamos una nueva instancia para que ngAfterViewInit no se haya ejecutado aún
    const newFixture = TestBed.createComponent(AuthLauncherComponent);
    const newComponent = newFixture.componentInstance;

    const spy = spyOn(newComponent, 'updateConfig');

    // Llamamos el hook, lo que debería disparar el spy
    newComponent.ngAfterViewInit();

    expect(spy).toHaveBeenCalled();
  });

  // -----------------------------------------------------
  // 4. updateConfig actualiza config, emite evento y reinicia showComponent
  //    *** Usando fakeAsync/flush para control de setTimeout(0) ***
  // -----------------------------------------------------
  it('updateConfig debe actualizar config, emitir evento y recargar componente', fakeAsync(() => {
    const emitSpy = spyOn(component.configChange, 'emit');

    // Arrange
    const newButtonText = 'Nuevo texto';
    const newColor = 'secondary';

    component.form.patchValue({
      loginButtonText: newButtonText,
      loginButtonColor: newColor,
    });

    // Act
    component.updateConfig();

    // Assert (inmediato)
    expect(component.config.loginButtonText).toBe(newButtonText);
    expect(component.config.loginButtonColor).toBe(newColor);
    expect(component.config.templateMain).toBe(component.mainTpl);
    expect(component.config.templateFooter).toBe(component.footerTpl);

    // Emisión evento
    expect(emitSpy).toHaveBeenCalledWith(component.config);

    // Reinicio del componente (estado inicial)
    expect(component.showComponent).toBeFalse();

    // Movemos el tiempo 0ms para resolver el setTimeout
    flush();

    // Assert (después del setTimeout(0))
    expect(component.showComponent).toBeTrue();
  }));

  // -----------------------------------------------------
  // 5. Debe renderizar app-auth-container (Stub)
  // -----------------------------------------------------
  it('debe renderizar <app-auth-container> (Stub) y pasar config', () => {
    fixture.detectChanges();

    const containerDebugEl: DebugElement = fixture.debugElement.query(
      By.directive(AuthContainerStubComponent)
    );

    expect(containerDebugEl).toBeTruthy();

    // Verificamos que el input [config] se pasa correctamente al stub
    const containerComponent =
      containerDebugEl.componentInstance as AuthContainerStubComponent;
    expect(containerComponent.config).toBe(component.config);
  });

  // -----------------------------------------------------
  // 6. Integración: Clic en el botón Actualizar debe llamar updateConfig
  // -----------------------------------------------------
  it('el clic en el botón "Actualizar configuración" debe llamar a updateConfig()', () => {
    const updateSpy = spyOn(component, 'updateConfig');

    const buttonEl: DebugElement = fixture.debugElement.query(
      By.css('.p-button.p-component.mt-4.w-full')
    );

    expect(buttonEl).toBeTruthy();

    // Simulamos el click
    buttonEl.triggerEventHandler('click', new Event('click'));

    expect(updateSpy).toHaveBeenCalled();
  });
});
