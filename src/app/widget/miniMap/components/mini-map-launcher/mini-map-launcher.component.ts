import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';

import { MiniMapComponent } from '../mini-map/mini-map.component';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-mini-map-launcher',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MiniMapComponent,
    CardModule,
    InputTextModule,
    CheckboxModule,
    SelectModule,
    ToggleSwitchModule,
  ],
  templateUrl: './mini-map-launcher.component.html',
  styleUrls: ['./mini-map-launcher.component.scss'],
})
export class MiniMapLauncherComponent implements OnInit {
  buttonIcon = 'pi pi-eye';
  buttonRounded = true;
  buttonSize?: 'small' | 'large';
  mapContainerClass?: string;

  mapPosition:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'left-top'
    | 'right-top'
    | 'left-bottom'
    | 'right-bottom' = 'top-left';

  width = '12rem';
  height = '12rem';

  isPanEnabled = false;

  mapasBaseOptions: { label: string; value: MapasBase }[] = [];
  baseMap: MapasBase = MapasBase.GOOGLE_SATELLITE;

  positionOptions = [
    { label: 'Top Left', value: 'top-left' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Right', value: 'bottom-right' },
    { label: 'Left Top', value: 'left-top' },
    { label: 'Right Top', value: 'right-top' },
    { label: 'Left Bottom', value: 'left-bottom' },
    { label: 'Right Bottom', value: 'right-bottom' },
  ];

  sizeOptions = [
    { label: 'Default', value: undefined },
    { label: 'Small', value: 'small' },
    { label: 'Large', value: 'large' },
  ];

  constructor(private mapaBaseService: MapaBaseService) {}

  ngOnInit(): void {
    this.mapasBaseOptions = this.mapaBaseService.getAllMapOptions();
  }
}
