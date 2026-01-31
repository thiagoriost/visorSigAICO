import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutDComponent } from './layout-d.component';

// Componente host para proyectar contenido en los slots de LayoutDComponent
@Component({
  template: `
    <app-layout-d>
      <div slot-left-sidebar id="left">Left Sidebar</div>
      <div slot-header id="header">Header</div>
      <div id="map">Mapa principal</div>
      <div slot-footer id="footer">Footer</div>
      <div slot-right-sidebar id="right">Right Sidebar</div>
    </app-layout-d>
  `,
  standalone: true,
  imports: [LayoutDComponent],
})
class TestHostComponent {}

describe('LayoutDComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('debería crearse el componente host con LayoutDComponent', () => {
    const host = fixture.componentInstance;
    expect(host).toBeTruthy();
  });

  it('debería renderizar el sidebar izquierdo en el slot correspondiente', () => {
    const leftSidebar = fixture.nativeElement.querySelector('#left');
    expect(leftSidebar).toBeTruthy();
    expect(leftSidebar.textContent).toContain('Left Sidebar');
  });

  it('debería renderizar el header en el slot correspondiente', () => {
    const header = fixture.nativeElement.querySelector('#header');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('Header');
  });

  it('debería renderizar el contenido principal (mapa)', () => {
    const map = fixture.nativeElement.querySelector('#map');
    expect(map).toBeTruthy();
    expect(map.textContent).toContain('Mapa principal');
  });

  it('debería renderizar el footer en el slot correspondiente', () => {
    const footer = fixture.nativeElement.querySelector('#footer');
    expect(footer).toBeTruthy();
    expect(footer.textContent).toContain('Footer');
  });

  it('debería renderizar el sidebar derecho en el slot correspondiente', () => {
    const rightSidebar = fixture.nativeElement.querySelector('#right');
    expect(rightSidebar).toBeTruthy();
    expect(rightSidebar.textContent).toContain('Right Sidebar');
  });
});
