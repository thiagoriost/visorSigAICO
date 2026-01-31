import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayerItemWithLegendComponent } from './layer-item-with-legend.component';
import { Store } from '@ngrx/store';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { MapState } from '@app/core/interfaces/store/map.model';
import * as layersActions from '@app/core/store/map/map.actions';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';

describe('LayerItemWithLegendComponent', () => {
  let component: LayerItemWithLegendComponent;
  let fixture: ComponentFixture<LayerItemWithLegendComponent>;
  let storeSpy: jasmine.SpyObj<Store<MapState>>;

  const mockLayer: LayerStore = {
    layerDefinition: {
      id: '1',
      titulo: 'Layer 1',
      leaf: true,
      urlMetadato: 'https://example.com/metadata',
    },
    layerLevel: LayerLevel.INTERMEDIATE,
    isVisible: true,
    orderInMap: 1,
    transparencyLevel: 50,
  };

  beforeEach(async () => {
    const storeMock = jasmine.createSpyObj('Store', ['dispatch']);

    await TestBed.configureTestingModule({
      imports: [LayerItemWithLegendComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: Store, useValue: storeMock },
        LayerOptionService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerItemWithLegendComponent);
    component = fixture.componentInstance;

    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store<MapState>>;
    component.layer = mockLayer;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia disparar setLayerTransparency() cuando cambia la transparencia de la capa', () => {
    component.layer = mockLayer;
    component.onChangeSliderValue(mockLayer.layerDefinition, 30);
    component.transparencyValue = 30;
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      layersActions.MapActions.setLayerTransparency({
        layer: mockLayer.layerDefinition,
        transparencyLevel: 70,
      })
    );
  });

  it('Deberia disparar deleteLayerFromMap() y emitir el evento cuando se elimina la capa', () => {
    component.layer = mockLayer;
    component.onDeleteLayer(mockLayer.layerDefinition);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      layersActions.MapActions.deleteLayerOfMap({
        layer: mockLayer.layerDefinition,
      })
    );
  });

  it('Deberia disparar showOrOcultLayerOnMap() cuando se muestra/oculta la capa', () => {
    component.layer = mockLayer;
    component.onTurnOnLayer(mockLayer.layerDefinition);
    expect(storeSpy.dispatch).toHaveBeenCalledWith(
      layersActions.MapActions.showOrHideLayerOfMap({
        layer: mockLayer.layerDefinition,
      })
    );
  });

  it('Deberia abrir la URL de metadatos cuando se presiona la opcion', () => {
    spyOn(window, 'open'); // Espejeamos la función window.open
    component.layer = mockLayer;
    component.onShowMetadata(mockLayer.layerDefinition);
    expect(window.open).toHaveBeenCalledWith(
      mockLayer.layerDefinition.urlMetadato,
      'blank'
    );
  });

  it('Deberia ajustar el valor de la URL de leyenda en NULL cuando se destruye el componente', () => {
    component.legendUrl = 'http://fake.url/legend.png';
    component.ngOnDestroy();
    expect(component.legendUrl).toBeNull();
  });

  it('Deberia cambiar el valor de la visibilidad de la capa cuando se acciona el boton de Ver/Ocultar la leyenda', () => {
    component.isLegendVisible = false;
    component.onChangeLegendVisibility();
    expect(component.isLegendVisible).toBeTrue();
  });
});
