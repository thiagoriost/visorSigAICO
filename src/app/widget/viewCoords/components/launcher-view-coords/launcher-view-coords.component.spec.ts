import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LauncherViewCoordsComponent } from './launcher-view-coords.component';

describe('LauncherViewCoordsComponent', () => {
  let component: LauncherViewCoordsComponent;
  let fixture: ComponentFixture<LauncherViewCoordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LauncherViewCoordsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LauncherViewCoordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
