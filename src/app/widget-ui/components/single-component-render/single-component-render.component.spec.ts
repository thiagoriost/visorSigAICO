import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SingleComponentRenderComponent } from './single-component-render.component';
import { ViewContainerRef, Component, NgModule } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { selectWidgetOpenedSingleRender } from '@app/core/store/user-interface/user-interface.selectors';

// Componente de prueba mock
@Component({ template: '', standalone: true })
class MockWidgetComponent {}

// Módulo para el componente mock
@NgModule({
  imports: [MockWidgetComponent],
  exports: [MockWidgetComponent],
})
class MockModule {}

describe('SingleComponentRenderComponent', () => {
  let component: SingleComponentRenderComponent;
  let fixture: ComponentFixture<SingleComponentRenderComponent>;
  let mockStore: { select: jasmine.Spy };
  let mockUserInterfaceService: {
    getComponente: jasmine.Spy;
    // Agregar otros métodos si es necesario
  };

  beforeEach(async () => {
    mockStore = {
      select: jasmine.createSpy('select').and.returnValue(of(null)),
    };

    mockUserInterfaceService = {
      getComponente: jasmine
        .createSpy('getComponente')
        .and.returnValue(Promise.resolve(MockWidgetComponent)),
    };

    await TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        MockModule,
        SingleComponentRenderComponent,
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: UserInterfaceService, useValue: mockUserInterfaceService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleComponentRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el ViewContainerRef', () => {
    expect(component.container).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('debería suscribirse a selectWidgetOpenedSingleRender', () => {
      expect(mockStore.select).toHaveBeenCalledWith(
        selectWidgetOpenedSingleRender
      );
    });

    it('debería limpiar el contenedor si ya hay un widget cargado', async () => {
      // Simular un widget ya cargado
      component.widgetActual = 'widget1';
      spyOn(component.container, 'clear');

      // Emitir un nuevo valor
      mockStore.select.and.returnValue(of('widget2'));
      component.ngAfterViewInit();

      expect(component.container.clear).toHaveBeenCalled();
    });

    it('debería cargar un nuevo widget cuando se recibe un nombre válido', async () => {
      const widgetName = 'testWidget';
      mockStore.select.and.returnValue(of(widgetName));

      component.ngAfterViewInit();
      await fixture.whenStable();

      expect(mockUserInterfaceService.getComponente).toHaveBeenCalledWith(
        widgetName
      );
      expect(component.container.length).toBe(1);
      expect(component.widgetActual).toBe(widgetName);
    });

    it('no debería cargar un widget cuando el nombre es nulo', async () => {
      mockStore.select.and.returnValue(of(null));
      spyOn(component.container, 'createComponent');

      component.ngAfterViewInit();
      await fixture.whenStable();

      expect(mockUserInterfaceService.getComponente).not.toHaveBeenCalled();
      expect(component.container.createComponent).not.toHaveBeenCalled();
    });
  });

  describe('abrirWidget', () => {
    it('debería mostrar advertencia si el contenedor no está inicializado', async () => {
      spyOn(console, 'warn');
      component.container = null as unknown as ViewContainerRef;

      await component.abrirWidget('testWidget');

      expect(console.warn).toHaveBeenCalledWith(
        'ViewContainerRef no está inicializado.'
      );
    });

    it('debería mostrar advertencia si el componente no se encuentra', async () => {
      spyOn(console, 'warn');
      mockUserInterfaceService.getComponente.and.returnValue(
        Promise.resolve(null)
      );

      await component.abrirWidget('widgetNoExistente');

      expect(console.warn).toHaveBeenCalledWith(
        'No se encontró el componente: widgetNoExistente'
      );
    });

    it('debería cargar el componente correctamente cuando existe', async () => {
      const widgetName = 'testWidget';

      await component.abrirWidget(widgetName);

      expect(mockUserInterfaceService.getComponente).toHaveBeenCalledWith(
        widgetName
      );
      expect(component.container.length).toBe(1);
    });
  });

  describe('ngOnDestroy', () => {
    it('debería completar el subject destroy$', () => {
      const nextSpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalledWith();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
