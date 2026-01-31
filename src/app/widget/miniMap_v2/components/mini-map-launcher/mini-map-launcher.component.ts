import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';

import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';
import { MiniMapV2Component } from '@app/widget/miniMap_v2/components/mini-map-v2/mini-map-v2.component';

@Component({
  selector: 'app-mini-map-launcher',
  standalone: true,
  imports: [
    SelectModule,
    ReactiveFormsModule,
    FormsModule,
    ToggleSwitchModule,
    InputTextModule,
    ButtonModule,
    MiniMapV2Component,
    CardModule,
  ],
  templateUrl: './mini-map-launcher.component.html',
  styleUrls: ['./mini-map-launcher.component.scss'],
})
export class MiniMapLauncherComponent implements OnInit {
  formGroupLauncher!: FormGroup;
  mostrarMapa = false;

  mapasBaseOptions: { label: string; value: MapasBase }[] = [];
  variantOptions = [
    { label: 'Header', value: 'header' },
    { label: 'Button', value: 'button' },
  ];
  positionOptions = [
    { label: 'Top Left', value: 'top-left' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Right', value: 'bottom-right' },
  ];
  buttonPositionOptions = this.positionOptions;
  buttonSizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Normal', value: undefined },
    { label: 'Large', value: 'large' },
  ];

  buttonRoundedOptions = [
    { label: 'Sí', value: true },
    { label: 'No', value: false },
  ];

  severityOptions = [
    { label: 'Default', value: undefined },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Success', value: 'success' },
    { label: 'Info', value: 'info' },
    { label: 'Warn', value: 'warn' },
    { label: 'Help', value: 'help' },
    { label: 'Danger', value: 'danger' },
    { label: 'Contrast', value: 'contrast' },
  ];

  constructor(
    private fb: FormBuilder,
    private mapaBaseService: MapaBaseService
  ) {}

  ngOnInit(): void {
    this.mapasBaseOptions = this.mapaBaseService.getAllMapOptions();

    this.formGroupLauncher = this.fb.group({
      baseMap: [MapasBase.GOOGLE_SATELLITE],
      mapPosition: ['top-left'],
      variant: ['header'],
      buttonPosition: ['top-right'],
      buttonSize: ['normal'],
      buttonIcon: ['pi pi-eye'],
      closeButtonIcon: ['pi pi-minus'],
      severity: [undefined],
      closeButtonSeverity: [undefined],
      headerButtonSeverity: ['secondary'],
      buttonRounded: [true],
      width: ['12rem'],
      height: ['12rem'],
      headerClass: [''],
      bodyClass: [''],
      isPanEnabled: [false],
      headerTitle: [''],
    });
  }

  generarMiniMapa(): void {
    this.mostrarMapa = false;
    setTimeout(() => (this.mostrarMapa = true), 100);
  }
}
