import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeftbarHeaderComponent } from './leftbar-header.component';
import { By } from '@angular/platform-browser';
import { Image } from 'primeng/image';

describe('LeftbarHeaderComponent', () => {
  let component: LeftbarHeaderComponent;
  let fixture: ComponentFixture<LeftbarHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftbarHeaderComponent, Image],
    }).compileComponents();

    fixture = TestBed.createComponent(LeftbarHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener isMobile en false por defecto', () => {
    expect(component.isMobile).toBeFalse();
  });

  it('debería renderizar el logo del SIG CRIC con la ruta correcta', () => {
    const logoElement = fixture.debugElement.query(By.css('p-image'));
    expect(logoElement).toBeTruthy();

    const imageInstance = logoElement.componentInstance as Image;
    expect(imageInstance.src).toBe('assets/images/Logo_SIG_CRIC-01.png');
  });

  it('debería permitir actualizar el valor de isMobile desde el exterior', () => {
    component.isMobile = true;
    fixture.detectChanges();
    expect(component.isMobile).toBeTrue();
  });
});
