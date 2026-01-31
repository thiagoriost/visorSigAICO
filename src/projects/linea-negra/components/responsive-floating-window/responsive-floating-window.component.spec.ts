import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsiveFloatingWindowComponent } from './responsive-floating-window.component';

describe('ResponsiveFloatingWindowComponent', () => {
  let component: ResponsiveFloatingWindowComponent;
  let fixture: ComponentFixture<ResponsiveFloatingWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsiveFloatingWindowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponsiveFloatingWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
