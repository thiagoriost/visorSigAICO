import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarMenuAisoComponent } from './sidebar-menu-aiso.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Image } from 'primeng/image';

describe('SidebarMenuAisoComponent', () => {
  let component: SidebarMenuAisoComponent;
  let fixture: ComponentFixture<SidebarMenuAisoComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ButtonModule,
        TooltipModule,
        Image,
        SidebarMenuAisoComponent,
        StoreModule.forRoot({}, {}),
      ],
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarMenuAisoComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('Debería crear el componente.', () => {
    // Assert
    expect(component).toBeTruthy();
    expect(component.isMobile).toBeFalse();
    expect(component.activePanel).toBeNull();
    expect(component.activeButton).toBeNull();
  });

  it('Debería llamar a selectWidgetData en ngOnInit y manejar la respuesta nula.', () => {
    // Arrange
    const selectSpy = spyOn(store, 'select').and.returnValue(of(null));
    spyOn(console, 'warn');

    // Act
    component.ngOnInit();

    // Assert
    expect(selectSpy).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      'No se encontraron datos para el widget MapNavButtons'
    );
  });

  it('Debería establecer configMapNavButtonsInitial cuando el store emita datos de widget válidos.', () => {
    // Arrange
    const mockWidgetData = { zoomEnabled: true };
    spyOn(store, 'select').and.returnValue(of(mockWidgetData));

    // Act
    component.ngOnInit();

    // Assert
    expect(component.configMapNavButtonsInitial).toBeTruthy();
    expect(component.configMapNavButtonsInitial?.showPan).toBeTrue();
    expect(component.configMapNavButtonsInitial?.buttomSeverity).toBe(
      'primary'
    );
  });

  it('Debería devolver el título correcto en el getter panelTitle.', () => {
    // Arrange
    component.activePanel = 'Identify';
    expect(component.panelTitle).toBe('Identificar');

    // Act
    component.activePanel = 'Ayuda';
    expect(component.panelTitle).toBe('Ayuda');

    // Assert
    component.activePanel = 'Otro';
    expect(component.panelTitle).toBeNull();
  });

  it('Debería alternar correctamente el activeButton usando toggleButton().', () => {
    // Arrange
    spyOn(component, 'onAction').and.callThrough();

    // Act
    component.toggleButton('Identify');

    // Assert
    expect(component.activeButton).toBe('Identify');
    expect(component.onAction).toHaveBeenCalledWith('Identify');

    // Act: desactivar el mismo botón
    component.toggleButton('Identify');

    // Assert
    expect(component.activeButton).toBeNull();
  });
});
