import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { InfoPanelService } from '@app/widget/InfoPanel/services/info-panel.service';
import { Coordinate } from 'ol/coordinate';
import { PopUpComponent } from '@app/widget/InfoPanel/components/pop-up/pop-up.component';
import { MiniMapComponent } from '@app/widget/miniMap/components/mini-map/mini-map.component';
import { IdentifyComponent } from '@app/widget/identify/components/identify/identify.component';
import { BuscarDireccionComponent } from '@app/widget/buscarDireccion/components/buscar-direccion/buscar-direccion.component';

/**
 * Componente lanzador del panel de información.
 *
 * Permite ingresar coordenadas y abrir/cerrar un popup en el mapa.
 */
@Component({
  selector: 'app-info-panel-launcher',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    PopUpComponent,
    MiniMapComponent,
    IdentifyComponent,
    BuscarDireccionComponent,
  ],
  templateUrl: './info-panel-launcher.component.html',
  styleUrls: ['./info-panel-launcher.component.scss'],
})
export class InfoPanelLauncherComponent {
  /** Formulario reactivo para coordenadas */
  formCoords: FormGroup;

  /** Estado del popup (abierto o cerrado) */
  isPopupOpen = false;

  /** Identificadores de los popups abiertos */
  arrayPopupIds: number[] = [];

  /** Color permitido para el encabezado: primary | surface | white */
  @Input() color: 'primary' | 'surface' | 'white' = 'surface';

  constructor(
    private infoPanelService: InfoPanelService,
    private fb: FormBuilder
  ) {
    this.formCoords = this.fb.group({
      lon: [-74.08175, [Validators.required]],
      lat: [4.60971, [Validators.required]],
    });
  }

  /** Coordenadas ingresadas en el formulario */
  get coords(): Coordinate {
    return [this.formCoords.value.lon, this.formCoords.value.lat];
  }

  /**
   * Alterna la apertura/cierre del popup.
   * Valida las coordenadas antes de abrirlo.
   */
  togglePopup(popup: PopUpComponent): void {
    if (this.arrayPopupIds.includes(popup.id!)) {
      // Cerrar solo este popup
      this.infoPanelService.closePopup(popup.id!);
      this.arrayPopupIds = this.arrayPopupIds.filter(id => id !== popup.id);
      popup.id = undefined;
    } else {
      if (this.formCoords.invalid) {
        this.formCoords.markAllAsTouched();
        return;
      }
      const id = this.infoPanelService.createPopup(
        this.coords,
        popup.popupNode
      );
      this.arrayPopupIds.push(id);
      popup.id = id;
    }
  }
}
