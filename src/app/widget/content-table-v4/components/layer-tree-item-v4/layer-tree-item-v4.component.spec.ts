import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerTreeItemV4Component } from './layer-tree-item-v4.component';
import { StoreModule } from '@ngrx/store';

describe('LayerTreeItemV4Component', () => {
  let component: LayerTreeItemV4Component;
  let fixture: ComponentFixture<LayerTreeItemV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerTreeItemV4Component, StoreModule.forRoot({})],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerTreeItemV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
