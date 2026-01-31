import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTableAndWorkAreaComponent } from './content-table-and-work-area.component';
import { StoreModule } from '@ngrx/store';

describe('ContentTableAndWorkAreaComponent', () => {
  let component: ContentTableAndWorkAreaComponent;
  let fixture: ComponentFixture<ContentTableAndWorkAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentTableAndWorkAreaComponent, StoreModule.forRoot({})],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentTableAndWorkAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia inicializar isLegendVisible en falso', () => {
    expect(component.isLegendVisible).toBeFalse();
  });
});
