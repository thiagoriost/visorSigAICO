import { ComponentFixture, TestBed } from '@angular/core/testing';

import { indexPageComponent } from './index-page.component';

describe('indexPageComponent', () => {
  let component: indexPageComponent;
  let fixture: ComponentFixture<indexPageComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [indexPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(indexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
