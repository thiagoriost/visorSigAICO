import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LauncherTourComponent } from './launcher-tour.component';

describe('LauncherTourComponent', () => {
  let component: LauncherTourComponent;
  let fixture: ComponentFixture<LauncherTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LauncherTourComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LauncherTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
