import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTableOneAndWorkAreaComponent } from './content-table-one-and-work-area.component';
import { StoreModule } from '@ngrx/store';

describe('ContentTableOneAndWorkAreaComponent', () => {
  let component: ContentTableOneAndWorkAreaComponent;
  let fixture: ComponentFixture<ContentTableOneAndWorkAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentTableOneAndWorkAreaComponent, StoreModule.forRoot({})],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentTableOneAndWorkAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
