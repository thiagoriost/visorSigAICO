import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

import { WindowSingleGMRenderComponentComponent } from './window-single-gmrender-component.component';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';

// 1. Mock súper simple del Store (NgRx)
const mockStore = {
  select: () => of(undefined),
  dispatch: jasmine.createSpy('dispatch'),
};

// 2. Mock súper simple del UserInterfaceService
//    Le damos solo lo mínimo para que el componente no truene.
//    Si el componente llama a algún método específico del servicio,
//    lo agregamos aquí como spy o función vacía.
const mockUserInterfaceService = {
  // Ejemplos comunes, los dejamos como stubs seguros:
  getInitialFloatingWindowConfig: () =>
    of({
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      maxWidth: 900,
      maxHeight: 900,
      enableClose: true,
      enableResize: true,
      enableDrag: true,
      enableMinimize: true,
      buttomSize: 'small',
      buttomRounded: false,
      iconMinimize: 'pi pi-chevron-up',
      iconMaximize: 'pi pi-chevron-down',
      iconMinimizePosition: 'right',
      iconClosePosition: 'right',
    }),
};

describe('WindowSingleGMRenderComponentComponent', () => {
  let component: WindowSingleGMRenderComponentComponent;
  let fixture: ComponentFixture<WindowSingleGMRenderComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindowSingleGMRenderComponentComponent],
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: UserInterfaceService, useValue: mockUserInterfaceService },

        // Provider del token 'widget.config' que el servicio real normalmente espera.
        // Lo dejamos como objeto vacío porque en este test no necesitamos lógica real.
        {
          provide: 'widget.config',
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WindowSingleGMRenderComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
