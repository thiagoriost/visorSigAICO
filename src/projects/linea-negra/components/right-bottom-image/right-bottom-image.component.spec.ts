import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightBottomImageComponent } from './right-bottom-image.component';

describe('RightBottomImageComponent', () => {
  let component: RightBottomImageComponent;
  let fixture: ComponentFixture<RightBottomImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightBottomImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RightBottomImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deberia retornar las propiedades correctamente cuando isMobile es verdadera', () => {
    const mockResult = { width: '250', height: '500' };
    component.isMobile = true;
    expect(component.getImageSize()).toEqual(mockResult);
  });

  it('deberia retornar las propiedades correctamente cuando isMobile es falsa', () => {
    const mockResult = { width: '300', height: '1000' };
    component.isMobile = false;
    expect(component.getImageSize()).toEqual(mockResult);
  });
});
