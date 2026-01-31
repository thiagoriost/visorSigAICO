import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { WindowTablaAtributosComponent } from './window-tabla-atributos.component';

describe('WindowTablaAtributosComponent', () => {
  let component: WindowTablaAtributosComponent;
  let fixture: ComponentFixture<WindowTablaAtributosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindowTablaAtributosComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(WindowTablaAtributosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
