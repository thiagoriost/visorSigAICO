import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ExportMap2WrapperComponent } from './export-map2-wrapper.component';
import { selectOverlayWidgetStatus } from '@app/core/store/user-interface/user-interface.selectors';
import { ExportMap2Component } from '@app/widget/export-map2/components/export-map2/export-map2.component';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ExportMap2WrapperComponent', () => {
  let component: ExportMap2WrapperComponent;
  let fixture: ComponentFixture<ExportMap2WrapperComponent>;
  let store: MockStore;

  // Define la instancia específica del selector una vez para reutilizarla en las pruebas
  const exportMap2StatusSelector = selectOverlayWidgetStatus('ExportarMapa2');

  // Estado inicial del store para las pruebas, solo con las propiedades relevantes para el selector
  const initialState = {
    userInterface: {
      overlayWidgets: [
        { nombreWidget: 'ExportarMapa2', visible: false, abierto: false },
      ],
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ExportMap2WrapperComponent,
        ExportMap2Component,
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ], // Importa el componente wrapper y el componente que renderiza
      providers: [
        provideMockStore({ initialState }), // Provee un mock del store de NgRx
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportMap2WrapperComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore); // Inyecta el mock del store

    // Asegura que el estado inicial del componente sea oculto
    store.overrideSelector(exportMap2StatusSelector, false);

    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initially hide ExportMap2Component', () => {
    expect(component.isExportMapVisible).toBeFalse();
    const exportMap2Element = fixture.debugElement.query(
      By.css('app-export-map2')
    );
    expect(exportMap2Element).toBeNull(); // Asegura que el componente no esté en el DOM
  });

  it('should show ExportMap2Component when its status becomes true', () => {
    // Simula que el selector emite 'true'
    // En lugar de overrideSelector, actualizamos el estado completo para que el selector se re-evalúe
    store.setState({
      userInterface: {
        overlayWidgets: [{ nombreWidget: 'ExportarMapa2', abierto: true }],
      },
    });
    fixture.detectChanges(); // Detecta los cambios en el componente

    expect(component.isExportMapVisible).toBeTrue();
    const exportMap2Element = fixture.debugElement.query(
      By.css('app-export-map2')
    );
    expect(exportMap2Element).not.toBeNull(); // Asegura que el componente esté en el DOM
  });

  it('should destroy ExportMap2Component when its status becomes false', () => {
    // Primero, hazlo visible
    store.setState({
      userInterface: {
        overlayWidgets: [{ nombreWidget: 'ExportarMapa2', abierto: true }],
      },
    });
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('app-export-map2'))
    ).not.toBeNull();

    // Luego, hazlo invisible
    store.setState({
      userInterface: {
        overlayWidgets: [{ nombreWidget: 'ExportarMapa2', abierto: false }],
      },
    });
    fixture.detectChanges();

    expect(component.isExportMapVisible).toBeFalse();
    const exportMap2Element = fixture.debugElement.query(
      By.css('app-export-map2')
    );
    expect(exportMap2Element).toBeNull(); // Asegura que el componente ya no esté en el DOM
  });

  it('should complete the destroy$ subject on ngOnDestroy', () => {
    const destroySpy = spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(destroySpy).toHaveBeenCalled();
  });
});
