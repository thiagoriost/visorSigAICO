import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayerItemV3Component } from './layer-item-v3.component';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';
import { SimpleChange } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { ToggleSwitchChangeEvent } from 'primeng/toggleswitch';

describe('LayerItemV3Component', () => {
  let component: LayerItemV3Component;
  let fixture: ComponentFixture<LayerItemV3Component>;

  let layerOptionServiceSpy: jasmine.SpyObj<LayerOptionService>;
  const mockLayer: CapaMapa = {
    id: 'ld1',
    urlMetadato: 'http://test-meta.com',
  } as CapaMapa;

  beforeEach(async () => {
    layerOptionServiceSpy = jasmine.createSpyObj('LayerOptionService', [
      'turnOn',
      'turnOff',
      'onChangeActivatedValue',
    ]);

    await TestBed.configureTestingModule({
      imports: [LayerItemV3Component, StoreModule.forRoot({})],
      providers: [
        provideNoopAnimations(),
        { provide: LayerOptionService, useValue: layerOptionServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerItemV3Component);
    component = fixture.componentInstance;
    component.layer = mockLayer;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('Deberia reiniciar el estado de las variables cuando layer.checked es false', () => {
      component.isVisibleLayer = true;
      component.sliderValue = 50;
      component.toggleSwitchValue = true;
      component.ngOnChanges({
        layer: new SimpleChange(
          { ...component.layer, checked: true },
          { ...component.layer, checked: false },
          false
        ),
      });
      expect(component.isVisibleButtonList).toBeFalse();
      expect(component.sliderValue).toBe(0);
      expect(component.toggleSwitchValue).toBeFalse();
    });
  });

  describe('onshowOrOcultMoreOptions', () => {
    it('Deberia alternar isVisibleButtonList', () => {
      expect(component.isVisibleButtonList).toBeFalse();
      component.onshowOrOcultMoreOptions();
      expect(component.isVisibleButtonList).toBeTrue();
      component.onshowOrOcultMoreOptions();
      expect(component.isVisibleButtonList).toBeFalse();
    });
  });

  describe('toggleLayer', () => {
    it('Deberia prender la capa cuando isVisibleLayer es falso', () => {
      component.isVisibleLayer = false;
      const turnOnSpy = spyOn(component, 'onTurnOnLayer');
      component.toggleLayer();
      expect(turnOnSpy).toHaveBeenCalledWith(component.layer as CapaMapa);
      expect(component.isVisibleLayer).toBeTrue();
    });

    it('Deberia apagar la capa cuando isVisibleLayer es verdadero', () => {
      component.isVisibleLayer = true;
      const turnOffSpy = spyOn(component, 'onTurnOffLayer');
      component.toggleLayer();
      expect(turnOffSpy).toHaveBeenCalledWith(component.layer as CapaMapa);
      expect(component.isVisibleLayer).toBeFalse();
    });
  });

  describe('addOrDeleteLayer', () => {
    it('Deberia activar la capa y ajustar las banderas de UI cuando es activado el toggle', () => {
      const event: ToggleSwitchChangeEvent = {
        checked: true,
      } as ToggleSwitchChangeEvent;
      const onChangeSpy = spyOn(component, 'onChangeActivatedValue');
      component.addOrDeleteLayer(event.checked);
      expect(onChangeSpy).toHaveBeenCalledWith(
        component.layer as CapaMapa,
        event.checked
      );
      expect(component.isVisibleLayer).toBeTrue();
    });

    it('Deberia eliminar la capa y reiniciar las banderas para UI cuando es desactivado el toggle', () => {
      const event: ToggleSwitchChangeEvent = {
        checked: false,
      } as ToggleSwitchChangeEvent;
      const onChangeSpy = spyOn(component, 'onChangeActivatedValue');
      component.sliderValue = 50;
      component.isVisibleButtonList = true;
      component.isVisibleLayer = true;
      component.addOrDeleteLayer(event.checked);
      expect(onChangeSpy).toHaveBeenCalledWith(
        component.layer as CapaMapa,
        event.checked
      );
      expect(component.sliderValue).toBe(0);
      expect(component.isVisibleButtonList).toBeFalse();
      expect(component.isVisibleLayer).toBeFalse();
    });
  });
});
