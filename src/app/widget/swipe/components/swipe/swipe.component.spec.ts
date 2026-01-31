import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwipeComponent } from './swipe.component';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('SwipeComponent', () => {
  let component: SwipeComponent;
  let fixture: ComponentFixture<SwipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwipeComponent], // si es standalone
      providers: [
        {
          provide: Store,
          useValue: {
            dispatch: jasmine.createSpy('dispatch'),
            select: jasmine
              .createSpy('select')
              //              .and.callFake((selector: any) => {
              .and.callFake((selector: unknown) => {
                if (
                  typeof selector === 'function' &&
                  selector.name === 'selectCapasVisibles'
                ) {
                  return of([
                    { layerDefinition: { id: 1, titulo: 'Capa 1' } },
                    { layerDefinition: { id: 2, titulo: 'Capa 2' } },
                  ]);
                }

                if (
                  typeof selector === 'function' &&
                  selector.name === 'selectSwipeActivo'
                ) {
                  return of(true);
                }
                return of([]);
              }),
          },
        },
        {
          provide: MessageService,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SwipeComponent);
    component = fixture.componentInstance;

    // Espías para métodos
    spyOn(component, 'activarSwipe');
    spyOn(component, 'desactivarSwipe');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar los botones "Activar" y "Desactivar"', () => {
    const buttons = fixture.debugElement.queryAll(By.css('p-button'));
    expect(buttons.length).toBe(2);
  });

  it('debería llamar activarSwipe() al hacer clic en "Activar Swipe"', () => {
    const activarBtn = fixture.debugElement.queryAll(By.css('p-button'))[0];
    activarBtn.triggerEventHandler('onClick', {});
    expect(component.activarSwipe).toHaveBeenCalled();
  });

  it('debería llamar desactivarSwipe() al hacer clic en "Desactivar Swipe"', () => {
    const desactivarBtn = fixture.debugElement.queryAll(By.css('p-button'))[1];
    desactivarBtn.triggerEventHandler('onClick', {});
    expect(component.desactivarSwipe).toHaveBeenCalled();
  });

  it('debería mostrar el mensaje "Swipe activado" cuando swipeActivo$ es true', () => {
    const status = fixture.debugElement.query(By.css('.swipe-status'));
    expect(status.nativeElement.textContent).toContain('Swipe activado');
  });
});
