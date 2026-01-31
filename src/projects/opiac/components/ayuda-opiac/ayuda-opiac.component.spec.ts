import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AyudaOpiacComponent } from './ayuda-opiac.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AyudaOpiacComponent', () => {
  let component: AyudaOpiacComponent;
  let fixture: ComponentFixture<AyudaOpiacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AyudaOpiacComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AyudaOpiacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
