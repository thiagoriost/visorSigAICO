// ==== ANGULAR CORE ====
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// ==== PRIMENG MODULES ====
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { Select, SelectModule } from 'primeng/select';

// ==== SERVICES ====
import { UrlWMSService } from '@app/shared/services/urlWMS/url-wms.service';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { MapState } from '@app/core/interfaces/store/map.model';
import { Store } from '@ngrx/store';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapActions } from '@app/core/store/map/map.actions';
import { WMSLayer } from '../../interfaces/wms-capabilities';

/**
 * Componente para adicionar un servicio WMS mediante un formulario.
 * Permite ingresar una URL y obtener las capas disponibles en el WMS.
 * @author Heidy Paola Lopez Sanchez
 */
@Component({
  selector: 'app-add-wms',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CommonModule,
    DividerModule,
    SelectModule,
    MessageModule,
    Select,
  ],
  templateUrl: './add-wms.component.html',
  styleUrl: './add-wms.component.scss',
})
export class AddWmsComponent implements OnInit {
  // Definición del formulario
  formGroup!: FormGroup;

  // Variable para almacenar la respuesta en formato XML
  xml = '';

  // Arreglo que almacena las capas obtenidas del servicio WMS
  layers: WMSLayer[] = [];

  // Variable para mostrar búsqueda y volver al formulario
  urlValid = false;

  // Variable para almacenar la URL ingresada por el usuario
  url = '';
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private urlWMSService: UrlWMSService,
    private mapStore: Store<MapState>
  ) {}

  /**
   * Inicializa el formulario con los campos requeridos.
   */
  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      // Campo para la URL del servicio WMS, obligatorio y debe seguir el formato de una URL válida
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],

      // Campo para almacenar la capa seleccionada
      selectedLayers: [null, [Validators.required]],
    });
  }

  /**
   * Método encargado de obtener las capabilities del servicio WMS ingresado en el formulario.
   * Realiza una petición HTTP al servicio WMS y transforma la respuesta en XML.
   */
  searchLayers() {
    this.loading = true;
    const urlControl = this.formGroup.get('url');

    if (urlControl) {
      urlControl.markAsTouched(); // Marca el campo como "tocado"
      urlControl.updateValueAndValidity(); // Refresca la validación
    }
    // Obtiene el valor de la URL ingresada en el formulario
    this.url = this.formGroup.get('url')?.value;
    if (this.formGroup.get('url')?.valid) {
      // Llama al servicio para obtener las capas del WMS
      this.urlWMSService
        .getLayersFromWMS(this.url)
        .then(layers => {
          this.layers = layers;
          this.urlValid = true;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          console.error('Error al buscar las capas:', error);
        });
    } else {
      this.loading = false;
    }
  }

  /**
   * Método para volver al formulario y reiniciar la búsqueda
   */
  comeBack() {
    this.urlValid = false;
    this.formGroup.reset();
  }

  /**
   * Método para agregar una capa seleccionada al mapa
   */
  addLayer() {
    this.loading = true;

    const urlControl = this.formGroup.get('selectedLayers');

    if (urlControl) {
      urlControl.markAsTouched(); // Marca el campo como "tocado"
      urlControl.updateValueAndValidity(); // Refresca la validación
    }

    // Obtener la capa seleccionada del formulario
    const selectedLayer = this.formGroup.get('selectedLayers')?.value;
    if (!selectedLayer) {
      console.error('No se ha seleccionado ninguna capa.');
      this.loading = false;
      return;
    } else {
      // limpiar url
      const baseUrl = this.formGroup.get('url')?.value.split('?')[0];

      const Capa: CapaMapa = {
        id: selectedLayer?.Name || 'N/A',
        titulo: selectedLayer?.displayName || 'Sin título',
        leaf: true,
        descripcionServicio: selectedLayer.descripcionServicio,
        urlMetadatoServicio: selectedLayer?.Abstract?.metadataURL || '',
        tipoServicio: 'WMS',
        wfs: selectedLayer.wfs,
        urlMetadato: selectedLayer?.Abstract?.metadataURL || '',
        nombre: selectedLayer?.Name || 'Sin nombre',
        descargaCapa: selectedLayer.descargaCapa,
        url: baseUrl,
        estadoServicio: selectedLayer.estadoServicio,
        idInterno: Math.floor(Math.random() * 10000),
        checked: selectedLayer.checked,
        urlServicioWFS: selectedLayer.urlServicioWFS,
        origin: 'external',
      };
      // Agregar la capa al store de NgRx
      this.addLayerToStore(Capa);
      this.loading = false;
    }
  }

  /**
   * Método para agregar la capa al store de NgRx
   * @param layerMap definición de la capa
   */
  private addLayerToStore(layerMap: CapaMapa): void {
    const layerToStore: LayerStore = {
      isVisible: true,
      layerDefinition: layerMap,
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 0,
      transparencyLevel: 0,
    };
    // Disparar acción para agregar la capa al estado global
    this.mapStore.dispatch(MapActions.addLayerToMap({ layer: layerToStore }));
  }
}
