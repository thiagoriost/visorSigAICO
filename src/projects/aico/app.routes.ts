import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Sistema de Información Geográfico - AICO',
    loadComponent: () =>
      import(
        './pages/index-page/index-page.component' // Adjust the import path as necessary
      ).then(m => m.indexPageComponent),
  },

  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
