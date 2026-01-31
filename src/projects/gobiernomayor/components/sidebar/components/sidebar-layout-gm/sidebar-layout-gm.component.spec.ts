// sidebar-layout-gm.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

import { SidebarLayoutGmComponent } from './sidebar-layout-gm.component';

describe('SidebarLayoutGmComponent', () => {
  let component: SidebarLayoutGmComponent;
  let fixture: ComponentFixture<SidebarLayoutGmComponent>;

  // Store dummy (solo si el componente lo requiere; no molesta si no)
  const storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
  storeSpy.select.and.returnValue(of(null));
  storeSpy.dispatch.and.stub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarLayoutGmComponent, NoopAnimationsModule], // standalone
      providers: [{ provide: Store, useValue: storeSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarLayoutGmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
