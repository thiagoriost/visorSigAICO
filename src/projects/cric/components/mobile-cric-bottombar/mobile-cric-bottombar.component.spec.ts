import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileCricBottombarComponent } from './mobile-cric-bottombar.component';

import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MapState } from '@app/core/interfaces/store/map.model';

describe('MobileCricBottombarComponent', () => {
  let component: MobileCricBottombarComponent;
  let fixture: ComponentFixture<MobileCricBottombarComponent>;
  let store: MockStore<MapState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Importamos el componente standalone directamente
      imports: [MobileCricBottombarComponent],
      // Registramos un Store falso para que el componente no falle
      providers: [provideMockStore()],
    }).compileComponents();

    // Creamos la instancia del fixture (contenedor de pruebas del componente)
    fixture = TestBed.createComponent(MobileCricBottombarComponent);
    // Obtenemos la instancia real del componente
    component = fixture.componentInstance;
    // Obtenemos también la referencia del mock del Store
    store = TestBed.inject(MockStore);
    // Detectamos los cambios iniciales para que Angular renderice la vista
    fixture.detectChanges();
  });

  it('should create', () => {
    // Verificamos que el componente se crea correctamente
    expect(component).toBeTruthy();
  });

  it('debería inicializar items en ngOnInit', () => {
    // Forzamos la llamada manual a ngOnInit
    component.ngOnInit();
    // Verificamos que items no sea null
    expect(component.items).not.toBeNull();
    // Verificamos que haya 3 opciones en el menú
    expect(component.items?.length).toBe(3);
  });

  it('debería despachar la acción al ejecutar onToggleImprimir', () => {
    // Espiamos el método dispatch del store
    const dispatchSpy = spyOn(store, 'dispatch');
    // Llamamos el método del componente
    component.onToggleImprimir();
    // Verificamos que haya despachado una acción con el nombre correcto
    expect(dispatchSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ nombre: 'ExportarMapa3' })
    );
  });

  it('debería despachar la acción al ejecutar onToggleIdentificar', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    component.onToggleIdentificar();
    expect(dispatchSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ nombre: 'Identify' })
    );
  });

  it('debería despachar la acción al ejecutar onToggLeyenda', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    component.onToggLeyenda();
    expect(dispatchSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ nombre: 'Leyenda V2' })
    );
  });
});
