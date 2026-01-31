import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadmeModalComponent } from './readme-modal.component';
// import { MarkdownModule } from 'ngx-markdown';
import { DialogModule } from 'primeng/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

describe('ReadmeModalComponent', () => {
  let component: ReadmeModalComponent;
  let fixture: ComponentFixture<ReadmeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReadmeModalComponent,
        DialogModule,
        BrowserAnimationsModule,
        HttpClientModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReadmeModalComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show dialog when visible is true', () => {
    component.visible = true;
    component.readmeUrl = 'assets/test-readme.md';
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('p-dialog');
    expect(dialog).toBeTruthy();
  });
});
