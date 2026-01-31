import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';

/**
 * Componente: LayoutCComponent
 * ---------------------------
 * Layout estructural principal del visor.
 *
 * Funciona como un "shell" que organiza:
 * - Mapa en el fondo.
 * - Sidebar flotante lateral (TOC, ayuda, metadata, etc.).
 * - Botones flotantes móviles.
 * - Header opcional.
 *
 * Responsabilidades:
 * - Controlar el ancho, offsets y gaps del sidebar tanto en desktop
 *   como en móvil, con la posibilidad de redimensionar manualmente
 *   el panel lateral (drag-resize en desktop).
 *
 * - Cambiar entre:
 *   - Modo desktop: sidebar fijo/redimensionable.
 *   - Modo mobile: drawer flotante + botón flotante para abrir/cerrar TOC.
 *
 * - Exponer el estado visual del contenedor TOC+AYUDA (`tocHidden`) para que
 *   otros componentes (ej. botones flotantes) puedan reaccionar. Este panel
 *   TOC/AYUDA puede ocultarse sin necesariamente ocultar todo el sidebar.
 *
 * Flujo general:
 * 1) En `ngOnInit()`, el componente escucha breakpoints `XSmall` y `Small`.
 *    - Si entra en modo móvil (`isSmallScreen = true`), se fuerza
 *      `showDrawerWithSidebar = false` para cerrar el drawer.
 *
 * 2) El template usa helpers como:
 *    - `getResponsiveSidebarWidth()`
 *    - `getResponsiveRightOffset()`
 *    ...para calcular estilos inline dependiendo de si es mobile o desktop.
 *
 * 3) En desktop, si `enableResize = true`, el usuario puede arrastrar el borde
 *    del sidebar para ajustar `sidebarWidth`. Ese ancho se emite hacia arriba
 *    con `sidebarWidthChange`.
 *
 * 4) Métodos `toggleToc()` y `tocHiddenChange` manejan SOLO la visibilidad del
 *    contenedor TOC+AYUDA, sin afectar el resto del panel.
 *
 * Detalles añadidos para móvil:
 * - Cuando el TOC está visible en móvil (`tocHidden === false`),
 *   el sidebar ocupa MÁS ancho (usamos `mobileSidebarExpandedWidthVW` y `mobileSidebarExpandedMaxPx`)
 *   para que el contenido sea legible y navegable.
 *
 * - El botón flotante móvil que abre/cierra el TOC (`mobileTocButtonSize`)
 *   se hace más grande para mejor usabilidad táctil.
 *
 * Notas:
 * - Este layout NO conoce el contenido específico del sidebar. Ese contenido
 *   se inyecta desde afuera por medio de `@Input() sidebarTemplate`.
 *
 * - Las propiedades de spacing como `sidebarTopGap`, `sidebarBottomGap`,
 *   offsets móviles, etc., están expuestas como @Input() para permitir
 *   pixel-perfect tuning desde el contenedor de más alto nivel (Gobierno Mayor).
 *
 * - Este componente administra detalle visual MUY fino del diseño GM
 *   (por ejemplo, `logoCardHeight`, `logoCardBottomGap`, offsets de flecha,
 *   safe areas inferiores en móvil).
 *
 * @author  Sergio Alonso Mariño Duque
 * @date    2025-10-31
 * @version 1.0.0
 */
@Component({
  selector: 'app-layout-c',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DrawerModule,
    TooltipModule,
    RippleModule,
  ],
  templateUrl: './layout-c.component.html',
  styleUrl: './layout-c.component.scss',
})
export class LayoutCComponent implements OnInit {
  /**
   * sidebarTemplate
   * ---------------
   * TemplateRef que contiene el contenido del sidebar:
   * TOC, ayuda, metadata, leyendas, etc.
   * Se inyecta desde el padre usando ng-template.
   */
  @Input() sidebarTemplate: TemplateRef<unknown> | null = null;

  /**
   * showHeader
   * ----------
   * Si true, el layout reserva y renderiza la franja de header superior.
   * Si false, el mapa/sub-layout "toma" todo el alto disponible.
   */
  @Input() showHeader = true;

  // ===== Configuración Desktop =====

  /**
   * sidebarWidth
   * ------------
   * Ancho actual (en px) del panel lateral en desktop.
   * Este valor puede cambiar con el resize por drag.
   */
  @Input() sidebarWidth = 320;

  /**
   * sidebarRightOffset
   * ------------------
   * Distancia (px) entre el borde derecho del sidebar y el borde derecho
   * de la ventana/viewport en desktop. Sirve para lograr el efecto de
   * "sidebar flotando separado del borde".
   */
  @Input() sidebarRightOffset = 24;

