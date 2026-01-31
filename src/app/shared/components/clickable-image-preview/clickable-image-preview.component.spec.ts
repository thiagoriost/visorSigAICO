import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageModule } from 'primeng/image';
import { MessageModule } from 'primeng/message';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ClickableImagePreviewComponent } from './clickable-image-preview.component';

describe('ClickableImagePreviewComponent', () => {
  let component: ClickableImagePreviewComponent;
  let fixture: ComponentFixture<ClickableImagePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ClickableImagePreviewComponent,
        ImageModule,
        MessageModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClickableImagePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an error message for an invalid URL', () => {
    component.imageUrl = 'not-a-valid-url';
    component.ngOnChanges({
      imageUrl: {
        currentValue: 'not-a-valid-url',
        previousValue: '',
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();

    const messageElement = fixture.nativeElement.querySelector('p-message');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent).toContain(
      'URL de la imagen no es válida'
    );
  });

  it('should show the image for a valid URL', () => {
    const validUrl =
      'https://www.primefaces.org/primeng/showcase/assets/showcase/images/galleria/galleria1.jpg';
    component.imageUrl = validUrl;
    component.ngOnChanges({
      imageUrl: {
        currentValue: validUrl,
        previousValue: '',
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();

    const imageElement = fixture.nativeElement.querySelector('p-image');
    const messageElement = fixture.nativeElement.querySelector('p-message');

    expect(imageElement).toBeTruthy();
    expect(messageElement).toBeFalsy();
  });
});
