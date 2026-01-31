import { animate, style, transition, trigger } from '@angular/animations';

/**
 * Animacion que hace aparecer un div desde la parte superior del componente en cámara lenta y al
 * ocultarlo lo desplaza hacia la parte superior del componente
 * @date 11-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
export const slideDownSlow = trigger('slideDownSlow', [
  transition(':enter', [
    style({
      transform: 'translateY(-100%)',
      opacity: 0,
    }),
    animate(
      '400ms ease-out',
      style({
        transform: 'translateY(0)',
        opacity: 1,
      })
    ),
  ]),
  transition(':leave', [
    animate(
      '300ms ease-in',
      style({
        transform: 'translateY(-100%)',
        opacity: 0,
      })
    ),
  ]),
]);
