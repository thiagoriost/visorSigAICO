import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaBaseLineaNegraComponent } from './mapa-base-linea-negra.component';
import { StoreModule } from '@ngrx/store';

describe('MapaBaseLineaNegraComponent', () => {
  let component: MapaBaseLineaNegraComponent;
  let fixture: ComponentFixture<MapaBaseLineaNegraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaBaseLineaNegraComponent, StoreModule.forRoot({})],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaBaseLineaNegraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
