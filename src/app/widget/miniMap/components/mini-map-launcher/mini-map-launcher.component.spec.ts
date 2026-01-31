import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiniMapLauncherComponent } from './mini-map-launcher.component';
import { MiniMapComponent } from '../mini-map/mini-map.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';

/** Servicio simulado para MapaBaseService */
class MapaBaseServiceMock {
  getAllMapOptions(): { label: string; value: MapasBase }[] {
    return [
      { label: 'Google Satellite', value: MapasBase.GOOGLE_SATELLITE },
      { label: 'Esri Gray Dark', value: MapasBase.ESRI_GRAY_DARK },
    ];
  }
}

describe('MiniMapLauncherComponent', () => {
  let component: MiniMapLauncherComponent;
  let fixture: ComponentFixture<MiniMapLauncherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, // Evita llamadas HTTP del MiniMapComponent
        MiniMapLauncherComponent, // Componente standalone
      ],
      providers: [{ provide: MapaBaseService, useClass: MapaBaseServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MiniMapLauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -----------------------------------------------
  // PRUEBAS BÁSICAS
  // -----------------------------------------------
  it('debería crearse correctamente el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería contener un componente MiniMapComponent en el template', () => {
    const miniMap = fixture.debugElement.query(By.directive(MiniMapComponent));
    expect(miniMap).not.toBeNull();
  });

  // -----------------------------------------------
  // PRUEBAS DE VALORES INICIALES
  // -----------------------------------------------
  it('debería tener "pi pi-eye" como icono inicial del botón', () => {
    expect(component.buttonIcon).toBe('pi pi-eye');
  });

  it('debería tener el botón redondeado por defecto', () => {
    expect(component.buttonRounded).toBeTrue();
  });

  it('debería tener la posición del mini mapa en "top-left" por defecto', () => {
    expect(component.mapPosition).toBe('top-left');
  });

  it('debería tener las dimensiones por defecto en 12rem x 12rem', () => {
    expect(component.width).toBe('12rem');
    expect(component.height).toBe('12rem');
  });

  // -----------------------------------------------
  // PRUEBAS DE OPCIONES DISPONIBLES
  // -----------------------------------------------
  it('debería contener 8 opciones de posición válidas', () => {
    expect(component.positionOptions.length).toBe(8);
    const valores: string[] = component.positionOptions.map(op => op.value);
    expect(valores).toEqual([
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
      'left-top',
      'right-top',
      'left-bottom',
      'right-bottom',
    ]);
  });

  it('debería contener 3 opciones de tamaño válidas', () => {
    expect(component.sizeOptions.length).toBe(3);
    const valores = component.sizeOptions.map(op => op.value) as (
      | 'small'
      | 'large'
      | undefined
    )[];
    expect(valores).toEqual([undefined, 'small', 'large']);
  });

  // -----------------------------------------------
  // PRUEBA DE INICIALIZACIÓN DE MAPAS BASE
  // -----------------------------------------------
  it('debería inicializar las opciones de mapas base al ejecutar ngOnInit()', () => {
    component.ngOnInit();
    expect(component.mapasBaseOptions.length).toBeGreaterThan(0);
    expect(component.mapasBaseOptions[0].value).toBe(
      MapasBase.GOOGLE_SATELLITE
    );
  });

  it('debería tener GOOGLE_SATELLITE como mapa base inicial', () => {
    expect(component.baseMap).toBe(MapasBase.GOOGLE_SATELLITE);
  });

  // -----------------------------------------------
  // PRUEBA DE INTEGRACIÓN CON MiniMapComponent
  // -----------------------------------------------
  it('debería pasar correctamente las propiedades al MiniMapComponent', () => {
    const miniMapDebug = fixture.debugElement.query(
      By.directive(MiniMapComponent)
    );
    const miniMapInstance = miniMapDebug.componentInstance as MiniMapComponent;

    expect(miniMapInstance.buttonIcon).toBe(component.buttonIcon);
    expect(miniMapInstance.buttonRounded).toBe(component.buttonRounded);
    expect(miniMapInstance.mapPosition).toBe(component.mapPosition);
    expect(miniMapInstance.width).toBe(component.width);
    expect(miniMapInstance.height).toBe(component.height);
  });

  // -----------------------------------------------
  // PRUEBAS DE MODIFICACIÓN DE PROPIEDADES
  // -----------------------------------------------
  it('debería permitir cambiar el tamaño del botón', () => {
    component.buttonSize = 'large';
    fixture.detectChanges();
    expect(component.buttonSize).toBe('large');
  });

  it('debería permitir cambiar la posición del mini mapa', () => {
    component.mapPosition = 'bottom-right';
    fixture.detectChanges();
    expect(component.mapPosition).toBe('bottom-right');
  });

  it('debería permitir asignar una clase personalizada al contenedor del mapa', () => {
    component.mapContainerClass = 'custom-map-class';
    fixture.detectChanges();
    expect(component.mapContainerClass).toBe('custom-map-class');
  });

  it('debería permitir activar y desactivar el paneo', () => {
    component.isPanEnabled = true;
    fixture.detectChanges();
    expect(component.isPanEnabled).toBeTrue();

    component.isPanEnabled = false;
    fixture.detectChanges();
    expect(component.isPanEnabled).toBeFalse();
  });
});
