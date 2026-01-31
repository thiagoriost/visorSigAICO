import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { FloatingMapControlsComponent } from './floating-map-controls.component';

describe('FloatingMapControlsComponent', () => {
  let component: FloatingMapControlsComponent;
  let fixture: ComponentFixture<FloatingMapControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingMapControlsComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingMapControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería aplicar la clase "movil" cuando isSmallScreen es true', () => {
    component.isSmallScreen = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const divElement = compiled.querySelector('.floating-map-controls');
    expect(divElement?.classList).toContain('movil');
  });
});
