import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageListRendererComponent } from './image-list-renderer.component';

describe('ImageListRendererComponent', () => {
  let component: ImageListRendererComponent;
  let fixture: ComponentFixture<ImageListRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageListRendererComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageListRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive Inputs correctly', () => {
    component.emptyListMessage = 'Sin imagenes para mostrar';
    component.textColorClass = 'text-blue';
    component.urlImageList = ['https://www.mock.com/assets/image1.png'];

    expect(component.emptyListMessage).toBe('Sin imagenes para mostrar');
    expect(component.textColorClass).toBe('text-blue');
    expect(component.urlImageList.length).toBe(1);
  });
});
