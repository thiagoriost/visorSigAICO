// tour-steps.ts
import { TourGuideStep } from '@sjmc11/tourguidejs/src/types/TourGuideStep';

/**
 * Pasos por defecto del tour principal
 */
export const launcherTourSteps: TourGuideStep[] = [
  {
    content: 'Bienvenido  Aquí comienzas',
    title: 'Inicio',
    target: '#btnInicio',
  },
  {
    content: 'Aquí encuentras los reportes ',
    title: 'Reportes',
    target: '#menuReportes',
  },
  {
    content: 'Pulsa aquí si necesitas soporte ',
    title: 'Ayuda',
    target: '#btnAyuda',
  },
];
