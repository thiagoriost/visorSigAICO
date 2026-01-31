import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MiniMapLauncherComponent } from './mini-map-launcher.component';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { FormBuilder } from '@angular/forms';

// ---- Mock del servicio MapaBaseService ----
class MockMapaBaseService {
  getAllMapOptions(): { label: string; value: MapasBase }[] {
    return [
      { label: 'Google Satélite', value: MapasBase.GOOGLE_SATELLITE },
      { label: 'Google Calles', value: MapasBase.GOOGLE_ROAD },
    ];
  }
}

describe('MiniMapLauncherComponent', () => {
  let component: MiniMapLauncherComponent;
  let fixture: ComponentFixture<MiniMapLauncherComponent>;
  let mapaBaseService: MapaBaseService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniMapLauncherComponent],
      providers: [
        FormBuilder,
        { provide: MapaBaseService, useClass: MockMapaBaseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MiniMapLauncherComponent);
    component = fixture.componentInstance;
    mapaBaseService = TestBed.inject(MapaBaseService);
    fixture.detectChanges();
  });

  // ---- PRUEBAS ----

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar las opciones de mapas base correctamente', () => {
    const opcionesEsperadas = mapaBaseService.getAllMapOptions();
    expect(component.mapasBaseOptions).toEqual(opcionesEsperadas);
  });

  it('debería crear el formulario con los valores por defecto', () => {
    const formValues = component.formGroupLauncher.value;

    expect(formValues.baseMap).toBe(MapasBase.GOOGLE_SATELLITE);
    expect(formValues.mapPosition).toBe('top-left');
    expect(formValues.variant).toBe('header');
    expect(formValues.buttonPosition).toBe('top-right');
    expect(formValues.buttonSize).toBe('normal');
    expect(formValues.buttonIcon).toBe('pi pi-eye');
    expect(formValues.closeButtonIcon).toBe('pi pi-minus');
    expect(formValues.severity).toBeNull();
    expect(formValues.closeButtonSeverity).toBeNull();
    expect(formValues.headerButtonSeverity).toBe('secondary');
    expect(formValues.buttonRounded).toBeTrue();
    expect(formValues.width).toBe('12rem');
    expect(formValues.height).toBe('12rem');
    expect(formValues.headerClass).toBe('');
    expect(formValues.bodyClass).toBe('');
    expect(formValues.isPanEnabled).toBeFalse();
  });

  it('debería establecer mostrarMapa en false y luego en true al generar el mini mapa', fakeAsync(() => {
    component.mostrarMapa = true;
    component.generarMiniMapa();
    expect(component.mostrarMapa).toBeFalse();
    tick(100);
    expect(component.mostrarMapa).toBeTrue();
  }));

  it('debería contener la opción "Google Satélite" dentro de las opciones de mapas base', () => {
    const opcionGoogle = component.mapasBaseOptions.find(
      (opt: { label: string; value: MapasBase }) =>
        opt.value === MapasBase.GOOGLE_SATELLITE
    );

    expect(opcionGoogle).toBeDefined();
    expect(opcionGoogle?.label).toBe('Google Satélite');
  });

  it('debería permitir actualizar los valores del formulario correctamente', () => {
    component.formGroupLauncher.patchValue({
      baseMap: MapasBase.GOOGLE_ROAD,
      width: '20rem',
      height: '20rem',
      severity: 'success',
      isPanEnabled: true,
    });

    const valoresActualizados = component.formGroupLauncher.value;
    expect(valoresActualizados.baseMap).toBe(MapasBase.GOOGLE_ROAD);
    expect(valoresActualizados.width).toBe('20rem');
    expect(valoresActualizados.height).toBe('20rem');
    expect(valoresActualizados.severity).toBe('success');
    expect(valoresActualizados.isPanEnabled).toBeTrue();
  });

  it('debería iniciar con mostrarMapa en false', () => {
    expect(component.mostrarMapa).toBeFalse();
  });

  it('debería tener definidas todas las opciones preestablecidas (variant, position, severities)', () => {
    expect(component.variantOptions.length).toBeGreaterThan(0);
    expect(component.positionOptions.length).toBeGreaterThan(0);
    expect(component.severityOptions.length).toBeGreaterThan(0);
    expect(component.buttonRoundedOptions.length).toBe(2);
  });

  it('debería tener definida la opción por defecto de tamaño de botón como "normal"', () => {
    const opcionNormal = component.buttonSizeOptions.find(
      opt => opt.label === 'Normal'
    );
    expect(opcionNormal).toBeDefined();
    expect(opcionNormal?.value).toBeUndefined(); // coincide con el componente
  });

  it('debería iniciar con headerTitle vacío', () => {
    const formValues = component.formGroupLauncher.value;
    expect(formValues.headerTitle).toBe('');
  });

  it('debería iniciar con closeButtonIcon con el valor por defecto', () => {
    const formValues = component.formGroupLauncher.value;
    expect(formValues.closeButtonIcon).toBe('pi pi-minus');
  });

  it('debería permitir actualizar el título y el icono del header', () => {
    component.formGroupLauncher.patchValue({
      headerTitle: 'Mapa de Ubicación',
      closeButtonIcon: 'pi pi-times',
    });

    const valoresActualizados = component.formGroupLauncher.value;

    expect(valoresActualizados.headerTitle).toBe('Mapa de Ubicación');
    expect(valoresActualizados.closeButtonIcon).toBe('pi pi-times');
  });
});
