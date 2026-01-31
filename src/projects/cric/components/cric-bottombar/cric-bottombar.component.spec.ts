/**
 * Archivo de pruebas unitarias para CricBottombarComponent.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CricBottombarComponent } from './cric-bottombar.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { MapState } from '@app/core/interfaces/store/map.model';
import { By } from '@angular/platform-browser';
import { Button } from 'primeng/button';
import { BarraEscalaComponent } from '@app/widget/barraEscala/components/barra-escala/barra-escala.component';
import { ViewCoordsComponent } from '@app/widget/viewCoords/components/view-coords/view-coords.component';
import { BuscarDireccionComponent } from '@app/widget/buscarDireccion/components/buscar-direccion/buscar-direccion.component';

describe('CricBottombarComponent', () => {
  let component: CricBottombarComponent;
  let fixture: ComponentFixture<CricBottombarComponent>;
  let store: MockStore<MapState>;
  let dispatchSpy: jasmine.Spy;

  /**
   *  Configuración inicial del TestBed
   * - Se declara el componente bajo prueba
   * - Se provee un MockStore para simular NgRx
   * - Se importan los componentes hijos requeridos en la plantilla
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CricBottombarComponent,
        Button,
        BarraEscalaComponent,
        ViewCoordsComponent,
        BuscarDireccionComponent,
      ],
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(CricBottombarComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    // Se espía el método dispatch del store para verificar las acciones enviadas
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    fixture.detectChanges();
  });

  /**
   * Prueba básica: el componente debe crearse correctamente
   */
  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Verifica que al ejecutar onToggleImprimir()
   */
  it('debería despachar SetSingleComponentWidget con "ExportarMapa3" al llamar onToggleImprimir', () => {
    component.onToggleImprimir();
    expect(store.dispatch).toHaveBeenCalledWith(
      SetSingleComponentWidget({ nombre: 'ExportarMapa3' })
    );
  });

  /**
   * Verifica que al ejecutar onToggleIdentificar()
   * Se despache la acción SetSingleComponentWidget con nombre="Identify"
   */
  it('debería despachar la acción SetSingleComponentWidget al llamar onToggleIdentificar()', () => {
    component.onToggleIdentificar();

    expect(dispatchSpy).toHaveBeenCalledWith(
      SetSingleComponentWidget({ nombre: 'Identify' })
    );
  });

  /**
   * Verifica que al hacer click en el botón de imprimir (<p-button pi-print>)
   * se ejecute el método correspondiente y se despachen las acciones.
   */
  it('debería ejecutar onToggleImprimir() al hacer click en el botón de imprimir', () => {
    // Localiza el botón de imprimir en la plantilla (usa el icono cric-imprimir)
    const botonImprimir = fixture.debugElement.query(
      By.css('p-button[icon="pi cric-imprimir"]')
    );

    // Dispara el evento onClick
    botonImprimir.triggerEventHandler('onClick', null);

    // Verifica que dispatch haya sido llamado al menos una vez con la acción AbrirOverlayWidget
    expect(dispatchSpy).toHaveBeenCalledWith(
      SetSingleComponentWidget({ nombre: 'ExportarMapa3' })
    );
  });

  /**
   * Verifica que al hacer click en el botón de ayuda (<p-button pi-question>)
   * se ejecute el método correspondiente y se despache la acción.
   */
  it('debería ejecutar onToggleAyuda() al hacer click en el botón de identificar', () => {
    // Localiza el botón de ayuda en la plantilla (usa el icono pi-question)
    const botonAyuda = fixture.debugElement.query(
      By.css('p-button[icon="pi cric-identificar"]')
    );

    // Dispara el evento onClick
    botonAyuda.triggerEventHandler('onClick', null);

    // Verifica que dispatch haya sido llamado con SetSingleComponentWidget
    expect(dispatchSpy).toHaveBeenCalledWith(
      SetSingleComponentWidget({ nombre: 'Identify' })
    );
  });
});
