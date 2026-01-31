import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { selectVisibleLayers } from '@app/core/store/map/map.selectors';
import { SwipeMapService } from '@app/widget/swipe/services/swipe-map.service';
import * as SwipeActions from '../../store/swipe.actions';
import { AlertService } from '@app/widget/swipe/services/alert.service';
import { selectSwipeActivo } from '../../store/swipe.selectors';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-swipe',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, Select],
  templateUrl: './swipe.component.html',
  styleUrls: ['./swipe.component.scss'],
})
export class SwipeComponent {
  capasVisibles$: Observable<LayerStore[]>;
  capaSeleccionadaId: string | null = null;
  swipeActivo$: Observable<boolean>; //...

  constructor(
    private store: Store,
    private swipeMapService: SwipeMapService,
    private alert: AlertService
  ) {
    this.capasVisibles$ = this.store.select(selectVisibleLayers);
    this.swipeActivo$ = this.store.select(selectSwipeActivo); //...
  }

  onSeleccionarCapa(id: string | null) {
    this.store.dispatch(SwipeActions.seleccionarCapa({ capaId: id }));
  }
  activarSwipe() {
    this.store.dispatch(SwipeActions.intentarActivarSwipe());
  }
  desactivarSwipe() {
    this.store.dispatch(SwipeActions.desactivarSwipe());
  }
}
