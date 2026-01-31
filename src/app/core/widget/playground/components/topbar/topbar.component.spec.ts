import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopbarComponent } from './topbar.component';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { WidgetItemFuncionState } from '@app/core/interfaces/store/user-interface.model';
import { Type } from '@angular/core';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let storeSpy: jasmine.SpyObj<Store<unknown>>;

  beforeEach(async () => {
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Store, useValue: storeSpy },
        { provide: UserInterfaceService, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe emitir evento al hacer toggleSidebar()', () => {
    spyOn(component.sidebarToggle, 'emit');
    component.toggleSidebar();
    expect(component.sidebarToggle.emit).toHaveBeenCalled();
  });

  it('debe alternar y emitir isSecondSectionVisible en toggleSecondSection()', () => {
    component.isSecondSectionVisible = false;
    spyOn(component.isSecondSectionVisibleChange, 'emit');
    component.toggleSecondSection();
    expect(component.isSecondSectionVisible).toBeTrue();
    expect(component.isSecondSectionVisibleChange.emit).toHaveBeenCalledWith(
      true
    );
  });

  it('debe alternar mostrarDetalle en toggleDetalle()', () => {
    component.mostrarDetalle = true;
    component.toggleDetalle();
    expect(component.mostrarDetalle).toBeFalse();
    component.toggleDetalle();
    expect(component.mostrarDetalle).toBeTrue();
  });

  it('debe emitir evento con nombre del widget en abrirWidget()', () => {
    const widget: WidgetItemFuncionState = {
      nombreWidget: 'TestWidget',
      titulo: 'Título de prueba',
      ruta: 'ruta/test',
      importarComponente: () => Promise.resolve({} as Type<unknown>),
      abierto: true,
    };
    spyOn(component.openWidget, 'emit');
    component.abrirWidget(widget);
    expect(component.openWidget.emit).toHaveBeenCalledWith('TestWidget');
  });

  it('debe guardar configuración en localStorage y mostrar mensaje', () => {
    const testWidgets = [
      { nombreWidget: 'W1', abierto: true },
      { nombreWidget: 'W2', abierto: true },
    ] as WidgetItemFuncionState[];

    component.widgetsActivos = testWidgets;
    component.saveWidgetsConfig();

    const stored = localStorage.getItem('widgetConfig');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.widgetsActivos).toEqual(['W1', 'W2']);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        summary: 'Configuración guardada',
      })
    );
  });
});
