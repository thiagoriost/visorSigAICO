import { Component } from '@angular/core';
import { BaseMapComponent } from '@app/widget/baseMap/Components/base-map/base-map.component';
// ==== ENUMS ====
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';

@Component({
  selector: 'app-base-map-aiso',
  imports: [BaseMapComponent],
  templateUrl: './base-map-aiso.component.html',
  styleUrl: './base-map-aiso.component.css',
})
export class BaseMapAisoComponent {
  public readonly MapasBase = MapasBase;
}
