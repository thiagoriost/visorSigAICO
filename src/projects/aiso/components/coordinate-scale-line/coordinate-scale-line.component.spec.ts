import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoordinateScaleLineComponent } from './coordinate-scale-line.component';
import { By } from '@angular/platform-browser';
import { BarraEscalaComponent } from '@app/widget/barraEscala/components/barra-escala/barra-escala.component';
import { ViewCoordsComponent } from '@app/widget/viewCoords/components/view-coords/view-coords.component';

describe('CoordinateScaleLineComponent', () => {
  let component: CoordinateScaleLineComponent;
  let fixture: ComponentFixture<CoordinateScaleLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // En Angular 20 Standalone, importamos los componentes directamente.
      // Si los componentes hijos (BarraEscala) lanzan errores de "Mapa no disponible",
      // podrías necesitar MockComponent(BarraEscalaComponent) de la librería 'ng-mocks'.
      imports: [
        CoordinateScaleLineComponent,
        BarraEscalaComponent,
        ViewCoordsComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CoordinateScaleLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería renderizar dos componentes <app-barra-escala>', () => {
    const barraEscalas = fixture.debugElement.queryAll(
      By.directive(BarraEscalaComponent)
    );
    expect(barraEscalas.length).toBe(2);
  });

  it('debería tener el primer componente <app-barra-escala> con [showDropdown]=false y [showEscalas]=true', () => {
    const barraEscalas = fixture.debugElement.queryAll(
      By.directive(BarraEscalaComponent)
    );
    const firstBarra = barraEscalas[0].componentInstance;

    // Accedemos a la propiedad real, no al atributo del DOM
    expect(firstBarra.showDropdown).toBeFalse();
    expect(firstBarra.showEscalas).toBeTrue();
    expect(firstBarra.scaleType).toBe('scalebar');
  });

  it('debería tener el segundo componente <app-barra-escala> con [showDropdown]=true y [showEscalas]=false', () => {
    const barraEscalas = fixture.debugElement.queryAll(
      By.directive(BarraEscalaComponent)
    );
    const secondBarra = barraEscalas[1].componentInstance;

    expect(secondBarra.showDropdown).toBeTrue();
    expect(secondBarra.showEscalas).toBeFalse();
  });

  it('debería renderizar el componente <app-view-coords>', () => {
    const viewCoords = fixture.debugElement.query(
      By.directive(ViewCoordsComponent)
    );
    expect(viewCoords).toBeTruthy();
  });

  it('debería contener el contenedor principal con clases de PrimeFlex', () => {
    const mainContainer = fixture.debugElement.query(
      By.css('.flex.flex-column')
    );
    expect(mainContainer).not.toBeNull();
  });
});
