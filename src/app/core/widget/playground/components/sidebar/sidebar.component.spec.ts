import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { WidgetCategoria } from '@app/core/interfaces/enums/WidgetCategoria.enum';
import { WidgetSubcategoria } from '@app/core/interfaces/enums/WidgetSubcategoria.enum';
import { WidgetItemFuncionState } from '@app/core/interfaces/store/user-interface.model';
import { Type } from '@angular/core';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  const mockWidgets: WidgetItemFuncionState[] = [
    {
      nombreWidget: 'Widget1',
      titulo: 'Título 1',
      ruta: 'ruta/1',
      importarComponente: () => Promise.resolve({} as Type<unknown>),
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      subcategoria: WidgetSubcategoria.EXPORTAR_MAPA,
    },
    {
      nombreWidget: 'Widget2',
      titulo: 'Título 2',
      ruta: 'ruta/2',
      importarComponente: () => Promise.resolve({} as Type<unknown>),
      categoria: WidgetCategoria.HERRAMIENTAS_TRABAJO,
      subcategoria: WidgetSubcategoria.EXPORTAR_MAPA,
    },
    {
      nombreWidget: 'Widget3',
      titulo: 'Título 3',
      ruta: 'ruta/3',
      importarComponente: () => Promise.resolve({} as Type<unknown>),
      categoria: WidgetCategoria.GESTION_DATOS,
      subcategoria: WidgetSubcategoria.SUBIR_ARCHIVO,
    },
  ];

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should group widgets by category and subcategory on changes', () => {
    component.widgets = mockWidgets;

    component.ngOnChanges({
      widgets: {
        currentValue: mockWidgets,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.grupos.length).toBe(2);

    const herramientas = component.grupos.find(
      g => g.categoria === WidgetCategoria.HERRAMIENTAS_TRABAJO
    );
    expect(herramientas).toBeTruthy();
    expect(herramientas?.subcategorias.length).toBe(1);
    expect(herramientas?.subcategorias[0].widgets.length).toBe(2);

    const gestion = component.grupos.find(
      g => g.categoria === WidgetCategoria.GESTION_DATOS
    );
    expect(gestion).toBeTruthy();
    expect(gestion?.subcategorias[0].widgets[0].nombreWidget).toBe('Widget3');
  });

  it('should emit toggleWidget when onToggle is called', () => {
    spyOn(component.toggleWidget, 'emit');

    const widget = mockWidgets[0];
    component.onToggle(widget);

    expect(component.toggleWidget.emit).toHaveBeenCalledWith(widget);
  });

  it('should return correct trackBy values', () => {
    const grupo = {
      categoria: WidgetCategoria.CONSULTA_ANALISIS,
      subcategorias: [],
    };
    const subcategoria = { nombre: WidgetSubcategoria.SWIPE };
    const widget = { nombreWidget: 'WidgetTrack' } as WidgetItemFuncionState;

    expect(component.trackByCategoria(0, grupo)).toBe(
      WidgetCategoria.CONSULTA_ANALISIS
    );
    expect(component.trackBySubcategoria(1, subcategoria)).toBe(
      WidgetSubcategoria.SWIPE
    );
    expect(component.trackByNombreWidget(2, widget)).toBe('WidgetTrack');
  });
});
