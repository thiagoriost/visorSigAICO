import { Component, OnDestroy } from '@angular/core';
import { DibujarService } from '@app/widget/dibujar/services/dibujar/dibujar.service';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OpcionesColorDibujoComponent } from '@app/widget/dibujar/components/opciones-color-dibujo/opciones-color-dibujo.component';
import { DibujarTextoComponent } from '@app/widget/dibujar/components/dibujar-texto/dibujar-texto.component';
import {
  BotonDibujo,
  TipoDibujo,
} from '@app/widget/dibujar/interfaces/boton-dibujo';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from 'environments/environment.development';
/**
 * Componente para mostrar y manejar herramientas de dibujo.
 * Muestra dinámicamente los botones disponibles y activa sus opciones específicas,
 * como color o entrada de texto.
 *
 * En la versión 2.0 se realizaron mejoras en la gestión de interacciones,
 * correcciones visuales en la previsualización de geometrías,
 * y se resolvieron errores relacionados con la reactivación de herramientas y los mensajes de cursor.
 *
 * @author Carlos Alberto Aristizabal Vargas
 * @collaborator Sergio Mariño Duque
 * @version 2.0
 * @since 2024-12-23
 */
@Component({
  selector: 'app-btn-dibujo',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    CommonModule,
    OpcionesColorDibujoComponent,
    DibujarTextoComponent,
    TooltipModule,
  ],
  templateUrl: './btn-dibujo.component.html',
  styleUrls: ['./btn-dibujo.component.scss'],
})
export class BtnDibujoComponent implements OnDestroy {
  /** Texto ingresado por el usuario para la herramienta de texto */
  texto = '';

  ngOnDestroy(): void {
    this.dibujarService.CloseDibujo();
  }

  /** Estado de visibilidad del componente de color */
  mostrarOpcionesColor = true;

  /** Estado de visibilidad del componente de texto */
  mostrarDibujarTexto = false;

  /** Herramienta de dibujo actualmente activa */
  modoActivo: TipoDibujo | '' = '';

  /** Observable de herramientas de dibujo disponibles (desde el environment) */
  drawingOptions = environment.opcionDibujo;

  constructor(private dibujarService: DibujarService) {}

  /**
   * Activa u oculta una herramienta de dibujo según el tipo.
   * Si la herramienta ya está activa, la desactiva.
   * @param tipo Tipo de herramienta de dibujo seleccionada
   */
  activarOpciones(tipo: TipoDibujo): void {
    if (this.modoActivo === tipo) {
      this.modoActivo = '';
      this.texto = '';
      this.mostrarDibujarTexto = false;

      this.dibujarService.resetDibujo();
    } else {
      this.modoActivo = tipo;

      if (tipo === 'Text') {
        this.mostrarDibujarTexto = true;
        this.mostrarOpcionesColor = false;
      } else {
        this.texto = '';
        this.mostrarDibujarTexto = false;
        this.mostrarOpcionesColor = true;
        this.dibujarService.addInteraction(tipo);
      }
    }
  }

  /**
   * Lista de todas las herramientas disponibles en forma de botones.
   */
  botones: BotonDibujo[] = [
    { id: 'btn-lapiz', tipo: 'Point', icon: 'pi pi-pencil', tooltip: 'Punto' },
    { id: 'btn-linea', tipo: 'Line', icon: 'pi pi-minus', tooltip: 'Línea' },
    {
      id: 'btn-poli-linea',
      tipo: 'LineString',
      icon: 'pi pi-wave-pulse',
      tooltip: 'Polilínea',
    },
    {
      id: 'btn-poli-linea-alzada',
      tipo: 'LineAlzada',
      icon: 'pi pi-pen-to-square',
      tooltip: 'Polilínea alzada',
    },
    {
      id: 'btn-triangulo',
      tipo: 'Triangle',
      icon: 'pi pi-sort-up-fill',
      tooltip: 'Triángulo',
    },
    {
      id: 'btn-extension',
      tipo: 'Extension',
      icon: 'pi pi-stop',
      tooltip: 'Extensión',
    },
    {
      id: 'btn-circulo',
      tipo: 'Circle',
      icon: 'pi pi-circle-fill',
      tooltip: 'Círculo',
    },
    {
      id: 'btn-poligono',
      tipo: 'Polygon',
      icon: 'pi pi-star-fill',
      tooltip: 'Polígono',
    },
    {
      id: 'btn-poligono-alzada',
      tipo: 'HanddrawPolygon',
      icon: 'pi pi-star-half',
      tooltip: 'Polígono alzado',
    },
    { id: 'btn-texto', tipo: 'Text', icon: 'pi pi-language', tooltip: 'Texto' },
  ];

  /**
   * Filtra y devuelve los botones que deben mostrarse según las opciones activas.
   * @param drawingOptions Tipos de dibujo habilitados
   * @returns Lista de botones visibles
   */
  botonesFiltrados(
    drawingOptions: ('Point' | 'LineString' | 'Polygon' | 'Circle')[]
  ): BotonDibujo[] {
    return this.botones.filter(btn =>
      this.mostrarBoton(btn.tipo, drawingOptions)
    );
  }

  /**
   * Determina si un botón de herramienta debe mostrarse según las opciones del store.
   * @param tipo Tipo de herramienta a verificar
   * @param drawingOptions Tipos permitidos
   * @returns `true` si debe mostrarse
   */
  mostrarBoton(
    tipo: TipoDibujo,
    drawingOptions: ('Point' | 'LineString' | 'Polygon' | 'Circle')[]
  ): boolean {
    switch (tipo) {
      case 'Point':
      case 'LineString':
      case 'Polygon':
      case 'Circle':
        return drawingOptions.includes(tipo);
      default:
        return false;
    }
  }
}
