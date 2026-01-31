import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AyudaCricComponent } from './ayuda-cric.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AyudaOpiacComponent', () => {
  let component: AyudaCricComponent;
  let fixture: ComponentFixture<AyudaCricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AyudaCricComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AyudaCricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
