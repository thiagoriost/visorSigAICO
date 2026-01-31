import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayerTreeComponent } from './layer-tree.component';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';

describe('LayerTreeComponent', () => {
  let component: LayerTreeComponent;
  let fixture: ComponentFixture<LayerTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayerTreeComponent, StoreModule.forRoot({})],
    }).compileComponents();

    fixture = TestBed.createComponent(LayerTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deberia inicializarse expandido por defecto', () => {
    expect(component.isExpanded).toBeTrue();
  });

  it('deberia alternar el estado de isExpanded al llamar a onToggle()', () => {
    const initialState = component.isExpanded;

    component.onToggle();

    expect(component.isExpanded).toBe(!initialState);
  });

  it('debería mostrar "No se encontraron coincidencias" cuando isFilteringResult=true y Result está vacío', () => {
    component.layer = {
      id: '1',
      leaf: true,
      titulo: 'Capa de Prueba',
      Result: [],
    };
    component.isFilteringResult = true;

    fixture.detectChanges();

    const textElements = fixture.debugElement.queryAll(By.css('p'));
    const texts = textElements.map(e => e.nativeElement.textContent.trim());

    expect(texts).toContain('Resultados para: CAPA DE PRUEBA');
    expect(texts).toContain('No se encontraron coincidencias');
  });

  it('debería mostrar solo el título cuando hay resultados y isFilteringResult=true', () => {
    component.layer = {
      titulo: 'Capa de Datos',
      id: '2',
      leaf: false,
      Result: [{ id: '1', titulo: 'Subcapa', leaf: true }],
    };
    component.isFilteringResult = true;

    fixture.detectChanges();

    const title = fixture.debugElement.query(By.css('p.font-bold'));
    expect(title.nativeElement.textContent.trim()).toBe(
      'Resultados para: CAPA DE DATOS'
    );
  });

  it('debería renderizar la fila de capa con ícono expandible cuando isFilteringResult=false', () => {
    component.layer = {
      titulo: 'Capa Principal',
      id: '1',
      leaf: false,
      Result: [{ id: '1', titulo: 'Subcapa', leaf: true }],
    };
    component.isFilteringResult = false;
    component.isExpanded = false;

    fixture.detectChanges();

    // Verifica que se muestra el ícono de expandir (chevron-down)
    const icon = fixture.debugElement.query(By.css('i.pi-chevron-down'));
    expect(icon).toBeTruthy();

    // Verifica que se muestra el título de la capa
    const title = fixture.debugElement.query(By.css('p.font-bold'));
    expect(title.nativeElement.textContent.trim()).toBe('Capa Principal');
  });

  it('debería alternar isExpanded al hacer clic en el título', () => {
    component.layer = {
      id: '1',
      leaf: false,
      titulo: 'Capa Expandible',
      Result: [{ id: '1', titulo: 'Subcapa', leaf: true }],
    };
    component.isFilteringResult = false;
    component.isExpanded = false;

    fixture.detectChanges();

    const title = fixture.debugElement.query(By.css('p.font-bold'));
    title.triggerEventHandler('click', null);

    expect(component.isExpanded).toBeTrue();
  });

  it('debería renderizar las capas de manera recursiva', () => {
    component.layer = {
      id: '1',
      titulo: 'Capa padre',
      leaf: false,
      Result: [
        {
          id: '1.1',
          titulo: 'Hijo 1',
          leaf: false,
          Result: [
            {
              id: '1.1.1',
              titulo: 'Nieto 1.1',
              leaf: true,
            },
          ],
        },
        {
          id: '1.2',
          titulo: 'Hijo 2',
          leaf: true,
        },
      ],
    };
    component.isExpanded = true;
    fixture.detectChanges();
    const trees = fixture.debugElement.queryAll(By.css('app-layer-tree'));
    expect(trees.length).toBe(3);
    const texts = fixture.nativeElement.textContent;
    expect(texts).toContain('Capa padre');
    expect(texts).toContain('Hijo 1');
    expect(texts).toContain('Hijo 2');

    const sonTrees = fixture.debugElement.queryAll(By.css('app-layer-item-v3'));
    expect(sonTrees.length).toBe(2);
    const sonTexts = fixture.nativeElement.textContent;
    expect(sonTexts).toContain('Nieto 1.1');
    expect(sonTexts).toContain('Hijo 2');
  });
});
