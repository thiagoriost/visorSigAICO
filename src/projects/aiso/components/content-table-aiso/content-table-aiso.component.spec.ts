import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentTableAisoComponent } from './content-table-aiso.component';
import { StoreModule } from '@ngrx/store';

@Component({
  selector: 'app-content-table-and-work-area',
  standalone: true,
  template: '<p>Mock Work Area Component</p>',
})
class MockContentTableAndWorkAreaComponent {}

describe('ContentTableAisoComponent', () => {
  let component: ContentTableAisoComponent;
  let fixture: ComponentFixture<ContentTableAisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContentTableAisoComponent,
        MockContentTableAndWorkAreaComponent,
        StoreModule.forRoot({}),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentTableAisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('Debería renderizar el componente hijo <app-content-table-and-work-area>', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const child = compiled.querySelector('app-content-table-and-work-area');
    expect(child).toBeTruthy();
  });
});
