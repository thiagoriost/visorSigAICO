import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaLocalizacionLineaNegraComponent } from './mapa-localizacion-linea-negra.component';

describe('MapaLocalizacionLineaNegraComponent', () => {
  let component: MapaLocalizacionLineaNegraComponent;
  let fixture: ComponentFixture<MapaLocalizacionLineaNegraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaLocalizacionLineaNegraComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapaLocalizacionLineaNegraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
