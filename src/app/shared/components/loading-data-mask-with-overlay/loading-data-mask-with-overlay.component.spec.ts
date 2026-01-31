import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingDataMaskWithOverlayComponent } from './loading-data-mask-with-overlay.component';

describe('LoadingDataMaskWithOverlayComponent', () => {
  let component: LoadingDataMaskWithOverlayComponent;
  let fixture: ComponentFixture<LoadingDataMaskWithOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingDataMaskWithOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingDataMaskWithOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
