import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'SIG Ancestral de la Línea Negra',
    loadComponent: () =>
      import(
        '@projects/linea-negra/pages/index-page/index-page.component'
      ).then(m => m.IndexPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