  /**
   * minSidebarWidth / maxSidebarWidth
   * ---------------------------------
   * Límites duros del ancho del sidebar cuando se está redimensionando
   * vía drag en desktop.
   */
  @Input() minSidebarWidth = 280;
  @Input() maxSidebarWidth = 800;

  /**
   * sidebarCollapsed
   * ----------------
   * Colapso clásico tipo "rail". Cuando true, en lugar de ancho completo
   * se muestra una versión delgada (sidebarRailWidth).
   */
  @Input() sidebarCollapsed = false;

  /**
   * sidebarRailWidth
   * ----------------
   * Ancho (px) del modo "colapsado" tipo rail.
   */
  @Input() sidebarRailWidth = 56;

  /**
   * sidebarTopGap / sidebarBottomGap
   * --------------------------------
   * Offset superior e inferior (px) del bloque del sidebar en desktop.
   * Sirven para alejarlo de los bordes del viewport.
   */
  @Input() sidebarTopGap = 16;
  @Input() sidebarBottomGap = 88;

  /**
   * bottomSafeArea
   * --------------
   * Extra padding inferior agregado a los cálculos del gap bottom,
   * generalmente para no tapar con controles flotantes del móvil
   * o respetar zonas seguras.
   */
  @Input() bottomSafeArea = 70;

  /**
   * sidebarIconBox
   * --------------
   * Tamaño cuadrado (px) de la "caja" donde viven íconos grandes del sidebar.
   * Este valor se reutiliza para calcular espaciados internos.
   */
  @Input() sidebarIconBox = 56;

  /**
   * leftToolbarTop
   * --------------
   * Offset (px) desde el top del layout donde se colocan botones/toolbar
   * flotantes de la izquierda (por ejemplo, controles de zoom).
   */
  @Input() leftToolbarTop = 80;

  /**
   * bottomContentPadding
   * --------------------
   * Padding inferior adicional dentro del contenido del sidebar
   * (debajo de TOC/AYUDA).
   */
  @Input() bottomContentPadding = 16;

  /**
   * logoUrl
   * -------
   * Ruta del logo que se muestra en la tarjeta superior del sidebar.
   * Permite personalizar marca (Gobierno Mayor, etc.).
   */
  @Input()
  logoUrl = 'assets/images/SIG gobierno mayor_Logo.png';

  /**
   * enableResize
   * ------------
   * Habilita o no la posibilidad de arrastrar el borde lateral para
   * cambiar el ancho del sidebar en desktop.
   */
  @Input() enableResize = false;

  /**
   * expandedArrowOffset
   * -------------------
   * Ajuste visual fino (px) para posicionar la flecha indicadora de expansión.
   * Se usa al dibujar la pequeña "pestaña" o "arrow" en el borde del panel.
   */
  @Input() expandedArrowOffset = 6;

  /**
   * panelHeightPercent
   * ------------------
   * Altura del bloque (logo + panel interno) expresada en porcentaje
   * del alto útil disponible.
   * Ejemplo: 100 significa usar todo el alto disponible.
   */
  @Input() panelHeightPercent = 100;

  // ===== Configuración Mobile (modo compacto) =====

  /**
   * mobileSidebarWidthVW
   * --------------------
   * Ancho del sidebar móvil como porcentaje del viewport width
   * cuando el panel (TOC) está oculto o minimizado.
   * Ej: 82 significa "ocupa ~82vw".
   */
  @Input() mobileSidebarWidthVW = 82;

  /**
   * mobileSidebarMaxPx
   * ------------------
   * Máximo ancho absoluto (px) permitido para el sidebar en móvil
   * cuando está oculto/compacto.
   * Se combina con `mobileSidebarWidthVW`.
   */
  @Input() mobileSidebarMaxPx = 380;

  /**
   * mobileRightOffset / mobileTopGap / mobileBottomGap
   * --------------------------------------------------
   * Versiones móviles de los offsets/gaps que en desktop dependen de
   * `sidebarRightOffset`, `sidebarTopGap`, `sidebarBottomGap`.
   * Estos valores ajustan la posición del panel flotante en pantallas pequeñas.
   */
  @Input() mobileRightOffset = 10;
  @Input() mobileTopGap = 10;
  @Input() mobileBottomGap = -10;

  // ===== Configuración Mobile (modo expandido con TOC visible) =====

