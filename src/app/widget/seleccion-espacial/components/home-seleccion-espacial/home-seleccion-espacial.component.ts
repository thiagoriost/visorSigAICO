import { Component, OnDestroy, OnInit } from '@angular/core';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { SeleccionEspacialService } from '@app/widget/seleccion-espacial/services/seleccion-espacial-service/seleccion-espacial.service';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SeleccionEspacialQueryService } from '@app/widget/seleccion-espacial/services/seleccion-espacial-query-service/seleccion-espacial-query.service';
import { TooltipModule } from 'primeng/tooltip';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { WorkareaDropdownSelectComponent } from '@app/shared/components/workarea-dropdown-select/workarea-dropdown-select.component';
import { Subscription } from 'rxjs';
import { LoadingDataMaskWithOverlayComponent } from '@app/shared/components/loading-data-mask-with-overlay/loading-data-mask-with-overlay.component';
import { CommonModule } from '@angular/common';

/**
 * Componente encargado de manejar el widget de selección espacial
 * @date 13-05-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-home-seleccion-espacial',
  standalone: true,
  imports: [
    ButtonModule,
    ToastModule,
    TooltipModule,
    ReactiveFormsModule,
    WorkareaDropdownSelectComponent,
    LoadingDataMaskWithOverlayComponent,
    CommonModule,
  ],
  providers: [
    SeleccionEspacialService,
    MessageService,
    SeleccionEspacialQueryService,
  ],
  templateUrl: './home-seleccion-espacial.component.html',
  styleUrl: './home-seleccion-espacial.component.scss',
})
export class HomeSeleccionEspacialComponent implements OnInit, OnDestroy {
  isDisabledButtons = true; //variable para habilitar/deshabilitar losbotones del componente
  seleccionEspacialForm: FormGroup;
  isLoadingData = true;
  private subscription!: Subscription;
  filtroServicio = 'wfs'; //variable para filtrar capas de tipo WFS

  /**
   * Crea la instancia del componente
   * @param seleccionEspacialService servicio para la  seleccion espacial
   * @param messageService  servicio de mensajes
   */
  constructor(
    private seleccionEspacialService: SeleccionEspacialService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {
    this.seleccionEspacialForm = this.formBuilder.group({});
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.seleccionEspacialService.deleteSelection();
  }

  ngOnInit(): void {
    this.seleccionEspacialForm = this.formBuilder.group({
      layerSelected: ['', [Validators.required], []],
    });

    this.seleccionEspacialForm.valueChanges.subscribe(value => {
      const layerSelected: CapaMapa = value.layerSelected as CapaMapa;
      if (layerSelected) {
        this.seleccionEspacialService.setLayerSelected(layerSelected);
        this.isDisabledButtons = !this.isDisabledButtons;
      }
    });
    if (this.seleccionEspacialService.isSearchingInfo$) {
      this.subscription =
        this.seleccionEspacialService.isSearchingInfo$.subscribe(value => {
          this.isLoadingData = value;
        });
    }
  }

  /**
   * Metodo para limpiar la seleccion de las geometrias
   */
  cleanSelection() {
    this.seleccionEspacialService.deleteSelection();
  }

  /**
   * Metodo para activar la selección espacial
   * si no hay una capa seleccionada muestra mensaje de error
   */
  onselectButton() {
    if (!this.seleccionEspacialService.selectedLayer) {
      this.messageService.add({
        summary: 'Error',
        detail: 'No se ha seleccionado una capa',
        severity: 'error',
        life: 3000,
      });
    } else {
      this.seleccionEspacialService.deleteGeometries();
      this.seleccionEspacialService.deleteDraw();
      this.seleccionEspacialService.activarSeleccion();
    }
  }

  onEmmitedLayer(layer: CapaMapa) {
    this.seleccionEspacialService.setLayerSelected(layer);
    this.isDisabledButtons = !this.isDisabledButtons;
  }
}
