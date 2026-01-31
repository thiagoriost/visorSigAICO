import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourUiOpiacComponent } from './tour-ui-opiac.component';

describe('TourUiOpiacComponent', () => {
  let component: TourUiOpiacComponent;
  let fixture: ComponentFixture<TourUiOpiacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourUiOpiacComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TourUiOpiacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