  /**
   * mobileSidebarExpandedWidthVW
   * ----------------------------
   * Ancho del sidebar en móvil cuando el TOC está VISIBLE
   * (`tocHidden === false`).
   *
   * Es más grande que `mobileSidebarWidthVW` para que el usuario pueda
   * leer/usar cómodamente el contenido del panel en pantallas pequeñas.
   *
   * Ej: 92 significa "ocupa ~92vw".
   */
  @Input() mobileSidebarExpandedWidthVW = 92;

  /**
   * mobileSidebarExpandedMaxPx
   * --------------------------
   * Máximo ancho absoluto (px) permitido para el sidebar en móvil cuando
   * el TOC está visible. Un poco más ancho que el modo compacto.
   *
   * Ej: 420px en tablets chicas.
   */
  @Input() mobileSidebarExpandedMaxPx = 420;

  /**
   * sidebarWidthChange
   * ------------------
   * Se emite cuando el usuario redimensiona manualmente el sidebar en desktop.
   * El valor emitido es el nuevo ancho (px).
   */
  @Output() sidebarWidthChange = new EventEmitter<number>();

  /**
   * Referencia directa al contenedor interno del sidebar,
   * útil si se necesita medir scrollHeight, aplicar focus, etc.
   */
  @ViewChild('sidebarContent', { static: false }) sidebarContent!: ElementRef;

  /**
   * mobileTocButtonSize
   * -------------------
   * Tamaño (px) del botón flotante móvil que abre/cierra el panel TOC/AYUDA.
   *
   * Ajustado para usabilidad táctil:
   *   Antes: 40
   *   Ahora: 52
   */
  mobileTocButtonSize = 62;

  /**
   * isSmallScreen
   * -------------
   * true  => breakpoints XSmall/Small activos (móvil/tablet chica)
   * false => desktop / pantallas grandes
   *
   * Controla la lógica condicional de layout y estilos.
   */
  isSmallScreen = false;

  /**
   * showDrawerWithSidebar
   * ---------------------
   * En móvil, representa si el drawer lateral (que contiene el sidebar)
   * está visible o no.
   *
   * En desktop prácticamente no se usa.
   */
  showDrawerWithSidebar = false; // compat

  /**
   * isResizing / isHovering
   * -----------------------
   * Flags de interacción en desktop.
   * - isResizing: indica que el usuario está arrastrando el borde del sidebar.
   * - isHovering: se puede usar en template para cambiar estilos al pasar el mouse.
   */
  isResizing = false;
  isHovering = false;

  /**
   * tocHidden
   * ---------
   * Controla específicamente la visibilidad del bloque TOC + AYUDA dentro del sidebar.
   * IMPORTANTE: ocultar TOC no significa ocultar todo el panel lateral.
   *
   * Este estado también se usa para ajustar la posición de docks/botones flotantes.
   *
   * Además, en móvil controla el ancho:
   * - tocHidden === false -> panel expandido (más ancho).
   * - tocHidden === true  -> panel compacto (más estrecho).
   */
  @Input() tocHidden = false;

  /**
   * tocHiddenChange
   * ---------------
   * Se emite cuando el usuario pide ocultar/mostrar el bloque TOC + AYUDA.
   * Esto permite al contenedor padre sincronizar visualmente otros elementos.
   */
  @Output() tocHiddenChange = new EventEmitter<boolean>();

  /**
   * @param breakpointObserver BreakpointObserver
   *        Observa breakpoints `XSmall` y `Small` para alternar comportamiento
   *        móvil/desktop en tiempo real.
   */
  constructor(private breakpointObserver: BreakpointObserver) {}

