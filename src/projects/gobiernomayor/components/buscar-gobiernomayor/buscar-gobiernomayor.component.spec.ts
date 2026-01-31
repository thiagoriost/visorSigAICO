import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarGobiernomayorComponent } from './buscar-gobiernomayor.component';

describe('BuscarGobiernomayorComponent', () => {
  let component: BuscarGobiernomayorComponent;
  let fixture: ComponentFixture<BuscarGobiernomayorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarGobiernomayorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BuscarGobiernomayorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
