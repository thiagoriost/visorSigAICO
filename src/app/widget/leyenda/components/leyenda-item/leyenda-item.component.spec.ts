import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeyendaItemComponent } from './leyenda-item.component';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { By } from '@angular/platform-browser';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

/**
 * Pruebas unitarias para el componente LeyendaItemComponent
 */
describe('LeyendaItemComponent', () => {
  let component: LeyendaItemComponent;
  let fixture: ComponentFixture<LeyendaItemComponent>;

  // Capa simulada para pruebas
  const capaMock: LayerStore & { leyendaUrl?: string } = {
    layerDefinition: {
      id: 'capa1',
      nombre: 'Nombre de Capa',
      titulo: 'Título de Capa',
      urlServicioWFS: 'http://example.com/wfs',
      leaf: true,
    },
    layerLevel: LayerLevel.INTERMEDIATE,
    orderInMap: 0,
    isVisible: true,
    transparencyLevel: 0,
    leyendaUrl: 'http://example.com/leyenda.png',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeyendaItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LeyendaItemComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el título de la capa', () => {
    component.capa = capaMock;
    fixture.detectChanges();

    const textoTitulo = fixture.nativeElement.querySelector('h5')?.textContent;
    expect(textoTitulo).toContain('Título de Capa');
  });

  it('debería mostrar la imagen de la leyenda si existe la URL', () => {
    component.capa = capaMock;
    fixture.detectChanges();

    const imagen = fixture.debugElement.query(By.css('img'));
    expect(imagen).toBeTruthy();
    expect(imagen.attributes['src']).toBe('http://example.com/leyenda.png');
    expect(imagen.attributes['alt']).toContain('Título de Capa');
  });

  it('no debería renderizar la imagen si no hay leyendaUrl', () => {
    const capaSinLeyenda: LayerStore = {
      layerDefinition: {
        id: 'capa2',
        nombre: 'Otra Capa',
        titulo: 'Otra Título',
        urlServicioWFS: 'http://example.com/wfs2',
        leaf: true,
      },
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 1,
      isVisible: true,
      transparencyLevel: 0,
    };

    component.capa = capaSinLeyenda;
    fixture.detectChanges();

    const imagen = fixture.debugElement.query(By.css('img'));
    expect(imagen).toBeNull();
  });
});
