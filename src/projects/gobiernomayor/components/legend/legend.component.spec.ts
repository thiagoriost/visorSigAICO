import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { LegendComponent } from './legend.component';

describe('LegendComponent', () => {
  let fixture: ComponentFixture<LegendComponent>;
  let component: LegendComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegendComponent, NoopAnimationsModule], // standalone
      providers: [
        provideMockStore({ initialState: {} }), // 👈 mock del Store
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