  /**
   * ngOnInit()
   * ----------
   * Se suscribe a los breakpoints móviles.
   * - Actualiza `isSmallScreen`.
   * - Si entramos a modo móvil, por seguridad cierra el drawer (`showDrawerWithSidebar = false`),
   *   evitando que quede abierto al rotar/rescalar la ventana.
   */
  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((state: BreakpointState) => {
        this.isSmallScreen = !!state.matches;
        if (this.isSmallScreen) this.showDrawerWithSidebar = false;
      });
  }

  // ===========================================================================
  // Acciones UI / Toggles
  // ===========================================================================

  /**
   * toggleDrawerWithSidebar()
   * -------------------------
   * Controla la visibilidad del drawer móvil que contiene el sidebar.
   * Solo tiene efecto real en pantallas pequeñas.
   */
  toggleDrawerWithSidebar(): void {
    this.showDrawerWithSidebar = !this.showDrawerWithSidebar;
  }

  /**
   * toggleSidebar()
   * ---------------
   * Activa/desactiva el modo "rail colapsado" del sidebar.
   * Este colapso es distinto a ocultar TOC: aquí cambia el ancho general.
   */
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  /**
   * toggleToc()
   * -----------
   * Oculta/muestra EXCLUSIVAMENTE el contenedor TOC + AYUDA.
   * Emite el nuevo estado para que el padre pueda reaccionar.
   *
   * En móvil, esto también afecta el ancho calculado:
   * - Si pasa a visible (tocHidden=false) → usamos ancho expandido.
   * - Si pasa a oculto  (tocHidden=true)  → usamos ancho compacto.
   */
  toggleToc(): void {
    this.tocHidden = !this.tocHidden;
    this.tocHiddenChange.emit(this.tocHidden);
  }

  // ===========================================================================
  // Helpers responsivos
  // ===========================================================================

  /**
   * getResponsiveSidebarWidth()
   * ---------------------------
   * Devuelve el ancho CSS calculado del sidebar según:
   *
   * - Desktop:
   *      Usa `sidebarWidth` en px.
   *
   * - Mobile + TOC visible   (tocHidden === false):
   *      Usa un ancho MÁS ANCHO (`mobileSidebarExpandedWidthVW` limitado por
   *      `mobileSidebarExpandedMaxPx`) para que la tabla de contenido sea
   *      cómoda de leer.
   *
   * - Mobile + TOC oculto    (tocHidden === true):
   *      Usa el ancho compacto original (`mobileSidebarWidthVW` /
   *      `mobileSidebarMaxPx`) para que estorbe menos el mapa.
   */
  getResponsiveSidebarWidth(): string {
    if (!this.isSmallScreen) {
      // Desktop / tablet grande => ancho fijo en px
      return `${this.sidebarWidth}px`;
    }

    // Móvil
    if (!this.tocHidden) {
      // TOC visible -> versión EXPANDIDA
      return `min(${this.mobileSidebarExpandedWidthVW}vw, ${this.mobileSidebarExpandedMaxPx}px)`;
    }

    // TOC oculto -> versión COMPACTA
    return `min(${this.mobileSidebarWidthVW}vw, ${this.mobileSidebarMaxPx}px)`;
  }

  /**
   * getResponsiveRightOffset()
   * --------------------------
   * Offset lateral derecho (px) que separa visualmente el panel del borde.
   * Cambia entre desktop y mobile.
   */
  getResponsiveRightOffset(): string {
    return `${
      this.isSmallScreen ? this.mobileRightOffset : this.sidebarRightOffset
    }px`;
  }

  /**
   * getResponsiveTopGap()
   * ---------------------
   * Distancia superior (px) del sidebar flotante al tope del viewport,
   * dependiendo del modo (desktop vs mobile).
   */
  getResponsiveTopGap(): string {
    return `${this.isSmallScreen ? this.mobileTopGap : this.sidebarTopGap}px`;
  }

  /**
   * getResponsiveBottomGap()
   * ------------------------
   * Distancia inferior agregada al sidebar flotante.
   * Suma el gap base más `bottomSafeArea` para evitar superposición
   * con docks/botones flotantes en mobile.
   */
  getResponsiveBottomGap(): string {
    const base = this.isSmallScreen
      ? this.mobileBottomGap
      : this.sidebarBottomGap;
    return `${base + this.bottomSafeArea}px`;
  }

  /**
   * collapseBarSize
   * ---------------
   * Tamaño de la barra colapsada (rail). Se usa en varios cálculos
   * internos de espacios y también para altura de botones dock.
   */
  get collapseBarSize(): number {
    return this.sidebarIconBox;
  }

  /**
   * logoCardHeight (privado)
   * ------------------------
   * Alto de la tarjeta/logo superior dentro del sidebar
   * (icono grande + branding).
   */
  private get logoCardHeight(): number {
    return this.collapseBarSize + 10;
  }

  /**
   * logoCardBottomGap
   * -----------------
   * Separación vertical adicional bajo la tarjeta del logo.
   * Valor fijo pequeño (px).
   */
  private readonly logoCardBottomGap = -3;

  /**
   * sidebarTopSpacer
   * ----------------
   * Espacio total que debe dejarse ANTES del contenido navegable del sidebar,
   * combinando el alto de la tarjeta/logo más el pequeño gap inferior.
   */
  get sidebarTopSpacer(): number {
    return this.logoCardHeight + this.logoCardBottomGap;
  }

  /**
   * contentBottomSpacer
   * -------------------
   * Espacio al final del contenido útil del sidebar antes de que empiece
   * la zona de botones flotantes / docks inferiores.
   */
  get contentBottomSpacer(): number {
    return this.collapseBarSize + this.bottomContentPadding;
  }

  /**
   * expandedArrowBottomPx
   * ---------------------
   * Offset vertical usado para posicionar visualmente la "flecha" (indicador
   * de expansión) en el borde del panel.
   * Es negativo porque normalmente esa flecha se dibuja "pegada" al borde.
   */
  get expandedArrowBottomPx(): number {
    return -Math.abs(this.expandedArrowOffset);
  }

  // ===========================================================================
  // Compat helpers (modo rail legacy)
  // ===========================================================================

  /**
   * getSidebarWidthPx()
   * -------------------
   * Devuelve el ancho efectivo en px del contenedor sidebar según esté
   * colapsado o no. Se usa como fallback en algunos estilos legacy.
   */
  getSidebarWidthPx(): string {
    return `${
      this.sidebarCollapsed ? this.sidebarRailWidth : this.sidebarWidth
    }px`;
  }

  /**
   * getSidebarContentWidthPx()
   * --------------------------
   * Igual que `getSidebarWidthPx()` pero usado donde el template requiere
   * forzar el mismo ancho en el contenedor interno.
   */
  getSidebarContentWidthPx(): string {
    return `${
      this.sidebarCollapsed ? this.sidebarRailWidth : this.sidebarWidth
    }px`;
  }

  // ===========================================================================
  // Dock / botones flotantes (incluye botón móvil con logo)
  // ===========================================================================

  /**
   * buttonBottomGap
   * ---------------
   * Calcula en px la posición vertical (desde el bottom) del dock/botón
   * flotante que abre/cierra el TOC.
   *
   * Si el TOC está oculto (`tocHidden = true`), el botón sube (90).
   * Si el TOC está visible, puede quedar más cerca del panel (-50).
   *
   * Nota: Se usa en desktop/tablet para posicionar el dock.
   */
  get buttonBottomGap(): number {
    return this.tocHidden ? 90 : -50;
  }

  /**
   * panelBottomPadding
   * ------------------
   * Padding interno inferior extra para el contenido principal del sidebar,
   * depende de si estamos en móvil (espacios más reducidos).
   */
  get panelBottomPadding(): number {
    return this.isSmallScreen ? 8 : 12;
  }

  // ahora (público, nombre claro):
  get logoOnlyHeight(): number {
    return this.collapseBarSize + 10; // mismo cálculo que tenías
  }

  // ===========================================================================
  // Resize manual del sidebar (solo desktop)
  // ===========================================================================

  /**
   * startResize(event)
   * ------------------
   * Inicia la interacción de "drag to resize" del sidebar en desktop.
   *
   * - Solo funciona si:
   *    - `enableResize === true`
   *    - `tocHidden === false` (no tiene sentido redimensionar si el panel está oculto)
   *
   * - Registra listeners globales `mousemove` y `mouseup` en `document`
   *   para actualizar el ancho dinámicamente mientras el usuario arrastra.
   *
   * - Emite `sidebarWidthChange` en tiempo real cuando el ancho es válido.
   *
   * @param event MouseEvent del mousedown en el "resizer handle".
   */
  startResize(event: MouseEvent): void {
    if (!this.enableResize || this.tocHidden) return; // si no hay contenido visible, no resizar

    this.isResizing = true;
    event.preventDefault();

    // Punto inicial del drag
    const startX = event.clientX;
    const startWidth = this.sidebarWidth;

    // Handler mientras se arrastra
    const onMouseMove = (e: MouseEvent) => {
      if (!this.isResizing) return;

      // deltaX positivo significa que el cursor se movió hacia la IZQUIERDA,
      // lo que haría el panel más grande (porque el panel está a la derecha).
      const deltaX = startX - e.clientX;
      const newWidth = startWidth + deltaX;

      // Respetar límites configurables
      if (
        newWidth >= this.minSidebarWidth &&
        newWidth <= this.maxSidebarWidth
      ) {
        this.sidebarWidth = newWidth;
        this.sidebarWidthChange.emit(this.sidebarWidth);
      }
    };

    // Handler cuando se suelta el mouse
    const onMouseUp = () => {
      this.isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Restaurar estilos del cursor
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    // Listeners globales para el drag
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Feedback visual durante el resize
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  /**
   * mobileTocIcon
   * -------------
   * Devuelve la clase del ícono del botón flotante móvil que abre/cierra TOC.
   *
   * Regla visual:
   * - `tocHidden = true`  -> panel (TOC) oculto -> ícono apunta hacia adentro (abrir)
   * - `tocHidden = false` -> panel visible     -> ícono apunta hacia afuera (cerrar)
   */
  get mobileTocIcon(): string {
    return this.tocHidden ? 'icon-gm_izquierda' : 'icon-gm_derecha';
  }
}
