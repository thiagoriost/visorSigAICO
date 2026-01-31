import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'OPIAC - Visor Geográfico',
    loadComponent: () =>
      import(
        '@projects/opiac/pages/index/index-page/index-page.component'
      ).then(m => m.IndexPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
