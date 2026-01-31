// sidebar-gm.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

import { SidebarGmComponent } from './sidebar-gm.component';

describe('SidebarGmComponent', () => {
  let component: SidebarGmComponent;
  let fixture: ComponentFixture<SidebarGmComponent>;

  // Store dummy (por si el componente lo inyecta)
  const storeSpy = jasmine.createSpyObj<Store>('Store', ['select', 'dispatch']);
  storeSpy.select.and.returnValue(of(null));
  storeSpy.dispatch.and.stub();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarGmComponent, NoopAnimationsModule], // standalone
      providers: [{ provide: Store, useValue: storeSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarGmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
