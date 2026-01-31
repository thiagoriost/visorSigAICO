import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineaNegraMapNavButtonsComponent } from './linea-negra-map-nav-buttons.component';
import { StoreModule } from '@ngrx/store';

describe('LineaNegraMapNavButtonsComponent', () => {
  let component: LineaNegraMapNavButtonsComponent;
  let fixture: ComponentFixture<LineaNegraMapNavButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineaNegraMapNavButtonsComponent, StoreModule.forRoot({})],
    }).compileComponents();

    fixture = TestBed.createComponent(LineaNegraMapNavButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
