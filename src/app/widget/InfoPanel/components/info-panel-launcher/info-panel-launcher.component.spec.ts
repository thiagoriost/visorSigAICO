import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { InfoPanelLauncherComponent } from './info-panel-launcher.component';
import { InfoPanelService } from '@app/widget/InfoPanel/services/info-panel.service';
import type { PopUpComponent } from '@app/widget/InfoPanel/components/pop-up/pop-up.component';
import { Coordinate } from 'ol/coordinate';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';

class MockInfoPanelService {
  createPopup(coords: Coordinate, node: ElementRef<HTMLDivElement>): number {
    void coords;
    void node;
    return 1;
  }

  closePopup(id: number): void {
    void id;
  }

  updatePopupCoords(id: number, coords: Coordinate): void {
    void id;
    void coords;
  }

  openPanel?(): void {
    // noop
  }

  closePanel?(): void {
    // noop
  }
}

function crearPopupDoble(): PopUpComponent {
  const div = document.createElement('div') as HTMLDivElement;
  const elementRef = new ElementRef<HTMLDivElement>(div);
  const doble = {
    id: undefined as number | undefined,
    popupNode: elementRef,
  } as unknown as PopUpComponent;
  return doble;
}

describe('InfoPanelLauncherComponent', () => {
  let component: InfoPanelLauncherComponent;
  let fixture: ComponentFixture<InfoPanelLauncherComponent>;
  let mockService: MockInfoPanelService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        InfoPanelLauncherComponent,
        HttpClientTestingModule,
      ],
      providers: [
        FormBuilder,
        MessageService,
        { provide: InfoPanelService, useClass: MockInfoPanelService },
        provideMockStore({ initialState: {} }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoPanelLauncherComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(
      InfoPanelService
    ) as unknown as MockInfoPanelService;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con valores por defecto', () => {
    expect(component.formCoords.get('lon')?.value).toBe(-74.08175);
    expect(component.formCoords.get('lat')?.value).toBe(4.60971);
  });

  it('debería devolver las coordenadas correctamente desde el getter coords', () => {
    component.formCoords.setValue({ lon: 10, lat: 20 });
    expect(component.coords).toEqual([10, 20]);
  });

  it('no debería abrir popup si el formulario es inválido', () => {
    const popup = crearPopupDoble();

    component.formCoords.setValue({
      lon: null as unknown as number,
      lat: null as unknown as number,
    });
    component.togglePopup(popup);

    expect(component.arrayPopupIds.length).toBe(0);
    expect(popup.id).toBeUndefined();
  });

  it('debería abrir un popup cuando el formulario es válido', () => {
    const popup = crearPopupDoble();
    spyOn(mockService, 'createPopup').and.returnValue(1);

    component.formCoords.setValue({ lon: 10, lat: 20 });
    component.togglePopup(popup);

    expect(mockService.createPopup).toHaveBeenCalled();
    expect(component.arrayPopupIds.length).toBe(1);
    expect(popup.id).toBe(1);
  });

  it('debería cerrar un popup si ya estaba abierto', () => {
    const popup = crearPopupDoble();
    spyOn(mockService, 'createPopup').and.returnValue(1);
    spyOn(mockService, 'closePopup');

    component.formCoords.setValue({ lon: 10, lat: 20 });
    component.togglePopup(popup); // abre
    expect(popup.id).toBe(1);

    component.togglePopup(popup); // cierra
    expect(mockService.closePopup).toHaveBeenCalledWith(1);
    expect(component.arrayPopupIds.length).toBe(0);
    expect(popup.id).toBeUndefined();
  });

  it('debería permitir abrir varios popups con diferentes instancias', () => {
    const popup1 = crearPopupDoble();
    const popup2 = crearPopupDoble();
    spyOn(mockService, 'createPopup').and.returnValues(1, 2);

    component.formCoords.setValue({ lon: 10, lat: 20 });
    component.togglePopup(popup1);
    component.togglePopup(popup2);

    expect(component.arrayPopupIds.length).toBe(2);
    expect(popup1.id).toBe(1);
    expect(popup2.id).toBe(2);
  });

  it('debería renderizar los componentes hijos en la vista', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-mini-map')).not.toBeNull();
    expect(compiled.querySelector('app-identify')).not.toBeNull();
    expect(compiled.querySelector('app-buscar-direccion')).not.toBeNull();
  });

  it('debería tener color por defecto "surface"', () => {
    expect(component.color).toBe('surface');
  });

  it('debería aceptar un valor diferente en @Input() color', () => {
    component.color = 'primary';
    fixture.detectChanges();
    expect(component.color).toBe('primary');
  });
});
