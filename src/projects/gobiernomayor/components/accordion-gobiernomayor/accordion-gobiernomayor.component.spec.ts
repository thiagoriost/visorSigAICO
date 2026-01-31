import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { AccordionGobiernoMayorComponent } from './accordion-gobiernomayor.component';
import { LayerDefinitionsService } from '@app/shared/services/layer-definitions-service/layer-definitions.service';
import * as mapsSelectors from '@app/core/store/map/map.selectors';

describe('AccordionGobiernoMayorComponent', () => {
  let fixture: ComponentFixture<AccordionGobiernoMayorComponent>;
  let component: AccordionGobiernoMayorComponent;
  let store: MockStore;
  let layerDefsSpy: jasmine.SpyObj<LayerDefinitionsService>;

  beforeEach(async () => {
    layerDefsSpy = jasmine.createSpyObj<LayerDefinitionsService>(
      'LayerDefinitionsService',
      ['getAllAvailableLayers']
    );
    // La tabla carga capas en ngOnInit; devolvemos lista vacía
    layerDefsSpy.getAllAvailableLayers.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [AccordionGobiernoMayorComponent, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: {} }),
        { provide: LayerDefinitionsService, useValue: layerDefsSpy },
      ],
    }).compileComponents();

    // Forzamos el selector a emitir []
    store = TestBed.inject(MockStore);
    store.overrideSelector(mapsSelectors.selectWorkAreaLayerList, []);

    fixture = TestBed.createComponent(AccordionGobiernoMayorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
