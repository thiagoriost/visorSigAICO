import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'CRIC - Visor Geográfico',
    loadComponent: () =>
      import('@projects/cric/pages/index/index-page/index-page.component').then(
        m => m.IndexPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
