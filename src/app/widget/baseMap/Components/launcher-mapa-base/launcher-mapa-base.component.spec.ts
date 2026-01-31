import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LauncherMapaBaseComponent } from './launcher-mapa-base.component';

describe('LauncherMapaBAseComponent', () => {
  let component: LauncherMapaBaseComponent;
  let fixture: ComponentFixture<LauncherMapaBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LauncherMapaBaseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LauncherMapaBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
