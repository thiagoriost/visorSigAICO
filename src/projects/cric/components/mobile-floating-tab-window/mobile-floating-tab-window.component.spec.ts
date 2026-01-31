import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileFloatingTabWindowComponent } from './mobile-floating-tab-window.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MemoizedSelector } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectWidgetStatus } from '@app/core/store/user-interface/user-interface.selectors';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('MobileFloatingTabWindowComponent', () => {
  let component: MobileFloatingTabWindowComponent;
  let fixture: ComponentFixture<MobileFloatingTabWindowComponent>;
  let store: MockStore;
  let mockSelectWidgetStatus: MemoizedSelector<MapState, boolean | undefined>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileFloatingTabWindowComponent],
      providers: [provideMockStore(), provideAnimations()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    // Creamos un mock del selector que usa el componente
    mockSelectWidgetStatus = store.overrideSelector(
      selectWidgetStatus('attributeTable'),
      false // valor inicial
    );

    fixture = TestBed.createComponent(MobileFloatingTabWindowComponent);
    component = fixture.componentInstance;
    component.titulo = 'Leyenda'; // inicializamos el input para test
    fixture.detectChanges();
    console.log(mockSelectWidgetStatus);
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería marcar isLeyenda como true si el titulo es "Leyenda"', () => {
    expect(component.isLeyenda).toBeTrue();
  });

  it('debería emitir closeWindowEvent al llamar closeWindow', () => {
    spyOn(component.closeWindowEvent, 'emit');
    component.closeWindow();
    expect(component.closeWindowEvent.emit).toHaveBeenCalled();
  });

  it('debería minimizar y maximizar correctamente', () => {
    component.toggleMinimize();
    expect(component.state.isMinimized).toBeTrue();

    component.toggleMaximize();
    expect(component.state.isMinimized).toBeFalse();
  });

  it('debería limpiar recursos en ngOnDestroy', () => {
    spyOn(component['destroy$'], 'next').and.callThrough();
    spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
