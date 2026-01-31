/**
 * Componente SidebarComponent
 *
 * Representa el menú lateral del visor, desde donde los usuarios pueden:
 * - Visualizar todos los widgets disponibles agrupados por categoría y subcategoría.
 * - Activar o desactivar (toggle) los widgets visibles.
 * - Ver la documentación (readme) asociada a cada widget.
 *
 * Utiliza PrimeNG Accordion para organizar la interfaz jerárquica de categorías.
 *
 * Inputs:
 * - `widgets`: lista de widgets disponibles.
 *
 * Outputs:
 * - `toggleWidget`: se emite cuando el usuario activa/desactiva un widget.
 * - `verReadme`: se emite cuando el usuario quiere ver la documentación del widget.
 *
 * @author Sergio Alonso Mariño Duque
 * @date 05-08-2025
 * @version 1.0.0
 *
 */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { WidgetItemFuncionState } from '@app/core/interfaces/store/user-interface.model';
import { WidgetCategoria } from '@app/core/interfaces/enums/WidgetCategoria.enum';
import { WidgetSubcategoria } from '@app/core/interfaces/enums/WidgetSubcategoria.enum';

/**
 * Estructura auxiliar para agrupar los widgets por categoría y subcategoría.
 */
interface GrupoDeWidgets {
  categoria: WidgetCategoria;
  subcategorias: {
    nombre: WidgetSubcategoria;
    widgets: WidgetItemFuncionState[];
  }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, CheckboxModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnChanges {
  /**
   * Lista de widgets recibidos del componente padre.
   */
  @Input() widgets: WidgetItemFuncionState[] = [];
  /**
   * Evento que se emite cuando un usuario activa/desactiva un widget.
   */
  @Output() toggleWidget = new EventEmitter<WidgetItemFuncionState>();
  /**
   * Evento que se emite cuando el usuario desea ver el Readme del widget.
   */
  @Output() verReadme = new EventEmitter<string>();

  /**
   * Lista de grupos de widgets organizados jerárquicamente para mostrar en el accordion.
   */
  grupos: GrupoDeWidgets[] = [];

  searchTerm = '';

  /**
   * Estado del accordion (PrimeNG v20+)
   * - Ya NO se controla con `activeIndex`.
   * - Ahora se controla con `value`.
   * - Con [multiple]="true", PrimeNG puede emitir string/number o arrays de esos.
   *   Normalizamos todo a `string[]`.
   */
  openValues: string[] = []; // valores actualmente abiertos (vista)
  private userOpenValues: string[] = []; // preferencias del usuario (sin búsqueda)

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Hook de ciclo de vida para detectar cambios en los Inputs.
   * Se vuelve a calcular la agrupación de widgets cuando cambia la lista.
   */
  ngOnChanges(changes: SimpleChanges): void {
    const widgetsChange = changes['widgets'];
    if (widgetsChange && widgetsChange.currentValue) {
      this.grupos = this.agruparWidgets(this.widgets);

      // Si no hay búsqueda, re-sincroniza con lo que el usuario tenía abierto
      if (!this.isSearching) {
        this.openValues = [...this.userOpenValues];
      }
    }
  }

  /** ¿Hay búsqueda activa? */
  get isSearching(): boolean {
    return !!this.normalizar(this.searchTerm);
  }

  /** Lista filtrada según searchTerm */
  get gruposFiltrados(): GrupoDeWidgets[] {
    const q = this.normalizar(this.searchTerm);
    if (!q) return this.grupos;

    return this.grupos
      .map(g => {
        const subFiltradas = g.subcategorias
          .map(s => {
            const subMatch = this.normalizar(String(s.nombre)).includes(q);
            if (subMatch) return s;

            const widgetsFiltrados = s.widgets.filter(w => {
              const titulo = this.normalizar(w.titulo ?? '');
              const nombre = this.normalizar(w.nombreWidget ?? '');
              return titulo.includes(q) || nombre.includes(q);
            });

            return widgetsFiltrados.length
              ? { ...s, widgets: widgetsFiltrados }
              : null;
          })
          .filter(
            (
              x
            ): x is {
              nombre: WidgetSubcategoria;
              widgets: WidgetItemFuncionState[];
            } => !!x
          );

        return subFiltradas.length
          ? { ...g, subcategorias: subFiltradas }
          : null;
      })
      .filter((x): x is GrupoDeWidgets => !!x);
  }

  /**
   * Helper para asegurar que el [value] del panel sea siempre string.
   * Evita usar String(...) en el template (que puede fallar con el type-checker).
   */
  asKey(v: unknown): string {
    return v == null ? '' : `${v}`;
  }

  /** Cambia el estado abierto/cerrado según búsqueda */
  onSearchChange(): void {
    if (this.isSearching) {
      // Espera a que el listado filtrado se pinte
      setTimeout(() => {
        // Abrir todas las categorías visibles durante búsqueda
        this.openValues = this.gruposFiltrados.map(g =>
          this.asKey(g.categoria)
        );
        // Si usas OnPush, esto ayuda; en default no estorba.
        this.cdr.markForCheck();
      }, 0);
    } else {
      // Restaura lo que el usuario tenía abierto
      this.openValues = [...this.userOpenValues];
    }
  }

  /**
   * Handler de cambios del accordion (PrimeNG v20+).
   * Puede emitir string/number o arrays. Normalizamos a string[].
   */
  onAccordionValueChange(
    v: string | number | (string | number)[] | null | undefined
  ): void {
    const arr = Array.isArray(v) ? v : v != null ? [v] : [];
    const normalized = arr.map(x => `${x}`);

    this.openValues = normalized;

    // Persistimos la preferencia del usuario SOLO si NO hay búsqueda
    if (!this.isSearching) {
      this.userOpenValues = [...normalized];
    }
  }

  private normalizar(v: string): string {
    return v
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  /**
   * Agrupa los widgets por categoría y subcategoría en una estructura jerárquica.
   * Esta estructura permite organizar los widgets en un accordion expandible.
   */
  private agruparWidgets(lista: WidgetItemFuncionState[]): GrupoDeWidgets[] {
    const mapa = new Map<
      WidgetCategoria,
      Map<WidgetSubcategoria, WidgetItemFuncionState[]>
    >();

    for (const widget of lista) {
      const cat = widget.categoria!;
      const sub = widget.subcategoria!;

      if (!mapa.has(cat)) {
        mapa.set(cat, new Map());
      }
      const submapa = mapa.get(cat)!;

      if (!submapa.has(sub)) {
        submapa.set(sub, []);
      }
      submapa.get(sub)!.push(widget);
    }

    const resultado: GrupoDeWidgets[] = [];
    for (const [categoria, submapa] of mapa.entries()) {
      const subcategorias = Array.from(submapa.entries()).map(
        ([nombre, widgets]) => ({
          nombre,
          widgets,
        })
      );
      resultado.push({ categoria, subcategorias });
    }

    return resultado;
  }

  /**
   * Acción al hacer clic en un checkbox de widget.
   * Dispara el evento `toggleWidget` con el widget seleccionado.
   */
  onToggle(widget: WidgetItemFuncionState): void {
    this.toggleWidget.emit(widget);
    console.log(`Toggle → ${widget.nombreWidget}:`, widget.abierto);
  }

  /**
   * Función de trackBy para optimizar el *ngFor de categorías.
   */
  trackByCategoria(index: number, grupo: GrupoDeWidgets): string {
    return this.asKey(grupo.categoria);
  }

  /**
   * Función de trackBy para optimizar el *ngFor de subcategorías.
   */
  trackBySubcategoria(
    index: number,
    sub: { nombre: WidgetSubcategoria }
  ): string {
    return this.asKey(sub.nombre);
  }

  /**
   * Función de trackBy para optimizar el *ngFor de widgets.
   */
  trackByNombreWidget(index: number, widget: WidgetItemFuncionState): string {
    return widget.nombreWidget;
  }
}
