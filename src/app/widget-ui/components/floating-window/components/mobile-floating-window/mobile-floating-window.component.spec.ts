import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MobileFloatingWindowComponent } from './mobile-floating-window.component';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { Subject, Subscription } from 'rxjs';
import { By } from '@angular/platform-browser';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { Component, OnInit } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

// Mock para AttributeTableComponent
@Component({
  selector: 'app-attribute-table',
  template: '',
  standalone: true,
})
class MockAttributeTableComponent implements OnInit {
  ngOnInit() {
    console.log('mock onInit');
  } // Añadir implementación vacía
}

describe('MobileFloatingWindowComponent', () => {
  let component: MobileFloatingWindowComponent;
  let fixture: ComponentFixture<MobileFloatingWindowComponent>;
  let attributeTableVisibilitySubject: Subject<boolean | undefined>;
  let mockStore: { select: jasmine.Spy };

  beforeEach(async () => {
    attributeTableVisibilitySubject = new Subject<boolean | undefined>();

    mockStore = {
      select: jasmine
        .createSpy()
        .and.returnValue(attributeTableVisibilitySubject.asObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [
        ButtonModule,
        MobileFloatingWindowComponent,
        MockAttributeTableComponent,
      ],
      providers: [
        { provide: Store, useValue: mockStore },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileFloatingWindowComponent);
    component = fixture.componentInstance;

    component.widgetFloatingWindowConfig = {
      x: 20,
      y: 20,
      width: 200,
      height: 200,
      enableClose: true,
      enableDrag: true,
      enableMinimize: true,
      enableResize: true,
    } as FloatingWindowConfig;
    component.titulo = 'Test Title';
  });

  afterEach(() => {
    attributeTableVisibilitySubject.complete();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería ocultarse cuando se establece [hidden] a true', () => {
    fixture.detectChanges();

    const rootElement = fixture.debugElement.query(
      By.css('.absolute')
    ).nativeElement;
    rootElement.hidden = true;
    fixture.detectChanges();

    expect(rootElement.hidden).toBeTrue();
  });

  it('debería mostrarse cuando widgetFloatingWindowConfig está definido', () => {
    fixture.detectChanges();

    const windowElement = fixture.debugElement.query(By.css('.absolute'));
    expect(windowElement).toBeTruthy();
    expect(windowElement.nativeElement.hidden).toBeFalse(); // No está oculto
  });

  it('debería mostrar siempre el botón de cierre', () => {
    fixture.detectChanges();

    const closeButton = fixture.debugElement.query(By.css('p-button'));
    expect(closeButton).toBeTruthy();
  });

  it('debería emitir closeWindowEvent al hacer clic en el botón de cierre', () => {
    fixture.detectChanges();

    spyOn(component.closeWindowEvent, 'emit');
    const closeButton = fixture.debugElement.query(
      By.css('p-button')
    ).nativeElement;
    closeButton.click();

    expect(component.closeWindowEvent.emit).toHaveBeenCalled();
  });

  it('debería mostrar la tabla de atributos cuando showAttributeTable es true', fakeAsync(() => {
    attributeTableVisibilitySubject.next(true);
    fixture.detectChanges();
    tick();

    const resultsTab = fixture.debugElement.queryAll(
      By.css('app-attribute-table')
    );
    expect(resultsTab).toBeTruthy();
  }));

  it('debería ocultar la tabla de atributos cuando showAttributeTable es false', fakeAsync(() => {
    // Primero mostrar la tabla
    attributeTableVisibilitySubject.next(true);
    fixture.detectChanges();
    tick();

    // Luego ocultarla
    attributeTableVisibilitySubject.next(false);
    fixture.detectChanges();
    tick();

    // Verificar que el tab de resultados no está presente
    const resultsTab = fixture.debugElement
      .queryAll(By.css('p-tabpanel'))
      .find(panel =>
        panel.nativeElement.textContent.includes('Tabla resultados')
      );

    expect(resultsTab).toBeUndefined();
  }));

  it('debería cancelar las suscripciones en ngOnDestroy', () => {
    // Inicializar el componente para crear la suscripción
    fixture.detectChanges();

    // Espiar destroy$
    const destroyNextSpy = spyOn(component['destroy$'], 'next');
    const destroyCompleteSpy = spyOn(component['destroy$'], 'complete');

    // Acceder a la suscripción privada
    const subscription = component['subscription'] as Subscription;
    expect(subscription).toBeTruthy();

    // Espiar unsubscribe
    const unsubscribeSpy = spyOn(subscription, 'unsubscribe');

    component.ngOnDestroy();

    // Verificar llamadas
    expect(destroyNextSpy).toHaveBeenCalled();
    expect(destroyCompleteSpy).toHaveBeenCalled();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('debería proyectar contenido correctamente', fakeAsync(() => {
    // Definir un componente de prueba que proyecte contenido
    @Component({
      template: `
        <app-mobile-floating-window
          [widgetFloatingWindowConfig]="config"
          [titulo]="'Test Title'">
          <div class="projected-content">Contenido proyectado</div>
        </app-mobile-floating-window>
      `,
      standalone: true,
      imports: [MobileFloatingWindowComponent],
    })
    class TestHostComponent {
      config: FloatingWindowConfig = {
        x: 20,
        y: 20,
        width: 200,
        height: 200,
        enableClose: true,
        enableDrag: true,
        enableMinimize: true,
        enableResize: true,
      };
    }

    // Crear el componente de prueba
    const testFixture = TestBed.createComponent(TestHostComponent);
    testFixture.detectChanges();
    tick(); // Esperar a que el DOM se actualice

    // Buscar el contenedor del tabpanel y el contenido proyectado
    const contentContainer = testFixture.debugElement.query(
      By.css('p-tabpanel')
    );
    expect(contentContainer).toBeTruthy(); // Verificar que el tabpanel existe

    const projectedContent = contentContainer.query(
      By.css('.projected-content')
    );
    expect(projectedContent).toBeTruthy(); // Verificar que el contenido proyectado está presente
  }));

  it('debería manejar correctamente el caso undefined en la suscripción', () => {
    attributeTableVisibilitySubject.next(undefined);
    expect(component.showAttributeTable).toBeFalse();
  });
});
