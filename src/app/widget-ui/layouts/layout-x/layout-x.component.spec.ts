import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutXComponent } from './layout-x.component';

describe('LayoutXComponent', () => {
  let component: LayoutXComponent;
  let fixture: ComponentFixture<LayoutXComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutXComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutXComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
