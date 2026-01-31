import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

/**
 * Estructura genererica que contiene el layout principal para el visor Geografico Estandar
 * LAYOUT A
 * @date 16-06-2025
 * @author Andres Fabian Simbaqueba Del Rio
 * @author Juan Carlos Valderrama González
 */
@Component({
  selector: 'app-layout-a',
  standalone: true,
  imports: [ButtonModule, DrawerModule, CommonModule],
  templateUrl: './layout-a.component.html',
  styleUrl: './layout-a.component.scss',
})
export class LayoutAComponent implements OnInit {
  // Input para el template de la barra lateral
  @Input() sidebarTemplate: TemplateRef<unknown> | null = null;

  @ViewChild('sidebarContent', { static: false }) sidebarContent!: ElementRef;

  isSmallScreen = false; //variable para determinar si la resolucion de pantalla es de tipo movil
  showDrawerWithSidebar = false; //variable para mostrar el drawer con la barra lateral

  // Variables para el redimensionamiento
  sidebarWidth = 300; // anccho estandar
  minSidebarWidth = 300; // Ancho mínimo
  maxSidebarWidth = 800; // Ancho máximo
  isResizing = false;

  /**
   *Servicio que observa la resolución de pantalla de la aplicacion
   * @param breakpointObserver
   */
  constructor(private breakpointObserver: BreakpointObserver) {}

  /**
   * Inicializa el observador de resoluciones de pantalla
   * y setea las variables para mostrar u ocultar el drawer
   * y la barra lateral segun la resolucion de pantalla
   */
  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isSmallScreen = state.matches;
          this.showDrawerWithSidebar = false;
        } else {
          this.isSmallScreen = false;
        }
      });
  }
  /**
   * Metodo para mostrar/ocultar el drawer con la barra lateral
   */
  toggleDrawerWidSidebar() {
    this.showDrawerWithSidebar = !this.showDrawerWithSidebar;
  }

  /**
   * Inicia el redimensionamiento del sidebar
   */
  startResize(event: MouseEvent): void {
    this.isResizing = true;
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = this.sidebarWidth;

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isResizing) return;

      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;

      // Aplicar límites
      if (
        newWidth >= this.minSidebarWidth &&
        newWidth <= this.maxSidebarWidth
      ) {
        this.sidebarWidth = newWidth;
      }
    };

    const onMouseUp = () => {
      this.isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }
  /**
   * Obtiene el ancho actual del sidebar en píxeles
   */
  getSidebarWidthPx(): string {
    return `${this.sidebarWidth}px`;
  }
  /**
   * Obtiene el ancho del contenido del sidebar (restando el espacio del handle)
   */
  getSidebarContentWidthPx(): string {
    return `${this.sidebarWidth - 0}px`; // Restamos 6px del handle
  }

  isHovering = false;
}
