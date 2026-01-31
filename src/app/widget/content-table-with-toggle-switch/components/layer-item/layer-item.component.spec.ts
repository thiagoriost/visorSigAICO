import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerItemComponent } from './layer-item.component';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';
import { StoreModule } from '@ngrx/store';

describe('LayerItemComponent', () => {
  let component: LayerItemComponent;
  let fixture: ComponentFixture<LayerItemComponent>;

  const mockLayer: CapaMapa = {
    id: 'test-layer',
    titulo: 'Capa de prueba',
    checked: true,
    leaf: true,
    Result: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LayerItemComponent,
        ReactiveFormsModule,
        ToggleSwitchModule,
        StoreModule.forRoot({}),
      ],
      providers: [LayerOptionService],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerItemComponent);
    component = fixture.componentInstance;
    component.layer = { ...mockLayer }; // clonar por si acaso
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con el valor de la capa (checked)', () => {
    component.layer = mockLayer;
    component.ngOnInit();
    expect(component.isActivated).toBe(true);
  });
});
