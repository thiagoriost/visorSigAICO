import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {
  ItemWidgetState,
  UserInterfaceState,
} from '@app/core/interfaces/store/user-interface.model';
import { Observable } from 'rxjs';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { Store } from '@ngrx/store';
import {
  selectWidgetOpened,
  selectWidgetsUserInterfaceStatus,
} from '@app/core/store/user-interface/user-interface.selectors';
import { PanelWindowComponent } from './panel-window/panel-window.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PatronesComponent } from '@projects/opiac/patrones/patrones.component';

import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { WindowSingleComponentRenderComponent } from '@app/widget-ui/components/window-single-component-render/window-single-component-render.component';
import { selectWidgetAbierto } from '@app/core/store/user-interface/user-interface.selectors';
import { take } from 'rxjs';
import { SelectModule } from 'primeng/select';

/**
 * @description Este componente es responsable de gestionar y mostrar los widgets abiertos en la interfaz de usuario.
 * Utiliza NgRx Store para seleccionar el estado de los widgets y el servicio UserInterfaceService
 * para gestionar la visibilidad de los widgets.
 * Se realiza cambio para manejar los wdigets a través de una lista desplegable 30-04-2025
 * @author Carlos Javier Muñoz Fernández
 * @date 05/12/2024
 * @class PanelComponent
 */
@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    PanelWindowComponent,
    ToastModule,
    ReactiveFormsModule,
    PatronesComponent,
    WindowSingleComponentRenderComponent,
    SelectModule,
  ],
  providers: [MessageService],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnInit {
  widgetForm: FormGroup;
  /**
   * Observable que contiene los widgets abiertos.
   * Se suscribe al selector `selectWidgetOpened` del store de NgRx.
   */
  widgetsAbiertos$: Observable<ItemWidgetState[]>;

  itemsList: ItemWidgetState[] = [];

  constructor(
    private userInterfaceService: UserInterfaceService,
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private store: Store
  ) {
    this.widgetForm = this.formBuilder.group({});
    this.widgetsAbiertos$ = this.userInterfaceStore.select(selectWidgetOpened);
    this.userInterfaceStore
      .select(selectWidgetsUserInterfaceStatus)
      .subscribe(widgetList => {
        this.itemsList = widgetList;
      });
  }
  ngOnInit(): void {
    this.widgetForm = this.formBuilder.group({
      widgetName: ['', [Validators.required], []],
    });
  }

  /**
   * Metodo para abrir un widget
   * @param widgetName Widget a abrir
   */

  async addWidget() {
    if (this.widgetForm.valid) {
      const widget = this.widgetForm.get('widgetName')?.value as string;
      this.store
        .select(selectWidgetAbierto(widget))
        .pipe(take(1))
        .subscribe(yaAbierto => {
          if (yaAbierto) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Ya activo',
              detail: `El widget "${widget}" ya está activo.`,
              life: 3000,
            });
          } else {
            console.log('Widget: ', widget);
            this.userInterfaceService.cambiarVisibleWidget(widget, true);
            this.userInterfaceStore.dispatch(
              SetSingleComponentWidget({ nombre: widget })
            );
          }
          this.widgetForm.reset();
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar un widget',
        life: 3000,
      });
    }
  }
}
