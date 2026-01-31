/**
 * Componente ReadmeModalComponent
 *
 * Modal ligero que muestra la documentación (README) de un widget específico.
 * El contenido se carga desde una URL proporcionada por el componente padre.
 *
 * Características:
 * - Usa PrimeNG Dialog para el modal.
 * - Carga el archivo Markdown como texto plano vía HttpClient.
 * - Muestra diferentes estados de carga: "cargando", "ok", "error", "vacio".
 *
 * Este componente está diseñado para ser autónomo (standalone) y reutilizable.
 *
 * @author Sergio Alonso Mariño Duque
 * @date 05-08-2025
 * @version 1.0.0
 *
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-readme-modal',
  imports: [CommonModule, DialogModule, ButtonModule, HttpClientModule],
  templateUrl: './readme-modal.component.html',
  styleUrls: ['./readme-modal.component.scss'],
})
export class ReadmeModalComponent implements OnChanges {
  /**
   * Controla la visibilidad del modal. Se enlaza vía two-way binding con el padre.
   */
  @Input() visible = false;
  /**
   * Ruta del archivo Markdown a cargar. Se espera una URL local (ej: assets/...)
   */
  @Input() readmeUrl = '';
  /**
   * Evento emitido al cerrar el modal, para que el componente padre lo oculte.
   */
  @Output() cerrarModal = new EventEmitter<void>();
  /**
   * Contenido textual del archivo README cargado.
   */
  contenido = '';

  /**
   * Estado actual de carga:
   * - "cargando": mientras se hace la petición HTTP.
   * - "ok": contenido cargado exitosamente.
   * - "error": fallo al cargar.
   * - "vacio": URL vacía o contenido en blanco.
   */
  estado: 'cargando' | 'ok' | 'error' | 'vacio' = 'vacio';

  constructor(private http: HttpClient) {}

  /**
   * Hook que reacciona a los cambios en los @Input (especialmente `readmeUrl`).
   * Al detectar una nueva URL válida, intenta cargar el archivo de documentación.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readmeUrl']) {
      if (!this.readmeUrl) {
        this.contenido = '';
        this.estado = 'vacio';
        return;
      }

      this.estado = 'cargando';

      this.http.get(this.readmeUrl, { responseType: 'text' }).subscribe({
        next: txt => {
          this.contenido = txt ?? '';
          this.estado = this.contenido.trim() ? 'ok' : 'vacio';
        },
        error: () => {
          this.contenido = '';
          this.estado = 'error';
        },
      });
    }
  }

  /**
   * Cierra el modal y notifica al componente padre.
   */
  cerrar() {
    this.cerrarModal.emit();
  }
}
