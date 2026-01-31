import { Input, Directive } from '@angular/core';

@Directive()

/**
 * Clase que sirve como base para aplicar estilos de fondo
 * @date 05-09-2025
 * @author Heidy Paola Lopez Sanchez
 */
export abstract class BackgroundStyleComponent {
  /**
   * Valor recibido como input desde el template.
   * Puede ser un nombre de clase (ej: "bg-success-500") o un color en formato HEX/RGB.
   */
  @Input() background: string | null = null;

  /**
   * Verifica si el valor de `background` corresponde a un color válido.
   * Se considera válido si:
   *  - Empieza con "#"  → formato HEX (#RRGGBB)
   *  - Es "transparent"
   *  - Empieza con "rgb" → formato RGB o RGBA
   */
  get isColor(): boolean {
    return (
      !!this.background &&
      (this.background.startsWith('#') ||
        this.background === 'transparent' ||
        this.background.startsWith('rgb'))
    );
  }

  /**
   * Devuelve la clase CSS a aplicar.
   * - Si no se recibe ningún valor → aplica la clase por defecto "bg-primary-500".
   * - Si se recibe un color válido (HEX o RGB) → devuelve cadena vacía (usa estilo inline en `appliedStyle`).
   * - Si se recibe un nombre de clase → devuelve esa clase directamente.
   */
  get appliedClass(): string {
    if (!this.background) {
      return 'bg-primary-500';
    }
    return this.isColor ? '' : this.background;
  }

  /**
   * Devuelve un objeto de estilos en línea.
   * - Si `background` es un color válido (HEX/RGB/transparent) → aplica como `background`.
   * - Si no → devuelve objeto vacío (se usa la clase CSS en su lugar).
   */
  get appliedStyle(): Record<string, string> {
    return this.isColor && this.background
      ? { background: this.background }
      : {};
  }
}
