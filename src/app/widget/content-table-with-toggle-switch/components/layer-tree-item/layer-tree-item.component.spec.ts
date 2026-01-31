import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerTreeItemComponent } from './layer-tree-item.component';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerItemComponent } from '../layer-item/layer-item.component';
import { By } from '@angular/platform-browser';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';
import { StoreModule } from '@ngrx/store';

describe('LayerTreeItemComponent', () => {
  let component: LayerTreeItemComponent;
  let fixture: ComponentFixture<LayerTreeItemComponent>;
  const mockLayer: CapaMapa = {
    id: 'layer1',
    titulo: 'Capa de prueba',
    leaf: true,
    checked: true,
    Result: [],
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LayerTreeItemComponent,
        LayerItemComponent,
        StoreModule.forRoot({}),
      ],
      providers: [LayerOptionService],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerTreeItemComponent);
    component = fixture.componentInstance;
    component.layerToRender = mockLayer;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería renderizar el componente hijo LayerItemComponent', () => {
    const layerItemDebug = fixture.debugElement.query(
      By.directive(LayerItemComponent)
    );
    expect(layerItemDebug).toBeTruthy();
  });

  it('debería pasar correctamente la capa al componente hijo', () => {
    const layerItemDebug = fixture.debugElement.query(
      By.directive(LayerItemComponent)
    );
    const layerItemInstance =
      layerItemDebug.componentInstance as LayerItemComponent;

    expect(layerItemInstance.layer).toEqual(mockLayer);
  });
});
