import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelWindowComponent } from './panel-window.component';
import { WidgetItemFuncionState } from '@app/core/interfaces/store/user-interface.model';
import { Type, ViewContainerRef, Component } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';

@Component({
  selector: 'app-mock-widget',
  template: '<p>Mock Widget</p>',
  standalone: true,
})
class MockWidgetComponent {}

/**
 * @description Pruebas unitarias del componente.
 * @autor Carlos Javier Muñoz Fernández
 * @fecha 05/12/2024
 * @clase panel-window.component.spec
 */
describe('PanelWindowComponent', () => {
  let userInterfaceServiceSpy: jasmine.SpyObj<UserInterfaceService>;

  let component: PanelWindowComponent;
  let fixture: ComponentFixture<PanelWindowComponent>;
  let viewContainerRefSpy: jasmine.SpyObj<ViewContainerRef>;

  const initialState = {
    userInterface: {
      widgets: [
        {
          titulo: 'Titulo hola mundo',
          nombreWidget: 'HolaMundoComponent',
          ruta: '@app/widget/holamundo/hola-mundo/hola-mundo.component',
          posicionX: 1,
          ancho: 20,
          alto: 20,
          posiciony: 1,
          importarComponente: () => Promise.resolve({} as Type<unknown>),
        },
        {
          titulo: 'Home Page',
          nombreWidget: 'HomePageComponent',
          ruta: '@app/widget/home-page/home-page.component',
          ancho: 20,
          alto: 20,
          posicionX: 1,
          posiciony: 2,
          importarComponente: () => Promise.resolve({} as Type<unknown>),
        },
      ],
    },
  };

  beforeEach(async () => {
    // Mockeamos `UserInterfaceService`
    userInterfaceServiceSpy = jasmine.createSpyObj('UserInterfaceService', [
      'getComponente',
    ]);
    //`getComponente()` devuelve un componente mock
    userInterfaceServiceSpy.getComponente.and.returnValue(
      Promise.resolve(MockWidgetComponent)
    );
    // Creamos un spy para ViewContainerRef
    viewContainerRefSpy = jasmine.createSpyObj('ViewContainerRef', [
      'createComponent',
    ]);
    await TestBed.configureTestingModule({
      imports: [PanelWindowComponent], // Importa el componente standalone aquí
      providers: [
        provideMockStore({ initialState }),
        { provide: UserInterfaceService, useValue: userInterfaceServiceSpy },
        { provide: ViewContainerRef, useValue: viewContainerRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.container = viewContainerRefSpy;
  });

  /**
   * Verifica que el componente se crea correctamente.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Verifica que el componente se crea dinámicamente en el contenedor.
   */
  it('should dynamically create component in container', async () => {
    const widgetDefinition: WidgetItemFuncionState = {
      titulo: 'Test Widget',
      nombreWidget: 'TestComponent',
      ruta: '@app/test/test.component',
      posicionX: 1,
      posicionY: 1,
      ancho: 20,
      alto: 20,
      importarComponente: () => Promise.resolve({} as Type<unknown>),
    };
    component.widgetDefinition = widgetDefinition;
    fixture.detectChanges(); // Asegúrate de que detectChanges se llame después de configurar el contenedor
    await component.crearWidget();
    expect(viewContainerRefSpy.createComponent).toHaveBeenCalled();
  });
});
