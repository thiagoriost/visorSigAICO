import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AyudaLineaNegraComponent } from './ayuda-linea-negra.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AyudaLineaNegraComponent', () => {
  let component: AyudaLineaNegraComponent;
  let fixture: ComponentFixture<AyudaLineaNegraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AyudaLineaNegraComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AyudaLineaNegraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
