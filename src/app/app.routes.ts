import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Playground de Widgets',
    loadComponent: () =>
      import(
        './core/pages/playground/playground-page/playground-page.component'
      ).then(m => m.PlaygroundPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
