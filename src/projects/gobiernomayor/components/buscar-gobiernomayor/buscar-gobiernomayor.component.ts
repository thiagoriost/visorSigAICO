import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuscarDireccionComponent } from '@app/widget/buscarDireccion/components/buscar-direccion/buscar-direccion.component';

/**
 * Componente encargado de renderizar el buscador
 * @date 26-08-2025
 * @author Sergio Alonso Mariño
 */
@Component({
  selector: 'app-buscar-gobiernomayor',
  standalone: true,
  imports: [CommonModule, BuscarDireccionComponent],
  templateUrl: './buscar-gobiernomayor.component.html',
})
export class BuscarGobiernomayorComponent {}
