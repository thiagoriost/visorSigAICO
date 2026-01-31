import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingWindowResizeComponent } from './floating-window-resize.component';
import { CommonModule } from '@angular/common';
import {
  FloatingWindowConfig,
  FloatingWindowState,
} from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';

describe('FloatingWindowResizeComponent', () => {
  let component: FloatingWindowResizeComponent;
  let fixture: ComponentFixture<FloatingWindowResizeComponent>;
  let mockConfig: FloatingWindowConfig;
  let mockState: FloatingWindowState;

  /**
   * Configura el entorno de pruebas antes de cada caso.
   */
  beforeEach(async () => {
    mockConfig = {
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      enableMinimize: true,
      enableResize: true,
      enableClose: true,
      enableDrag: true,
    };

    mockState = {
      isMinimized: false,
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      isDragging: false,
      isResizing: false,
      dragStartX: 0,
      dragStartY: 0,
      resizeStartX: 0,
      resizeStartY: 0,
      topLimit: 0,
      leftLimit: 0,
      rightLimit: 800, // Límite derecho del contenedor
      bottomLimit: 600, // Límite inferior del contenedor
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, FloatingWindowResizeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingWindowResizeComponent);
    component = fixture.componentInstance;
    component.widgetFloatingWindowConfig = mockConfig;
    component.widgetFloatingWindowState = mockState;
    fixture.detectChanges();
  });

  /**
   * Verifica que el componente se cree correctamente.
   */
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Verifica que el redimensionamiento se inicie con mousedown si enableResize es true.
   */
  it('debería iniciar el redimensionamiento en mousedown si enableResize es verdadero', () => {
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 350,
      clientY: 250,
    });
    component.startResize(mouseDownEvent);
    expect(component.widgetFloatingWindowState.isResizing).toBeTrue();
    expect(component.widgetFloatingWindowState.resizeStartX).toBe(350);
    expect(component.widgetFloatingWindowState.resizeStartY).toBe(250);
  });

  /**
   * Verifica que el redimensionamiento no se inicie si enableResize es falso.
   */
  it('no debería iniciar el redimensionamiento si enableResize es falso', () => {
    component.widgetFloatingWindowConfig.enableResize = false;
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 350,
      clientY: 250,
    });
    component.startResize(mouseDownEvent);
    expect(component.widgetFloatingWindowState.isResizing).toBeFalse();
  });

  /**
   * Verifica que la ventana se redimensione correctamente durante mousemove.
   */
  it('debería redimensionar la ventana en mousemove mientras se está redimensionando', () => {
    component.widgetFloatingWindowState.isResizing = true;
    component.widgetFloatingWindowState.resizeStartX = 350;
    component.widgetFloatingWindowState.resizeStartY = 250;
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 400,
      clientY: 300,
    });
    component.onResize(mouseMoveEvent);
    expect(component.widgetFloatingWindowState.width).toBe(350); // 300 + (400 - 350) = 350
    expect(component.widgetFloatingWindowState.height).toBe(250); // 200 + (300 - 250) = 250
    expect(component.widgetFloatingWindowState.resizeStartX).toBe(400);
    expect(component.widgetFloatingWindowState.resizeStartY).toBe(300);
  });

  /**
   * Verifica que no se redimensione por debajo de los límites mínimos.
   */
  it('no debería redimensionar por debajo del ancho y alto mínimos', () => {
    component.widgetFloatingWindowState.isResizing = true;
    component.widgetFloatingWindowState.width = 100; // Mínimo
    component.widgetFloatingWindowState.height = 60; // Mínimo
    component.widgetFloatingWindowState.resizeStartX = 350;
    component.widgetFloatingWindowState.resizeStartY = 250;
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 50, // Intentar reducir: 100 + (50 - 350) = 100 - 300 = -200, limitado a 100
      clientY: 50, // Intentar reducir: 60 + (50 - 250) = 60 - 200 = -140, limitado a 60
    });
    component.onResize(mouseMoveEvent);
    expect(component.widgetFloatingWindowState.width).toBe(mockConfig.width); // Respeta el mínimo
    expect(component.widgetFloatingWindowState.height).toBe(mockConfig.height); // Respeta el mínimo
  });

  /**
   * Verifica que el redimensionamiento se detenga con mouseup.
   */
  it('debería detener el redimensionamiento en mouseup', () => {
    component.widgetFloatingWindowState.isResizing = true;
    component.stopResize();
    expect(component.widgetFloatingWindowState.isResizing).toBeFalse();
  });

  /**
   * Verifica que no se redimensione por encima de los límites máximos configurados.
   */
  it('no debería redimensionar por encima del ancho y alto máximos configurados', () => {
    mockConfig.maxWidth = 400;
    mockConfig.maxHeight = 300;
    component.widgetFloatingWindowState.isResizing = true;
    component.widgetFloatingWindowState.width = 350;
    component.widgetFloatingWindowState.height = 250;
    component.widgetFloatingWindowState.resizeStartX = 350;
    component.widgetFloatingWindowState.resizeStartY = 250;
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 500, // Intentar: 350 + (500 - 350) = 500, limitado a 400
      clientY: 400, // Intentar: 250 + (400 - 250) = 400, limitado a 300
    });
    component.onResize(mouseMoveEvent);
    expect(component.widgetFloatingWindowState.width).toBe(400); // Respeta maxWidth
    expect(component.widgetFloatingWindowState.height).toBe(300); // Respeta maxHeight
  });

  /**
   * Verifica que se respeten los límites del contenedor cuando son más restrictivos.
   */
  it('debería respetar los límites del contenedor si son más restrictivos que maxWidth y maxHeight', () => {
    mockConfig.maxWidth = 500;
    mockConfig.maxHeight = 400;
    mockState.rightLimit = 400 + mockState.x; // 400 + 100 = 500, maxWidthBasedOnContainer = 500 - 100 = 400
    mockState.bottomLimit = 350 + mockState.y; // 350 + 100 = 450, maxHeightBasedOnContainer = 450 - 100 = 350
    component.widgetFloatingWindowState.isResizing = true;
    component.widgetFloatingWindowState.width = 300;
    component.widgetFloatingWindowState.height = 200;
    component.widgetFloatingWindowState.resizeStartX = 350;
    component.widgetFloatingWindowState.resizeStartY = 250;
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 450, // Intentar: 300 + (450 - 350) = 400
      clientY: 400, // Intentar: 200 + (400 - 250) = 350
    });
    component.onResize(mouseMoveEvent);
    expect(component.widgetFloatingWindowState.width).toBe(400); // Limitado por contenedor (400 < 500)
    expect(component.widgetFloatingWindowState.height).toBe(350); // Limitado por contenedor (350 < 400)
  });

  /**
   * Verifica que, sin maxWidth ni maxHeight, se limite al tamaño del contenedor.
   */
  it('debería limitar el redimensionamiento al tamaño del contenedor si maxWidth y maxHeight no están definidos', () => {
    mockConfig.maxWidth = undefined;
    mockConfig.maxHeight = undefined;
    component.widgetFloatingWindowState.isResizing = true;
    component.widgetFloatingWindowState.width = 300;
    component.widgetFloatingWindowState.height = 200;
    component.widgetFloatingWindowState.resizeStartX = 350;
    component.widgetFloatingWindowState.resizeStartY = 250;
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 1000, // Intentar: 300 + (1000 - 350) = 950, limitado a 700 (800 - 100)
      clientY: 1000, // Intentar: 200 + (1000 - 250) = 950, limitado a 500 (600 - 100)
    });
    component.onResize(mouseMoveEvent);
    expect(component.widgetFloatingWindowState.width).toBe(700); // maxWidthBasedOnContainer
    expect(component.widgetFloatingWindowState.height).toBe(500); // maxHeightBasedOnContainer
  });

  /**
   * Verifica el manejo de coordenadas extremas, respetando los límites del contenedor.
   */
  it('debería manejar coordenadas extremas del ratón respetando los límites del contenedor', () => {
    component.widgetFloatingWindowState.isResizing = true;
    component.widgetFloatingWindowState.width = 300;
    component.widgetFloatingWindowState.height = 200;
    component.widgetFloatingWindowState.resizeStartX = 350;
    component.widgetFloatingWindowState.resizeStartY = 250;
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: Number.MAX_SAFE_INTEGER,
      clientY: Number.MAX_SAFE_INTEGER,
    });
    component.onResize(mouseMoveEvent);
    expect(component.widgetFloatingWindowState.width).toBe(700); // maxWidthBasedOnContainer
    expect(component.widgetFloatingWindowState.height).toBe(500); // maxHeightBasedOnContainer
  });
});
