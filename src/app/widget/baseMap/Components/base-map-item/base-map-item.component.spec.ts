import { TestBed } from '@angular/core/testing';
import { BaseMapItemComponent } from './base-map-item.component';
import { StoreModule } from '@ngrx/store';

describe('BaseMapItemComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseMapItemComponent, StoreModule.forRoot({})],
    }).compileComponents();
  });

  it('should create', () => {
    expect(BaseMapItemComponent).toBeTruthy();
  });
});
