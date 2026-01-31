import { Routes } from '@angular/router';
/**
 * @fileoverview
 * Definición de las rutas principales de la aplicación AISO.
 * Este archivo configura el enrutamiento base y la carga diferida del componente principal.
 *@author Heidy Paola Lopez Sanchez
 **/

export const routes: Routes = [
  {
    path: '',
    title: 'AISO - Visor Geográfico',
    loadComponent: () =>
      import('@projects/aiso/pages/index-page/index-page.component').then(
        m => m.IndexPageComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
