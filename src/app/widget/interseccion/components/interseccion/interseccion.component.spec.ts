import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterseccionComponent } from './interseccion.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('InterseccionComponent', () => {
  let component: InterseccionComponent;
  let fixture: ComponentFixture<InterseccionComponent>;

  const storeMock = {
    select: jasmine.createSpy().and.returnValue(of([])),
    dispatch: jasmine.createSpy(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterseccionComponent, BrowserAnimationsModule],
      providers: [{ provide: Store, useValue: storeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(InterseccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe crear el formulario con controles válidos pero inválido al inicio', () => {
    const form = component['interseccionForm'];

    expect(form).toBeTruthy();
    expect(form.contains('layerBase')).toBeTrue();
    expect(form.contains('layerDestino')).toBeTrue();
    expect(form.contains('outputLayerName')).toBeTrue();
    expect(form.contains('areaSeleccion')).toBeTrue();

    expect(form.valid).toBeFalse();
  });

  it('debe validar que el formulario sea válido cuando todos los campos están llenos', () => {
    const form = component.interseccionForm;

    form.setValue({
      layerBase: { id: 'base1', tipoServicio: 'WMS' },
      layerDestino: { id: 'dest1', tipoServicio: 'WMS' },
      outputLayerName: 'intersección_test',
      areaSeleccion: true,
    });

    expect(form.valid).toBeTrue();
  });

  it('debe marcar como inválido si layerBase y layerDestino son iguales', () => {
    const form = component.interseccionForm;

    const capa = { id: 'igual', tipoServicio: 'WMS' };

    form.setValue({
      layerBase: capa,
      layerDestino: capa,
      outputLayerName: 'intersección_test',
      areaSeleccion: true,
    });

    expect(form.valid).toBeFalse();
    expect(
      form.get('layerBase')?.errors?.['mismaCapa'] ||
        form.get('layerDestino')?.errors?.['mismaCapa']
    ).toBeTrue();
  });
});
