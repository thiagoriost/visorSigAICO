import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegendItemSecondVersionComponent } from './legend-item-second-version.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

describe('LegendItemSecondVersionComponent', () => {
  let component: LegendItemSecondVersionComponent;
  let fixture: ComponentFixture<LegendItemSecondVersionComponent>;
  const mockLayer: LayerStore & { leyendaUrl?: string } = {
    layerDefinition: { id: 'layer-1', titulo: 'Mock Layer', leaf: true },
    isVisible: true,
    layerLevel: LayerLevel.INTERMEDIATE,
    orderInMap: 0,
    transparencyLevel: 0,
    leyendaUrl: 'https://example.com/legend.png',
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegendItemSecondVersionComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LegendItemSecondVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deberia aceptar la capa de entrada y renderizarla', () => {
    component.layer = mockLayer;
    fixture.detectChanges();
    expect(component.layer).toEqual(mockLayer);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Mock Layer');
  });

  it('debería asignar "0" a isExpandedPanel cuando isCollapsedLegend = true', () => {
    component.isCollapsedLegend = true;
    component.ngOnInit();
    expect(component.isExpandedPanel).toBe('0');
  });

  it('debería asignar "1" a isExpandedPanel cuando isCollapsedLegend = false', () => {
    component.isCollapsedLegend = false;
    component.ngOnInit();
    expect(component.isExpandedPanel).toBe('1');
  });
});
