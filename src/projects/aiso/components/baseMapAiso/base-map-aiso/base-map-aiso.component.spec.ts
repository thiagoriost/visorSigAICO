import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseMapAisoComponent } from './base-map-aiso.component';
import { StoreModule } from '@ngrx/store';

describe('BaseMapAisoComponent', () => {
  let component: BaseMapAisoComponent;
  let fixture: ComponentFixture<BaseMapAisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseMapAisoComponent, StoreModule.forRoot({})],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseMapAisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
