import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { BotonConfigModel } from '@app/widget-ui/components/botoneraVertical/interfaces/boton-config.model';
import { BotoneraVerticalComponent } from '@app/widget-ui/components/botoneraVertical/components/botonera-vertical/botonera-vertical.component';

import {
  SetSingleComponentWidget,
  AbrirOverlayWidget,
} from '@app/core/store/user-interface/user-interface.actions';

interface BotoneraSeleccionEvent {
  opcionId?: string;
  botonId?: string;
  id?: string;
}

@Component({
  selector: 'app-floating-menu',
  standalone: true,
  imports: [BotoneraVerticalComponent],
  templateUrl: './floating-menu.component.html',
  styleUrl: './floating-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingMenuComponent implements OnChanges {
  @Input() isMobile = false;

  /** Si necesitas depurar, ponlo en true temporalmente */
  private readonly debug = false;

  menuOpciones: BotonConfigModel[] = [];

  constructor(
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>
  ) {
    this.rebuildMenu();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isMobile']) this.rebuildMenu();
  }

  private rebuildMenu(): void {
    const base: BotonConfigModel[] = [
      {
        id: 'ExportarMapa5',
        icono: 'icon-gm_salida_grafica',
        texto: 'Salida gráfica',
      },
      { id: 'Identify', icono: 'icon-gm_identificar', texto: 'Identificar' },
    ];

    if (this.isMobile) {
      base.push({ id: 'Leyenda', icono: 'pi pi-bookmark', texto: 'Leyenda' });
    }

    this.menuOpciones = base;

    if (this.debug) {
      console.log(
        '[FloatingMenu] menuOpciones:',
        this.menuOpciones.map(b => b.id)
      );
    }
  }

  onKeydownSwallow(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault(); // evita scroll con Space
      this.swallow(ev);
    }
  }

  swallow(ev: Event): void {
    ev.stopPropagation();
    if (this.debug) console.log('[FloatingMenu] swallow:', ev.type);
  }

  onSeleccion(event: BotoneraSeleccionEvent): void {
    const id = event.opcionId ?? event.botonId ?? event.id;
    if (!id) return;

    if (id === 'ExportarMapa5') {
      this.userInterfaceStore.dispatch(
        AbrirOverlayWidget({ nombre: id, estado: false })
      );
      setTimeout(() => {
        this.userInterfaceStore.dispatch(
          AbrirOverlayWidget({ nombre: id, estado: true })
        );
      }, 150);
      return;
    }

    this.userInterfaceStore.dispatch(SetSingleComponentWidget({ nombre: id }));
  }
}
