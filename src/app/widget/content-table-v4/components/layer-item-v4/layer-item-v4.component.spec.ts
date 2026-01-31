import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerItemV4Component } from './layer-item-v4.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MapState } from '@app/core/interfaces/store/map.model';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MapActions } from '@app/core/store/map/map.actions';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';

describe('LayerItemV4Component', () => {
  let component: LayerItemV4Component;
  let fixture: ComponentFixture<LayerItemV4Component>;
  let store: MockStore<MapState>;
  const mockLayer: CapaMapa = {
    id: '1',
    nombre: 'Capa de prueba',
    checked: true,
    urlMetadato: 'http://test.com/metadato',
  } as CapaMapa;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerItemV4Component, ReactiveFormsModule],
      providers: [FormBuilder, provideMockStore(), LayerOptionService],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerItemV4Component);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    // asignar la capa de prueba al input
    component.layer = mockLayer;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('deberia inicializar el formulario con el valor en true de la capa', () => {
    component.ngOnInit();
    //expect(component.formGroup.get('isActivated')?.value).toBe(true);
    //expect(component.formGroup.get('transparency')?.value).toBe(0);
  });

  it('deberia disparar  addLayerToMap() cuando isActivated esté configurado como verdadero', () => {
    spyOn(store, 'dispatch');
    component.ngOnInit();
    component.isActivated = true;
    component.onAddLayer(mockLayer);
    expect(store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: MapActions.addLayerToMap.type,
      })
    );
  });

  it('deberia disparar deleteLayerOfMap() cuando isActivated esté configurado como falso', () => {
    spyOn(store, 'dispatch');
    component.ngOnInit();
    component.isActivated = false;
    component.onDeleteLayer(mockLayer);
    expect(store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: MapActions.deleteLayerOfMap.type,
      })
    );
    expect(component.isActivated).toBeFalse();
    expect(component.transparencyLevel === 0);
  });

  it('deberia disparar setLayerTransparency() cuando cambie el valor de transparencia', () => {
    spyOn(store, 'dispatch');
    component.ngOnInit();
    component.transparencyLevel = 30;
    component.onChangeSliderValue(mockLayer, component.transparencyLevel);
    expect(store.dispatch).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: MapActions.setLayerTransparency.type,
        layer: mockLayer,
        transparencyLevel: 70, // porque 100 - 30
      })
    );
  });

  it('deberia llamar a window.open() cuando se activa onShowMetadata()', () => {
    spyOn(window, 'open');
    component.onShowMetadata(mockLayer);
    expect(window.open).toHaveBeenCalledWith(mockLayer.urlMetadato, 'blank');
  });
});
