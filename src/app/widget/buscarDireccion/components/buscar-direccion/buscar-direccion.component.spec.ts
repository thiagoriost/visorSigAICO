import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { BuscarDireccionComponent } from './buscar-direccion.component';
import { BuscarDireccionService } from '@app/widget/buscarDireccion/services/buscar-direccion.service';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Direccion } from '@app/widget/buscarDireccion/interfaces/direccion.interface';
import { Subject } from 'rxjs';

describe('BuscarDireccionComponent', () => {
  let component: BuscarDireccionComponent;
  let fixture: ComponentFixture<BuscarDireccionComponent>;
  let buscarDireccionServiceSpy: jasmine.SpyObj<BuscarDireccionService>;
  let direccionSugeridaSubject: Subject<Direccion[]>;

  beforeEach(async () => {
    direccionSugeridaSubject = new Subject<Direccion[]>();

    buscarDireccionServiceSpy = jasmine.createSpyObj('BuscarDireccionService', [
      'buscarDireccionPorTexto',
      'buscarDireccionSeleccionada',
    ]);
    buscarDireccionServiceSpy.direccionSugerida = direccionSugeridaSubject;

    await TestBed.configureTestingModule({
      imports: [FormsModule, AutoCompleteModule, BuscarDireccionComponent],
    })
      .overrideComponent(BuscarDireccionComponent, {
        set: {
          providers: [
            {
              provide: BuscarDireccionService,
              useValue: buscarDireccionServiceSpy,
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BuscarDireccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería filtrar las direcciones cuando se ingresa texto', fakeAsync(() => {
    const mockDirecciones: Direccion[] = [
      { label: 'Dirección 1', placeId: '1', lat: '1', lon: '1' },
      { label: 'Dirección 2', placeId: '2', lat: '2', lon: '2' },
    ];
    const event = { query: 'Dir' };

    component.filterItems(event);
    direccionSugeridaSubject.next(mockDirecciones);
    tick();
    fixture.detectChanges();

    expect(component.filteredItems.length).toBe(2);
    expect(component.filteredItems[0].label).toBe('Dirección 1');
    expect(component.filteredItems[1].label).toBe('Dirección 2');
  }));

  it('debería limpiar las sugerencias cuando no se ingresa texto', fakeAsync(() => {
    const event = { query: '' };
    component.filterItems(event);
    fixture.detectChanges();
    expect(component.filteredItems.length).toBe(0);
  }));

  it('debería llamar al servicio cuando se selecciona una dirección', fakeAsync(() => {
    const mockDireccion: Direccion = {
      label: 'Dirección 1',
      placeId: '1',
      lat: '1',
      lon: '1',
    };

    component.selectedItem = mockDireccion;
    component.onDireccionSeleccionada();

    expect(
      buscarDireccionServiceSpy.buscarDireccionSeleccionada
    ).toHaveBeenCalledWith(mockDireccion);
  }));
});
