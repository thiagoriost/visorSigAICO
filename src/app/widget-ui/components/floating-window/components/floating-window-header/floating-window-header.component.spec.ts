import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingWindowHeaderComponent } from './floating-window-header.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {
  FloatingWindowConfig,
  FloatingWindowState,
} from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';

describe('FloatingWindowHeaderComponent', () => {
  let component: FloatingWindowHeaderComponent;
  let fixture: ComponentFixture<FloatingWindowHeaderComponent>;
  let mockConfig: FloatingWindowConfig;
  let mockState: FloatingWindowState;

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
      rightLimit: 0,
      bottomLimit: 0,
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, ButtonModule, FloatingWindowHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingWindowHeaderComponent);
    component = fixture.componentInstance;
    component.widgetFloatingWindowConfig = mockConfig;
    component.widgetFloatingWindowState = mockState;
    fixture.detectChanges();
  });

  // Pruebas de inicialización
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct config and state', () => {
    expect(component.widgetFloatingWindowConfig).toEqual(mockConfig);
    expect(component.widgetFloatingWindowState).toEqual(mockState);
  });

  // Pruebas de arrastre
  it('should start dragging on mousedown if enableDrag is true', () => {
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 150,
      clientY: 150,
    });
    component.startDrag(mouseDownEvent);
    expect(component.widgetFloatingWindowState.isDragging).toBeTrue();
    expect(component.widgetFloatingWindowState.dragStartX).toBe(50); // 150 - 100
    expect(component.widgetFloatingWindowState.dragStartY).toBe(50); // 150 - 100
  });

  it('should not start dragging if enableDrag is false', () => {
    component.widgetFloatingWindowConfig.enableDrag = false;
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 150,
      clientY: 150,
    });
    component.startDrag(mouseDownEvent);
    expect(component.widgetFloatingWindowState.isDragging).toBeFalse();
  });

  it('should update position on mousemove while dragging', () => {
    component.widgetFloatingWindowState.isDragging = true;
    component.widgetFloatingWindowState.dragStartX = 50;
    component.widgetFloatingWindowState.dragStartY = 50;
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 200,
      clientY: 200,
    });
    component.onDrag(mouseMoveEvent);
    expect(component.widgetFloatingWindowState.x).toBe(0); // 200 - 50
    expect(component.widgetFloatingWindowState.y).toBe(0); // 200 - 50
  });

  it('should not update position on mousemove if not dragging', () => {
    component.widgetFloatingWindowState.isDragging = false;
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 200,
      clientY: 200,
    });
    component.onDrag(mouseMoveEvent);
    expect(component.widgetFloatingWindowState.x).toBe(100); // Sin cambios
    expect(component.widgetFloatingWindowState.y).toBe(100); // Sin cambios
  });

  it('should stop dragging on mouseup', () => {
    component.widgetFloatingWindowState.isDragging = true;
    component.startDrag(
      new MouseEvent('mousedown', { clientX: 150, clientY: 150 })
    );
    component.stopDrag();
    expect(component.widgetFloatingWindowState.isDragging).toBeFalse();
  });

  // Pruebas de minimización y maximización
  it('should toggle minimize', () => {
    component.toggleMinimize();
    expect(component.widgetFloatingWindowState.isMinimized).toBeTrue();
  });

  it('should toggle maximize', () => {
    component.widgetFloatingWindowState.isMinimized = true;
    component.toggleMaximize();
    expect(component.widgetFloatingWindowState.isMinimized).toBeFalse();
  });

  // Pruebas de cierre
  it('should emit close event on closeContentWindow', () => {
    let emitted = false;
    component.closeWindowEvent.subscribe(() => {
      emitted = true;
    });
    component.closeContentWindow();
    expect(emitted).toBeTrue();
  });
});
