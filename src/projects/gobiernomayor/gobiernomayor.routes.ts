import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Gobierno Mayor - Visor Geográfico',
    loadComponent: () =>
      import(
        '@projects/gobiernomayor/pages/index/index-page/index-page.component'
      ).then(m => m.IndexPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
