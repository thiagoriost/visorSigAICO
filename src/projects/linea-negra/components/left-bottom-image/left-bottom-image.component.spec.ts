import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftBottomImageComponent } from './left-bottom-image.component';

describe('LeftBottomImageComponent', () => {
  let component: LeftBottomImageComponent;
  let fixture: ComponentFixture<LeftBottomImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftBottomImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LeftBottomImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deberia retornar las propiedades correctamente cuando isMobile es verdadera', () => {
    const mockResult = { width: '250', height: '250' };
    component.isMobile = true;
    expect(component.getImageSize()).toEqual(mockResult);
  });

  it('deberia retornar las propiedades correctamente cuando isMobile es falsa', () => {
    const mockResult = { width: '400', height: '400' };
    component.isMobile = false;
    expect(component.getImageSize()).toEqual(mockResult);
  });
});
