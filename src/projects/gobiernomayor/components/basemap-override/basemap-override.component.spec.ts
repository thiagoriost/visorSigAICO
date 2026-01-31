import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasemapOverrideComponent } from './basemap-override.component';

describe('BasemapOverrideComponent', () => {
  let component: BasemapOverrideComponent;
  let fixture: ComponentFixture<BasemapOverrideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasemapOverrideComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BasemapOverrideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
