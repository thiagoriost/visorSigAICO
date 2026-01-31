import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkareaDropdownSelectComponent } from './workarea-dropdown-select.component';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { StoreModule } from '@ngrx/store';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

describe('WorkareaDropdownSelectComponent', () => {
  let component: WorkareaDropdownSelectComponent;
  let fixture: ComponentFixture<WorkareaDropdownSelectComponent>;
  const mockData: CapaMapa[] = [
    { id: '1', titulo: 'Option 1', leaf: true },
    { id: '2', titulo: 'Option 2', leaf: true },
  ];
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkareaDropdownSelectComponent, StoreModule.forRoot({})],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkareaDropdownSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia mostrar un mensaje en el componente (placeholder) ', () => {
    component.placeholder = 'Select an option';
    component.optionLabel = 'titulo';
    component.dataKey = 'id';
    component.layerList = mockData;
    fixture.detectChanges();
    expect(component.placeholder).toBe('Select an option');
  });

  it('Deberia ajustar el valor cuando se selecciona un elemento', () => {
    const event = {
      originalEvent: new Event(''),
      value: { id: '1', titulo: 'Option 1', leaf: true } as CapaMapa,
    };
    component.onSelectObject(event);
    expect(component.value).toEqual(event.value);
  });

  it('Deberia deshabilitar el input cuando se cambia el valor de disabled', () => {
    component.setDisabledState(true);
    expect(component.isDisabled).toEqual(true);
  });

  it('Deberia cambiar el valor cuando se invoca la funcion writeValue de ControlValueAccessor', () => {
    const value: CapaMapa = {
      id: '1',
      titulo: 'Option 1',
      leaf: true,
    } as CapaMapa;
    component.writeValue(value);
    expect(component.value).toEqual(value);
  });

  it('Deberia cambiar el valor a null cuando se invoca la funcion writeValue de ControlValueAccessor con un valor nulo', () => {
    component.writeValue(null);
    expect(component.value).toEqual(null);
  });

  it('Deberia convertir una lista de capas del store a una lista de CapaMapa', () => {
    const mockLayerStoreList: LayerStore[] = [
      {
        layerDefinition: { id: '1', nombre: 'Layer 1', titulo: '', leaf: true },
        isVisible: true,
        layerLevel: LayerLevel.INTERMEDIATE,
        orderInMap: 1,
        transparencyLevel: 0,
      },
      {
        layerDefinition: { id: '2', nombre: 'Layer 2', titulo: '', leaf: true },
        isVisible: true,
        layerLevel: LayerLevel.INTERMEDIATE,
        orderInMap: 2,
        transparencyLevel: 0,
      },
    ];

    const expectedResult: CapaMapa[] = [
      { id: '1', nombre: 'Layer 1', titulo: '', leaf: true },
      { id: '2', nombre: 'Layer 2', titulo: '', leaf: true },
    ];

    const result =
      component.convertLayerStoreListToCapaMapaList(mockLayerStoreList);
    expect(result).toEqual(expectedResult);
  });
});
